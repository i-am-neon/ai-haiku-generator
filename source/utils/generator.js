import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import { GOLD_AND_SILVER, GOLD_AND_SILVER_PATHS, OGURA, OGURA_PATHS, SHUNSU, SHUNSU_PATHS, UNRYU, UNRYU_PATHS } from './paperConstants';
import { translateText } from './translator';

// Font constants
const YUJI_SYUKO = 'Yuji Syuko';
const SHIPPORI_MINCHO = 'Shippori Mincho';

// Registering fonts
registerFont('source/assets/fonts/YujiSyuku.ttf', { family: YUJI_SYUKO });
registerFont('source/assets/fonts/ShipporiMincho.ttf', { family: SHIPPORI_MINCHO });

export const generateHaiku = async (haikuTitle, haikuContent) => {
    haikuTitle = removePunctuation(haikuTitle);
    haikuContent = removePunctuation(haikuContent);

    // Haiku papers will be 10.5cm x 14.85cm
    const canvasWidth = 1050
    const canvasHeight = 1485
    const startHaikuContentHeightFromTop = canvasHeight * .55;

    const canvas = createCanvas(canvasWidth, canvasHeight)
    const context = canvas.getContext('2d')

    // Add Paper
    const paperChoice = choosePaper();
    const imageAddress = paperChoice.path;
    const image = await loadImage(imageAddress);
    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);

    // Add title
    const translatedTitle = await translateText(haikuTitle);
    const titleChars = translatedTitle.split('');

    context.font = `70pt "${YUJI_SYUKO}"`
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
    context.font = `36pt "${SHIPPORI_MINCHO}"`
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

function choosePaper() {
    const rndInt = randomIntFromInterval(1, 100);

    let name;
    let path;

    if (rndInt <= 40) {
        // Shunsu
        name = SHUNSU;
        path = getRandomFileFromList(SHUNSU_PATHS);
    } else if (rndInt <= 70) {
        // Ogura
        name = OGURA;
        path = getRandomFileFromList(OGURA_PATHS);
    } else if (rndInt <= 90) {
        // Unryu
        name = UNRYU;
        path = getRandomFileFromList(UNRYU_PATHS);
    } else if (rndInt <= 100) {
        // Gold and Silver
        name = GOLD_AND_SILVER;
        path = getRandomFileFromList(GOLD_AND_SILVER_PATHS);
    }

    return { name, path };
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomFileFromList(fileList) {
    return fileList[Math.floor(Math.random() * fileList.length)];
}

function removePunctuation(s) {
    return s.replace(/[\/#!?$%\^&\*;:{}=\-_`~()|<>@"]/g, "").replace(/\s{2,}/g, ' ');
}