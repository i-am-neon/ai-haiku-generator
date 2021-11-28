import { Request, Response, NextFunction } from 'express';
import Arweave from 'arweave';
import ArLocal from 'arlocal';
import axios from 'axios';
import web3 from 'web3';
import { ENVIRONMENT, ETH_SIGNER_PRIVATE_KEY } from '../utils/secrets';
import { getArweaveKey, saveImageToArweave, saveMetadataToArweave, signMessage } from '../helpers/arweave';
import { generateHaiku } from '../utils/generator';
import { PUBLIC_MINT_TIMESTAMP_MS, whitelistedAddresses, WHITELIST_MINT_TIMESTAMP_MS } from '../utils/whitelist';

let arweave: Arweave
const web3Instance = new web3();

if (ENVIRONMENT === 'production') {
    arweave = Arweave.init({
        host: 'arweave.net',
        protocol: 'https',
        port: 443,
    })
    console.log('connected to Arweave mainnet. Careful, you\'re playing with real money here!');
} else {
    const arLocal = new ArLocal();
    (async () => {
        // Start is a Promise, we need to start it inside an async function.
        await arLocal.start();

        arweave = Arweave.init({
            host: 'localhost',
            port: 1984,
            protocol: 'http'
        })
    })();
}

const putArweave = async (req: Request, res: Response, next: NextFunction) => {
    const haikuTitle = req.body.haikuTitle;
    const haikuContent = req.body.haikuContent;
    // If address is sent, that means user is whitelisted
    const address = req.body.address;

    if ( address && !whitelistedAddresses.includes(address)) {
        return res.status(403).json({
            message: 'Address not whitelisted.'
        });
    }

    // NEON is super user
    if (Date.now() < WHITELIST_MINT_TIMESTAMP_MS && address !== '0x915D8f12f523273c814D51e29962fdcb49ad36d5') {
        return res.status(400).json({
            message: 'The time has not come to mint.'
        });
    }

    const { finalImagePath, paperName } = await generateHaiku(
        haikuTitle,
        haikuContent
    );


    const key = await getArweaveKey(arweave);

    const { imageUri, imageResponseStatus } = await saveImageToArweave(arweave, key, finalImagePath);

    if (imageResponseStatus >= 400) {
        return res.status(500);
    }

    const {
        metadataUri,
        metadataTxnId,
        metadataResponseStatus,
    } = await saveMetadataToArweave(
        arweave,
        key,
        imageUri,
        haikuTitle,
        haikuContent,
        paperName
    );

    if (metadataResponseStatus >= 400) {
        return res.status(500);
    }

    try {
        const useWhitelist = address && Date.now() < PUBLIC_MINT_TIMESTAMP_MS;
        let signedMessage;
        if (useWhitelist) {
            signedMessage = signMessage(web3Instance, 'Whitelisted:' + metadataUri);
        } else {
            signedMessage = signMessage(web3Instance, metadataUri);
        }
        console.log(`signedMessage`, signedMessage);
        return res.status(201).json({
            txnId: metadataTxnId,
            metadataUri,
            imageUri,
            paperName,
            signature: signedMessage.signature,
            useWhitelist
        });

    } catch (error) {
        return res.status(500);
    }

};

const getStatusForArweaveTxn = async (request: Request, response: Response, next: NextFunction) => {
    if (ENVIRONMENT !== 'production') {
        // Mine a block on ArLocal
        await axios.get('http://localhost:1984/mine');
    }

    await arweave.transactions.getStatus(request.params.txnId)
        .then(result => {
            return response.status(200).json({
                status: result,
            });
        })
        .catch(error => {
            console.error(error);
            return response.status(500);
        });


}

export default { putArweave, getStatusForArweaveTxn };
