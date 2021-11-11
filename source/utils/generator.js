import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';

export const generateHaiku = async (haikuTitle, haikuContent) => {
    console.log('haikuText :>> ', haikuContent);

    // Registering fonts

    // Sans serif
    registerFont('source/assets/fonts/Comfortaa-VariableFont_wght.ttf', { family: 'Comfortaa' });
    registerFont('source/assets/fonts/MontserratAlternate.ttf', { family: 'Montserrat Alternate' });
    
    // Serif
    registerFont('source/assets/fonts/YujiSyuku.ttf', { family: 'Yuji Syuko' });
    registerFont('source/assets/fonts/Cardo-Bold.ttf', { family: 'Cardo Bold' });
    registerFont('source/assets/fonts/Eczar.ttf', { family: 'Eczar' });
    
    // Haiku papers will be 10.5cm x 14.85cm
    const width = 1050
    const height = 1485

    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    const imageAddress = 'source/assets/papers/sample-background.png';
    const image = await loadImage(imageAddress);

    context.drawImage(image, 0, 0, width, height)
    context.font = '36pt "Zen Kurenaido"'
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = '#3574d4'

    const haikuLines = haikuContent.split('\n');
    const lineHeight = context.measureText(haikuLines[0]).emHeightDescent;
    const startHaikuContentHeightFromTop = height * .55;

    context.fillStyle = '#000'

    context.fillText(haikuLines[0], width / 2, startHaikuContentHeightFromTop)
    context.fillText(haikuLines[1], width / 2, startHaikuContentHeightFromTop - 2 * lineHeight)
    context.fillText(haikuLines[2], width / 2, startHaikuContentHeightFromTop - 4 * lineHeight)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./source/assets/output/test.png', buffer)

    return;
}