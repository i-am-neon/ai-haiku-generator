import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { recoverPersonalSignature } from 'eth-sig-util'
import crypto from 'crypto';
import Arweave from 'arweave';
import User, { UserInterface } from '../models/User';
import session from 'express-session';
import { Document } from 'mongoose';

declare module 'express-session' {
    export interface SessionData {
        nonce: number;
    }
}

const arweave = Arweave.init({ host: 'arweave.net' })

const getNonce = async (req: Request, res: Response, next: NextFunction) => {
    const nonce = crypto.randomInt(111111, 999999);
    const hashedWalletAddress = await bcrypt.hash(req.params.address, 10);

    User.findOne({ hashedWalletAddress }, async (err: Error, doc: any) => {
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
            console.log('Creating mongo user for wallet: ' + req.params.address);
            const newUser = new User({
                walletAddreess: hashedWalletAddress,
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
    console.log('req.session :>> ', req.session);
    const { address, signature } = req?.body;
    if (!address || !signature || typeof address !== 'string' || typeof signature !== 'string') {
        return res.status(401).json({
            message: 'Login failed.'
        });
    }

    const hashedWalletAddress = await bcrypt.hash(req.body.address, 10);
    var nonce: number;
    User.findOne({ hashedWalletAddress }, async (err: Error, doc: any) => {
        if (err) {
            return res.status(401).json({
                message: 'Login failed.'
            });
        } else if (doc) {
            // User exists.
            console.log('doc :>> ', doc);
            console.log('doc.nonce :>> ', doc.nonce);
            nonce = doc.nonce;
            console.log('nonce (it should be assigned) :>> ', nonce);
            const recoveredSignature = recoverPersonalSignature({ data: getSignMessageWithNonce(nonce), sig: req.body.signature }).toLowerCase();
            console.log('req.body.address :>> ', req.body.address);
            console.log('signature :>> ', recoveredSignature);
            if (req.body.address.toLowerCase() !== recoveredSignature) {
                return res.status(401).json({
                    message: 'Login failed.'
                });
            } else {
                return res.status(200).json({
                    message: 'You son of a bitch, you\'re in!'
                });
            }
        } else {
            // User does not yet exist. Create one
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
    return res.status(200).json({
        message: 'you said: ' + req.body.data
    });
};

const getSignMessageWithNonce = (nonce: number | undefined): string => {
    console.log('nonce (getSignMessageWithNonce()) :>> ', nonce);
    return `Sign this message to prove you have access to this wallet. This is to protect our site against bad actors and does not cost you anything.
    \n\nSecurity code (you can ignore this): ${nonce}`
}


export default { getArweave, putArweave, login, getNonce };