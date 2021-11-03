import mongoose from 'mongoose';

export interface UserInterface {
    walletAddress: string,
    nonce: number,
    unsuccessfulMintTries: number
}

const user = new mongoose.Schema({
    walletAddress: {
        type: String,
        unique: true
    },
    nonce: Number,
    unsuccessfulMintTries: Number
})

export default mongoose.model("User", user);