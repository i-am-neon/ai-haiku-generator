import { Request, Response, NextFunction } from 'express';
import { getHaikuOptionsForTitle } from '../helpers/openAi';

const putHaikusFromTitle = async (request: Request, response: Response, next: NextFunction) => {
    const haikuTitle = request.body.haikuTitle;
    const walletAddress = request.body.address;
    console.log(`walletAddress`, walletAddress)
    try {

        const haikuOptions = await getHaikuOptionsForTitle(haikuTitle, walletAddress);

        return response.status(201).json({
            haikus: [
                haikuOptions[0],
                haikuOptions[1],
                haikuOptions[2]
            ]
        });
    } catch (error) {
        return response.status(500);
    }
}

export default { putHaikusFromTitle };