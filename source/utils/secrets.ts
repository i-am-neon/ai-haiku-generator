import dotenv from "dotenv";
dotenv.config();

export const ENVIRONMENT = process.env.NODE_ENV;

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGO_CONNECTION_STRING = process.env["MONGO_CONNECTION_STRING"];
export const ARWEAVE_KEY = JSON.parse(process.env["ARWEAVE_KEY"] ?? '');
export const GOOGLE_CLOUD_KEY = JSON.parse(process.env["GOOGLE_CLOUD_KEY"] ?? '');
export const ETH_SIGNER_PRIVATE_KEY = process.env["ETH_SIGNER_PRIVATE_KEY"];

// to do: see if i can export variables after the if checks to avoid adding the ! after in the code

if (!SESSION_SECRET) {
    throw new Error("No client secret. Set SESSION_SECRET environment variable.");
}

if (!MONGO_CONNECTION_STRING) {
    throw new Error("No mongo connection string. Set MONGO_CONNECTION_STRING environment variable.");
}

if (ARWEAVE_KEY === '' || !ARWEAVE_KEY) {
    throw new Error("No arweave wallet. Set ARWEAVE_KEY environment variable.");
}

if (GOOGLE_CLOUD_KEY === '' || !GOOGLE_CLOUD_KEY) {
    throw new Error("No google cloud key. Set GOOGLE_CLOUD_KEY environment variable.");
}

if (!ETH_SIGNER_PRIVATE_KEY) {
    throw new Error("No eth private key to sign the message hash. Set ETH_SIGNER_PRIVATE_KEY environment variable.");
}
