import { Request, Response, NextFunction } from 'express';
import { recoverPersonalSignature } from 'eth-sig-util'
import crypto from 'crypto';
import Arweave from 'arweave';
import User from '../models/User';
import { encodeSession } from '../helpers/jwt';
import { SESSION_SECRET } from '../utils/secrets';
import ArLocal from 'arlocal';
import fs from 'fs';
import axios from 'axios';

declare module 'express-session' {
    export interface SessionData {
        nonce: number;
    }
}

// To do:
// - make local vs mainnet arweave an env variable
// - move ArLocal to dev dependencies in package.json
// const arweave = Arweave.init({ host: 'arweave.net' })
let arweave: Arweave
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

const getNonce = async (req: Request, res: Response, next: NextFunction) => {
    const nonce = crypto.randomInt(111111, 999999);
    const address = req.params.address;
    User.findOne({ walletAddress: address }, async (err: Error, doc: any) => {
        if (err) {
            return res.status(401).json({
                message: 'Login failed.'
            });
        } else if (doc) {
            // User exists. Update Nonce
            doc.nonce = nonce;
            doc.save();
        } else {
            // User does not yet exist. Create one
            console.log('Creating mongo user for wallet: ' + address);
            const newUser = new User({
                walletAddress: address,
                nonce: nonce,
                unsuccessfulMintTries: 0
            })
            await newUser.save();
        }
    })

    console.log('req.session :>> ', req.session);
    return res.status(200).json({
        message: getSignMessageWithNonce(nonce)
    });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    const { address, signature } = req?.body;
    if (!address || !signature || typeof address !== 'string' || typeof signature !== 'string') {
        return res.status(401).json({
            message: 'Login failed.'
        });
    }

    var nonce: number;
    User.findOne({ walletAddress: address }, async (err: Error, doc: any) => {
        if (err) {
            return res.status(401).json({
                message: 'Login failed.'
            });
        } else if (doc) {
            // User exists.
            nonce = doc.nonce;
            const recoveredSignature = recoverPersonalSignature({ data: getSignMessageWithNonce(nonce), sig: req.body.signature }).toLowerCase();
            if (req.body.address.toLowerCase() !== recoveredSignature) {
                return res.status(401).json({
                    message: 'Login failed.'
                });
            } else {
                const session = encodeSession(SESSION_SECRET!, {
                    id: 123,
                    username: "some user",
                    dateCreated: Date.now()
                });

                res.status(201).json(session);
            }
        } else {
            // User does not exist.
            console.error('user does not exist yet (This should happen at the /nonce endpoint): ' + req.params.address);
            return res.status(401).json({
                message: 'Login failed.'
            });
        }
    })
};

const getArweave = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        message: arweave
    });
};

const putArweave = async (req: Request, res: Response, next: NextFunction) => {
    let key = await arweave.wallets.generate();

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


    // Decode tags from transactions
    // await arweave.transactions.get(transaction.id).then(t => {
    //     t.get('tags').forEach(tag => {
    //         let key = tag.get('name', { decode: true, string: true });
    //         let value = tag.get('value', { decode: true, string: true });
    //         console.log(`${key} : ${value}`);
    //     });
    // });

    return res.status(200).json({
        message: 'you said: ' + req.body.data,
        txnId: transaction.id,
    });
};

const getImageFromArweaveTxn = async (req: Request, res: Response, next: NextFunction) => {
    // Mine a block to get that transaction güd
    // Add if statement for env=dev
    await axios.get('http://localhost:1984/mine');

    const result = await arweave.transactions.getData(req.params.txnId);

    return res.status(200).json({
        image: result,
    });

}



const getSignMessageWithNonce = (nonce: number | undefined): string => {
    console.log('nonce (getSignMessageWithNonce()) :>> ', nonce);
    return `Sign this message to prove you have access to this wallet. This is to protect our site against bad actors and does not cost you anything.
    \n\nSecurity code (you can ignore this): ${nonce}`
}


export default { getArweave, putArweave, login, getNonce, getImageFromArweaveTxn };