import { enrichVocabulary } from '../services/vocabulary-pipeline';

async function main() {
  console.log('--- Testing Typo Auto-Correction & Enrichment Pipeline ---');
  const testWords = ['relentness', 'scarcly', 'relentless'];

  for (const word of testWords) {
    console.log(`\nInput Word: "${word}"...`);
    const enriched = await enrichVocabulary(word);
    console.log('Term:', enriched.term);
    console.log('Part of Speech:', enriched.partOfSpeech);
    console.log('CEFR Level:', enriched.cefrLevel);
    console.log('Phonetic:', enriched.ipaUk || enriched.ipaUs);
    if (enriched.definitions[0]) {
      console.log('  Vietnamese:', enriched.definitions[0].vietnameseMeaning);
      console.log('  English:', enriched.definitions[0].englishMeaning);
      console.log('  Example:', enriched.definitions[0].examples[0]);
    }
  }
}

main().catch(console.error);
