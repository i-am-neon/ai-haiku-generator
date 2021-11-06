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


const getArweave = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        message: arweave
    });
};

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

    const tx = await arweave.createTransaction({ data }, key);

    tx.addTag('Content-Type', contentType);

    await arweave.transactions.sign(tx, key);

    const result = await arweave.transactions.post(tx);

    if (ENVIRONMENT !== 'production') {
        // Mine a block on ArLocal
        await axios.get('http://localhost:1984/mine');
    }

    const status = await arweave.transactions.getStatus(tx.id);
    console.log('status :>> ', status);
    console.log(`Transaction ${tx.id} status code is ${status.status}`);

    const imageURI = ENVIRONMENT === 'production' ? 'https://arweave.net/' + tx.id : 'http://localhost:1984/' + tx.id;

    if (status.status >= 200 && status.status < 300) {
        return res.status(201).json({
            message: 'you said: ' + req.body.data,
            txnId: tx.id,
            imageURI
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

export default { getArweave, putArweave, getStatusForArweaveTxn };