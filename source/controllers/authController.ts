import { Request, Response, NextFunction } from 'express';
import { recoverPersonalSignature } from 'eth-sig-util'
import crypto from 'crypto';
import User from '../models/User';
import { encodeSession } from '../helpers/jwt';
import { SESSION_SECRET } from '../utils/secrets';

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
                    id: nonce,
                    username: address,
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

const getSignMessageWithNonce = (nonce: number | undefined): string => {
    console.log('nonce (getSignMessageWithNonce()) :>> ', nonce);
    return `Sign this message to prove you have access to this wallet. This is to protect our site against bad actors and does not cost you anything.
    \n\nSecurity code (you can ignore this): ${nonce}`
}


export default { getNonce, login };