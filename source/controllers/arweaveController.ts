import { Request, Response, NextFunction } from 'express';
import Arweave from 'arweave';

const arweave = Arweave.init({ host: 'arweave.net' })

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


export default { getArweave, putArweave };