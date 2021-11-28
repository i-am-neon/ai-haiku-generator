import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import { GOLD_AND_SILVER, GOLD_AND_SILVER_PATHS, OGURA, OGURA_PATHS, SHUNSU, SHUNSU_PATHS, BRUSH_STROKE_PATHS, UNRYU, UNRYU_PATHS } from './assetPaths';
import { translateText } from './translator';
import { v4 as uuidv4 } from 'uuid';
import { saveImageToMongo } from './imageStorage';

// Font constants
const YUJI_SYUKO = 'Yuji Syuko';
const SHIPPORI_MINCHO = 'Shippori Mincho';

// Registering fonts
registerFont('source/assets/fonts/YujiSyuku.ttf', { family: YUJI_SYUKO });
registerFont('source/assets/fonts/ShipporiMincho.ttf', { family: SHIPPORI_MINCHO });

export const generateHaiku = async (haikuTitle, haikuContent, address) => {
    haikuTitle = removePunctuation(haikuTitle);
    // haikuContent = removePunctuation(haikuContent);

    // Haiku papers will be 10.5cm x 14.85cm
    const canvasWidth = 1050
    const canvasHeight = 1485
    const startHaikuContentHeightFromTop = canvasHeight * .55;

    const canvas = createCanvas(canvasWidth, canvasHeight)
    const context = canvas.getContext('2d');
    const canvasPaperless = createCanvas(canvasWidth, canvasHeight)
    const contextPaperless = canvasPaperless.getContext('2d');

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

    contextPaperless.font = `70pt "${YUJI_SYUKO}"`
    contextPaperless.textAlign = 'center'
    contextPaperless.textBaseline = 'top'
    contextPaperless.fillStyle = '#000'

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
            contextPaperless.fillText(currentChar, widthOffset, heightOffset);
        }
    }

    // Add haiku
    context.font = `36pt "${SHIPPORI_MINCHO}"`
    contextPaperless.font = `36pt "${SHIPPORI_MINCHO}"`
    context.textAlign = 'center'
    contextPaperless.textAlign = 'center'
    context.textBaseline = 'top'
    contextPaperless.textBaseline = 'top'
    context.fillStyle = '#000'

    const haikuLines = haikuContent.split('\n');
    const lineHeight = context.measureText(haikuLines[0]).emHeightDescent;

    context.fillText(haikuLines[2], canvasWidth / 2, startHaikuContentHeightFromTop);
    context.fillText(haikuLines[1], canvasWidth / 2, startHaikuContentHeightFromTop - 2 * lineHeight);
    context.fillText(haikuLines[0], canvasWidth / 2, startHaikuContentHeightFromTop - 4 * lineHeight);
    contextPaperless.fillText(haikuLines[2], canvasWidth / 2, startHaikuContentHeightFromTop);
    contextPaperless.fillText(haikuLines[1], canvasWidth / 2, startHaikuContentHeightFromTop - 2 * lineHeight);
    contextPaperless.fillText(haikuLines[0], canvasWidth / 2, startHaikuContentHeightFromTop - 4 * lineHeight);

    // Add brush stroke
    const brushStrokeAddress = chooseBrushStroke();
    const brushStrokeImage = await loadImage(brushStrokeAddress);

    // Make the whole canvas just be the bottom left area
    context.transform(.2, 0, 0, .2, canvasWidth * .05, canvasHeight * .82);
    contextPaperless.transform(.2, 0, 0, .2, canvasWidth * .05, canvasHeight * .82);

    // Move the canvas [0,0] origin to the shape's center point
    context.translate( canvasWidth * .5, canvasWidth * .5 );
    contextPaperless.translate( canvasWidth * .5, canvasWidth * .5 );

    const rotation = Math.PI * Math.random() * 2;
    // Rotate the image
    context.rotate(rotation) // 2 pi radians in a full circle
    contextPaperless.rotate(rotation) // 2 pi radians in a full circle

    // Move canvas back to top left corner
    context.translate( canvasWidth * -.5, canvasWidth * -.5 );
    contextPaperless.translate( canvasWidth * -.5, canvasWidth * -.5 );
    
    context.drawImage(brushStrokeImage, 0, 0, canvasWidth, canvasWidth);
    contextPaperless.drawImage(brushStrokeImage, 0, 0, canvasWidth, canvasWidth);

    const imageUuid = uuidv4();
    
    // Create and save paperless image file
    const paperlessBuffer = canvasPaperless.toBuffer('image/png');
    const paperlessImagePath = `./source/assets/output/paperless/${imageUuid}.png`; 
    fs.writeFileSync(paperlessImagePath, paperlessBuffer);
    saveImageToMongo(address, paperlessImagePath, paperChoice.name);
    
    // Create image file
    const buffer = canvas.toBuffer('image/png');
    const finalImagePath = `./source/assets/output/paper/${imageUuid}.png`;
    fs.writeFileSync(finalImagePath, buffer);

    return { finalImagePath, paperlessImagePath, paperName: paperChoice.name ?? SHUNSU };
}

function chooseBrushStroke() {
    const path = getRandomFileFromList(BRUSH_STROKE_PATHS);
    return path;
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