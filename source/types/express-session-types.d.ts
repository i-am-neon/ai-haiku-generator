declare module 'express-session' {
    export interface SessionData {
        nonce: number;
    }
}