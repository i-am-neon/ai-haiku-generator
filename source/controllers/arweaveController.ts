import { Request, Response, NextFunction } from 'express';
import Arweave from 'arweave';
import ArLocal from 'arlocal';
import fs from 'fs';
import fsAsync from 'fs/promises';
import fileType from 'file-type';
import axios from 'axios';
import { ARWEAVE_KEY, ENVIRONMENT } from '../utils/secrets';
import { JWKInterface } from 'arweave/node/lib/wallet';

let arweave: Arweave

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
    let key: JWKInterface;
    if (ENVIRONMENT === 'production') {
        key = ARWEAVE_KEY;
    } else {
        key = await arweave.wallets.generate();
    }

    const data = await fsAsync.readFile('./source/assets/doge.jpg');
    const mediaType = await fileType.fromBuffer(data);
    const contentType: string = (mediaType && mediaType.mime) ? mediaType.mime : 'image/jpeg';

    const imageTx = await arweave.createTransaction({ data }, key);

    imageTx.addTag('Content-Type', contentType);

    await arweave.transactions.sign(imageTx, key);

    await arweave.transactions.post(imageTx);

    if (ENVIRONMENT !== 'production') {
        // Mine a block on ArLocal
        await axios.get('http://localhost:1984/mine');
    }

    const status = await arweave.transactions.getStatus(imageTx.id);
    console.log('status :>> ', status);
    console.log(`Transaction to upload image: ${imageTx.id} status code is ${status.status}`);

    const imageURI = ENVIRONMENT === 'production' ? 'https://arweave.net/' + imageTx.id : 'http://localhost:1984/' + imageTx.id;

    if (status.status >= 400) {
        return res.status(500);
    }

    const metadata = {
        "description": "Just your average dog living immutably on the blockchain.",
        "image": imageURI,
        "name": "THIS DOGE IS ON FIREEEE 🔥",
        "attributes": [
            {
                "trait_type": "Power Level",
                "value": "9,001"
            },
            {
                "trait_type": "Message from frontend",
                "value": req.body.data
            }
        ],
    }

    let metadataTx = await arweave.createTransaction({
        data: JSON.stringify(metadata)
    }, key);

    metadataTx.addTag('Content-Type', 'text/json');

    await arweave.transactions.sign(metadataTx, key);

    await arweave.transactions.post(metadataTx);

    const metadataStatus = await arweave.transactions.getStatus(metadataTx.id);
    console.log('metadataStatus :>> ', metadataStatus);
    console.log(`Transaction to upload metadata: ${imageTx.id} status code is ${metadataStatus.status}`);

    const metadataUri = ENVIRONMENT === 'production' ? 'https://arweave.net/' + metadataTx.id : 'http://localhost:1984/' + metadataTx.id;


    if (metadataStatus.status >= 200 && status.status < 300) {
        return res.status(201).json({
            txnId: metadataTx.id,
            metadataUri
        });
    } else {
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