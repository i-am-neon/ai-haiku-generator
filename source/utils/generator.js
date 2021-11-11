import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import { translateText } from './translator';

const KAISEI_TOKUMIN = 'Kaisei Tokumin';
const YUJI_SYUKO = 'Yuji Syuko';
const ZEN_ANTIQUE_SOFT = 'Zen Antique Soft';
const SHIPPORI_MINCHO = 'Shippori Mincho';
const NEW_TEGOMIN = 'New Tegomin';
const KIWI_MARU = 'Kiwi Maru';
const HINA_MINCHO = 'Hina Mincho';
const YUJI_BOKU = 'Yuji Boku';

// Registering fonts
registerFont('source/assets/fonts/KaiseiTokumin.ttf', { family: KAISEI_TOKUMIN });
registerFont('source/assets/fonts/YujiSyuku.ttf', { family: YUJI_SYUKO });
registerFont('source/assets/fonts/ZenAntiqueSoft.ttf', { family: ZEN_ANTIQUE_SOFT });
registerFont('source/assets/fonts/ShipporiMincho.ttf', { family: SHIPPORI_MINCHO });
registerFont('source/assets/fonts/NewTegomin.ttf', { family: NEW_TEGOMIN });
registerFont('source/assets/fonts/KiwiMaru.ttf', { family: KIWI_MARU });
registerFont('source/assets/fonts/HinaMincho.ttf', { family: HINA_MINCHO });
registerFont('source/assets/fonts/YujiBoku.ttf', { family: YUJI_BOKU });

export const generateHaiku = async (haikuTitle, haikuContent) => {

    const chosenFont = YUJI_SYUKO;

    // Haiku papers will be 10.5cm x 14.85cm
    const canvasWidth = 1050
    const canvasHeight = 1485
    const startHaikuContentHeightFromTop = canvasHeight * .55;
    console.log('startHaikuContentHeightFromTop :>> ', startHaikuContentHeightFromTop);

    const canvas = createCanvas(canvasWidth, canvasHeight)
    const context = canvas.getContext('2d')

    // Add Paper
    const imageAddress = 'source/assets/papers/ogura/ogura-2.jpeg';
    const image = await loadImage(imageAddress);
    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);

    // Add title
    const translatedTitle = await translateText(haikuTitle);
    console.log('translatedTitle :>> ', translatedTitle);
    const titleChars = translatedTitle.split('');

    context.font = `70pt "${chosenFont}"`
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = '#000'

    const characterWidth = context.measureText(titleChars[0]).width;
    const characterHeight = context.measureText(titleChars[0]).emHeightDescent;

    const charsPerLine = Math.floor(startHaikuContentHeightFromTop / characterHeight) - 1;

    const numberOfTitleLines = Math.ceil(titleChars.length / charsPerLine);

    const titleLines = [];
    for (let index = 0; index < numberOfTitleLines; index++) {
        titleLines.push([]);
    }

    let currentLineIndex = 0
    titleChars.forEach(char => {
        if (titleLines[currentLineIndex].length >= charsPerLine) {
            currentLineIndex++;
        }
        titleLines[currentLineIndex].push(char);
    });

    for (let currentLineIndex = 0; currentLineIndex < titleLines.length; currentLineIndex++) {
        for (let currentCharIndex = 0; currentCharIndex < titleLines[currentLineIndex].length; currentCharIndex++) {
            const currentChar = titleLines[currentLineIndex][currentCharIndex];
            const widthOffset = canvasWidth - characterWidth * (numberOfTitleLines - currentLineIndex);
            const heightOffset = characterWidth * (currentCharIndex);
            context.fillText(currentChar, widthOffset, heightOffset);
        }

    }


    // Add haiku
    context.font = `36pt "${chosenFont}"`
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = '#000'

    const haikuLines = haikuContent.split('\n');
    const lineHeight = context.measureText(haikuLines[0]).emHeightDescent;

    context.fillText(haikuLines[0], canvasWidth / 2, startHaikuContentHeightFromTop);
    context.fillText(haikuLines[1], canvasWidth / 2, startHaikuContentHeightFromTop - 2 * lineHeight);
    context.fillText(haikuLines[2], canvasWidth / 2, startHaikuContentHeightFromTop - 4 * lineHeight);

    // Create image file
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(`./source/assets/output/test.png`, buffer)

    return;
}