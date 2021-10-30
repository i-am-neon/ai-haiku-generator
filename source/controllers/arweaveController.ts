import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';
import Arweave from 'arweave';

const arweave = Arweave.init({ host: 'arweave.net' })

const getArweave = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        message: arweave
    });
};

export default { getArweave };