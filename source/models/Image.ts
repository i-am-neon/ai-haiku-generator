import mongoose from 'mongoose';

export interface ImageInterface {
    walletAddress: string,
    png: string,
    paperName: string
}

const image = new mongoose.Schema({
    walletAddress: String,
    png: String,
    paperName: String
})

export default mongoose.model("Image", image);