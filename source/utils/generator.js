// import oguraHempFibers from "./source/assets/papers/ogura-hemp-fibers.jpeg";
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
export const generateHaiku = async (haikuTitle, haikuContent) => {
    console.log('haikuText :>> ', haikuContent);

    // Haiku papers will be 10.5cm x 14.85cm
    const width = 1050
    const height = 1485

    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    const imageAddress = 'source/assets/papers/gold-and-silver.jpeg';
    // const imageAddress = 'https://cdn.shopify.com/s/files/1/2472/3474/files/product_f52_gallery02.jpg?v=1587317134';
    const image = await loadImage(imageAddress);
    
    context.drawImage(image, 0, 0, width, height)
    context.font = 'bold 24pt Menlo'
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = '#3574d4'

    const haikuLines = haikuContent.split('\n');
    const lineHeight = context.measureText(haikuLines[0]).emHeightDescent;
    const startHaikuContentHeightFromTop = height * .5;

    context.fillStyle = '#000'

    context.fillText(haikuLines[0], width / 2, startHaikuContentHeightFromTop)
    context.fillText(haikuLines[1], width / 2, startHaikuContentHeightFromTop - 2 * lineHeight)
    context.fillText(haikuLines[2], width / 2, startHaikuContentHeightFromTop - 4 * lineHeight)
    
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./source/assets/output/test.png', buffer)

    return;
}