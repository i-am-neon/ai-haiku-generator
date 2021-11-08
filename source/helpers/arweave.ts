import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import axios from "axios";
import fsAsync from 'fs/promises';
import fileType from 'file-type';
import { ARWEAVE_KEY, ENVIRONMENT, ETH_SIGNER_PRIVATE_KEY } from "../utils/secrets";
import Web3 from "web3";

export interface saveImageToArweaveResponse {
    imageUri: string,
    imageResponseStatus: number
}

export interface saveMetadataToArweaveResponse {
    metadataUri: string,
    metadataTxnId: string,
    metadataResponseStatus: number
}

export const getArweaveKey = async (arweave: Arweave): Promise<JWKInterface> => {
    let key: JWKInterface;
    if (ENVIRONMENT === 'production') {
        key = ARWEAVE_KEY;
    } else {
        key = await arweave.wallets.generate();
    }
    return key;
}

export const saveImageToArweave = async (arweave: Arweave, key: JWKInterface): Promise<saveImageToArweaveResponse> => {

    let imageUri: string;
    let status: number;

    try {
        const data = await fsAsync.readFile('./source/assets/doge.jpg');
        const mediaType = await fileType.fromBuffer(data);
        const contentType: string = (mediaType && mediaType.mime) ? mediaType.mime : 'image/jpeg';

        const imageTx = await arweave.createTransaction({ data }, key);

        imageTx.addTag('Content-Type', contentType);

        await arweave.transactions.sign(imageTx, key);

        await arweave.transactions.post(imageTx);

        if (ENVIRONMENT !== 'production') {
            // Mine a block on ArLocal
            await axios.get('http://localhost:1984/mine');
        }

        status = await arweave.transactions.getStatus(imageTx.id).then(s => s.status);

        imageUri = ENVIRONMENT === 'production' ? 'https://arweave.net/' + imageTx.id : 'http://localhost:1984/' + imageTx.id;

    } catch (error) {
        imageUri = '';
        status = 500;
    }


    return { imageUri, imageResponseStatus: status };

}

export const saveMetadataToArweave =
    async (arweave: Arweave, key: JWKInterface, imageUri: string, customText: string): Promise<saveMetadataToArweaveResponse> => {

        let metadataUri: string;
        let metadataTxnId: string;
        let status: number;

        try {
            const metadata = {
                "description": "Just your average dog living immutably on the blockchain.",
                "image": imageUri,
                "name": "THIS DOGE IS ON FIREEEE 🔥",
                "attributes": [
                    {
                        "trait_type": "Power Level",
                        "value": "9,001"
                    },
                    {
                        "trait_type": "Message from frontend",
                        "value": customText
                    }
                ],
            }

            let metadataTx = await arweave.createTransaction({
                data: JSON.stringify(metadata)
            }, key);

            
            
            metadataTx.addTag('Content-Type', 'text/json');
            
            await arweave.transactions.sign(metadataTx, key);
            
            metadataTxnId = metadataTx.id;

            await arweave.transactions.post(metadataTx);

            status = await arweave.transactions.getStatus(metadataTxnId).then(s => s.status);

            metadataUri = ENVIRONMENT === 'production'
                ? 'https://arweave.net/' + metadataTxnId
                : 'http://localhost:1984/' + metadataTxnId;

        } catch (error) {
            metadataUri = '';
            metadataTxnId = '';
            status = 500;
        }

        return { metadataUri, metadataTxnId, metadataResponseStatus: status };

    }

export const signMessage = (web3Instance: Web3, metadataUri: string) => {
    const hashedMessage = web3Instance.utils.soliditySha3({ type: 'string', value: metadataUri }) ?? '';
    return web3Instance.eth.accounts.sign(hashedMessage, ETH_SIGNER_PRIVATE_KEY!);
}