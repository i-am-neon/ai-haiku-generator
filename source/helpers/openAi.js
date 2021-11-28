import OpenAI from 'openai-api';
import { OPENAI_API_KEY } from '../utils/secrets'

const openai = new OpenAI(OPENAI_API_KEY);


export async function getHaikuOptionsForTitle(haikuTitle) {
    const haikuPrompt =
`Title: Dreams of Dead Poets
Haiku:
A soliloquy of stars
Through the clear, cold night
Dreams of Dead Poets
Title: White Sands
Haiku:
Star trails in the sky
Darkness all around
Melting sand beneath your feet
Title : gm crypto twitter
Haiku:
Just a few words,
And the world is different.
gm crypto twitter.
Title: Creative Voice
Haiku:
I am the noise of my mind.
My life is a shout,
Listen to me roar
Title: Generative Masks
Haiku:
Generative Masks,
Like rain drop impressions on water,
They trace patterns on my heart.
Title: ${haikuTitle}
Haiku:
`;
    const haikuOptions = [];
    for (let index = 0; index < 3; index++) {
        const haiku = await getHaikuFromGPT3(haikuPrompt);
        haiku = transformHaiku(haiku);
        if (haikuPassesScreening(haiku)) {
            haikuOptions.push(haiku);
        } else {
            console.log('retrying...');
            index--;
        }
    }
    return haikuOptions;
}

async function getHaikuFromGPT3(prompt) {
    const gptResponse = await openai.complete({
        engine: 'davinci',
        prompt: prompt,
        maxTokens: 30,
        temperature: 1,
        topP: 1,
        presencePenalty: 0.38,
        frequencyPenalty: 0.5,
        bestOf: 1,
        n: 1,
        stream: false,
        stop: ['Title:']
    });

    return gptResponse.data.choices[0].text;
}

function transformHaiku(haiku) {
    // Remove whitespace
    haiku = haiku.trim();

    // Remove fourth line if there is one
    const haikuInLines = haiku.split('\n');
    haikuInLines = haikuInLines.slice(0, 3);

    haiku = haikuInLines.join('\n');

    // Replace … character with three periods
    while (haiku.includes('…')) {
        haiku = haiku.replace("…", "...");
    }

    return haiku;
}

function haikuPassesScreening(haiku) {
    let result = true
    if (haiku.split('\n').length < 3) {
        // Haiku not long enough
        console.log(`haiku not long enough:`, haiku);
        result = false
    }

    return result;
}

// Cut everything after two: ""
// Cut everything after "Title for a haiku"