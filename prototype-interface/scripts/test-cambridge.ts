import { scrapeCambridge } from '../services/cambridge-scraper';

async function main() {
  const words = ['scarcely', 'designate', 'trough', 'restlessness', 'relentless'];
  for (const w of words) {
    const res = await scrapeCambridge(w);
    console.log(`\n=== Word: "${w}" ===`);
    console.log('POS:', res?.partOfSpeech);
    console.log('CEFR:', res?.cefrLevel);
    console.log('Phonetic UK:', res?.ipaUk, 'US:', res?.ipaUs);
    if (res?.definitions) {
      res.definitions.forEach((d, i) => {
        console.log(` Def ${i+1}:`);
        console.log('   VN:', d.vietnameseMeaning);
        console.log('   EN:', d.englishMeaning);
        console.log('   EG:', d.examples[0]);
      });
    }
  }
}

main();
