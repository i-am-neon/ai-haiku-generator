import dotenv from "dotenv";
dotenv.config();

export const ENVIRONMENT = process.env.NODE_ENV;

if (!process.env["SESSION_SECRET"]) {
    throw new Error("No client secret. Set SESSION_SECRET environment variable.");
}
export const SESSION_SECRET = process.env["SESSION_SECRET"];

if (!process.env["MONGO_CONNECTION_STRING"]) {
    throw new Error("No mongo connection string. Set MONGO_CONNECTION_STRING environment variable.");
}
export const MONGO_CONNECTION_STRING = process.env["MONGO_CONNECTION_STRING"];

if (process.env["ARWEAVE_KEY"] === '' || !process.env["ARWEAVE_KEY"]) {
    throw new Error("No arweave wallet. Set ARWEAVE_KEY environment variable.");
}
export const ARWEAVE_KEY = JSON.parse(process.env["ARWEAVE_KEY"]);

if (process.env["GOOGLE_CLOUD_KEY"] === '' || !process.env["GOOGLE_CLOUD_KEY"]) {
    throw new Error("No google cloud key. Set GOOGLE_CLOUD_KEY environment variable.");
}
export const GOOGLE_CLOUD_KEY = JSON.parse(process.env["GOOGLE_CLOUD_KEY"] ?? '');

if (!process.env["ETH_SIGNER_PRIVATE_KEY"]) {
    throw new Error("No eth private key to sign the message hash. Set ETH_SIGNER_PRIVATE_KEY environment variable.");
}
export const ETH_SIGNER_PRIVATE_KEY = process.env["ETH_SIGNER_PRIVATE_KEY"];

if (!process.env["OPENAI_API_KEY"]) {
    throw new Error("No OpenAI API private key to sign the message hash. Set OPENAI_API_KEY environment variable.");
}
export const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];
