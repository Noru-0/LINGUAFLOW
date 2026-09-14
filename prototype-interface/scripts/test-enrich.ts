import { enrichVocabulary } from '../services/vocabulary-pipeline';

async function run() {
  const targetWord = process.argv[2] || 'accomplish';
  console.log(`[Testing Pipeline] Fetching data for: "${targetWord}"...`);

  try {
    const result = await enrichVocabulary(targetWord);
    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error(`[Test Failed]:`, err.message);
    process.exit(1);
  }
}

run();
