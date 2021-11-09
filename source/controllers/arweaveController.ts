import { Request, Response, NextFunction } from 'express';
import Arweave from 'arweave';
import ArLocal from 'arlocal';
import axios from 'axios';
import web3 from 'web3';
import { ENVIRONMENT, ETH_SIGNER_PRIVATE_KEY } from '../utils/secrets';
import { getArweaveKey, saveImageToArweave, saveMetadataToArweave, signMessage } from '../helpers/arweave';

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

    const key = await getArweaveKey(arweave);

    const pathToLocalImage = './source/assets/doge.jpg';

    const { imageUri, imageResponseStatus } = await saveImageToArweave(arweave, key, pathToLocalImage);

    if (imageResponseStatus >= 400) {
        return res.status(500);
    }

    const { metadataUri, metadataTxnId, metadataResponseStatus } = await saveMetadataToArweave(arweave, key, imageUri, req.body.data);

    if (metadataResponseStatus >= 400) {
        return res.status(500);
    }

    try {
        const signedMessage = signMessage(web3Instance, metadataUri);

        return res.status(201).json({
            txnId: metadataTxnId,
            metadataUri,
            signature: signedMessage.signature
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
