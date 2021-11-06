import dotenv from "dotenv";
dotenv.config();

export const ENVIRONMENT = process.env.NODE_ENV;

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGO_CONNECTION_STRING = process.env["MONGO_CONNECTION_STRING"];
export const ARWEAVE_KEY = JSON.parse(process.env["ARWEAVE_KEY"] ?? '');

// to do: see if i can export variables after the if checks to avoid adding the ! after in the code

if (!SESSION_SECRET) {
    throw new Error("No client secret. Set SESSION_SECRET environment variable.");
}

if (!MONGO_CONNECTION_STRING) {
    throw new Error("No mongo connection string. Set MONGO_CONNECTION_STRING environment variable.");
}

if (!ARWEAVE_KEY) {
    throw new Error("No arweave wallet. Set ARWEAVE_KEY environment variable.");
}
