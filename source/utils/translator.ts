import { GOOGLE_CLOUD_KEY } from './secrets';
const { Translate } = require('@google-cloud/translate').v2;

// Creates a client
const translate = new Translate({
  projectId: 'ai-haiku-331818',
  credentials: GOOGLE_CLOUD_KEY
});

// Language: Japanese
const target = 'ja';

export async function translateText(text: string): Promise<string> {
  let translation = await translate.translate(text.toLowerCase(), target).then((res: any[]) => res[0]);

  // Set title to 'untitled' in Japanese if the translation doesn't go through
  const detectedLanguage = await translate.detect(translation).then((res: { language: any; }[]) => res[0].language);
  if (detectedLanguage !== 'ja') {
    translation = '無題';
  }

  return translation;
}
