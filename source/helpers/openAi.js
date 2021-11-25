import OpenAI from 'openai-api';
import { OPENAI_API_KEY } from '../utils/secrets'

const openai = new OpenAI(OPENAI_API_KEY);


export async function getHaikuOptionsForTitle(haikuTitle) {
    const haikuPrompt =
`The following are beautifully-worded haikus. The haikus follow the 5-7-5 syllable format and are exactly three lines each. """
Title for a haiku: "Waves of Change"
Haiku:
Waves of change
Roaring seas
Dance on sands """
Title for a haiku: "White Sands"
Haiku:
Star trails in the sky
Darkness all around
Melting sand beneath your feet """
Title for a haiku: "gm crypto twitter"
Haiku:
Just a few words,
And the world is different.
gm crypto twitter. """
Title for a haiku: "${haikuTitle}"
Haiku:
`;
    const haikuOptions = [];
    for (let index = 0; index < 3; index++) {
        const haiku = await getHaikuFromGPT3(haikuPrompt);
        haikuOptions.push(haiku);
    }
    console.log(`haikuOptions`, haikuOptions)
    return haikuOptions;
}

async function getHaikuFromGPT3(prompt) {
    const gptResponse = await openai.complete({
        engine: 'davinci',
        prompt: prompt,
        maxTokens: 25,
        temperature: 1,
        topP: 1,
        presencePenalty: 0.38,
        frequencyPenalty: 0.5,
        bestOf: 1,
        n: 1,
        stream: false,
        stop: ['"""']
    });

    return gptResponse.data.choices[0].text;
}

// Cut everything after two: ""
// Cut everything after "Title for a haiku"