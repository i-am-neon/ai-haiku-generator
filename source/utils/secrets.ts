import dotenv from "dotenv";

dotenv.config();

export const ENVIRONMENT = process.env.NODE_ENV;

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGO_CONNECTION_STRING = process.env["MONGO_CONNECTION_STRING"];

if (!SESSION_SECRET) {
    throw new Error("No client secret. Set SESSION_SECRET environment variable.");
}

if (!MONGO_CONNECTION_STRING) {
    throw new Error("No mongo connection string. Set MONGO_CONNECTION_STRING environment variable.");
}
