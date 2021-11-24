import { Request, Response, NextFunction } from 'express';

const putHaikusFromTitle = async (request: Request, response: Response, next: NextFunction) => {

    try {

        const haiku1 = `They’re born in pixel caves,\n\ndemon networks weave but can be undone.\n\nCryptocurrency hackers do the math`

        const haiku2 = `The soft wind blows\nthrough the blossoms of cherry trees.\nSigma sharks, attack!`

        const haiku3 = `A cloudless night\nThe Milky Way showers me\nWith its starry dew.`

        return response.status(201).json({
            haikus: [
                haiku1,
                haiku2,
                haiku3
            ]
        });
    } catch (error) {
        return response.status(500);
    }
}

export default { putHaikusFromTitle };