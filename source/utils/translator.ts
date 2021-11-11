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
  return await translate.translate(text, target).then((res: any[]) => res[0]);
}
