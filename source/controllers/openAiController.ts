import { Request, Response, NextFunction } from 'express';
import { getHaikuOptionsForTitle } from '../helpers/openAi';

const putHaikusFromTitle = async (request: Request, response: Response, next: NextFunction) => {

    try {

        const haikuOptions = await getHaikuOptionsForTitle(request.body.haikuTitle);

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