import { Request, Response, NextFunction } from 'express';
import Arweave from 'arweave';
import ArLocal from 'arlocal';
import fs from 'fs';
import axios from 'axios';
import { ARWEAVE_KEY, ENVIRONMENT } from '../utils/secrets';
import { JWKInterface } from 'arweave/node/lib/wallet';

let arweave: Arweave

if (ENVIRONMENT === 'production') {
    arweave = Arweave.init({ host: 'arweave.net' })
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

    let data = fs.readFileSync('./source/assets/doge.jpg');

    let transaction = await arweave.createTransaction({ data: data }, key);

    transaction.addTag('Content-Type', 'application/jpg');
    transaction.addTag('App-Name', 'eth-arweave-basee');
    transaction.addTag('App-Version', '0.0.1');
    transaction.addTag('Unix-Time', Date.now().toString());

    await arweave.transactions.sign(transaction, key);

    let uploader = await arweave.transactions.getUploader(transaction);

    while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }

    return res.status(200).json({
        message: 'you said: ' + req.body.data,
        txnId: transaction.id,
    });
};

const getImageFromArweaveTxn = async (req: Request, res: Response, next: NextFunction) => {
    if (ENVIRONMENT !== 'production') {
        // Mine a block on ArLocal
        await axios.get('http://localhost:1984/mine');
    }

    const result = await arweave.transactions.getData(req.params.txnId);

    return res.status(200).json({
        image: result,
    });

}

export default { getArweave, putArweave, getImageFromArweaveTxn };