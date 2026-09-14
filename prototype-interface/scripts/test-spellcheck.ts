import axios from 'axios';

async function checkAndSpellCorrectWord(word: string): Promise<{ isTypo: boolean; correctedWord: string }> {
  const clean = word.trim().toLowerCase();
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=rm&q=${encodeURIComponent(clean)}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 4000,
    });

    // Check spell correction in GTx response
    const spellSuggestion = res.data?.[7]?.[1] || res.data?.[7]?.[0];
    if (spellSuggestion && typeof spellSuggestion === 'string') {
      const cleanSuggestion = spellSuggestion.replace(/<b><i>/g, '').replace(/<\/i><\/b>/g, '').trim();
      if (cleanSuggestion && cleanSuggestion.toLowerCase() !== clean) {
        return { isTypo: true, correctedWord: cleanSuggestion };
      }
    }
  } catch (e) {
    // Ignore network error
  }

  return { isTypo: false, correctedWord: clean };
}

async function main() {
  const testInputs = ['relentness', 'scarcly', 'deliberit', 'relentless', 'apple'];
  for (const w of testInputs) {
    const res = await checkAndSpellCorrectWord(w);
    console.log(`Input: "${w}" -> isTypo: ${res.isTypo}, corrected: "${res.correctedWord}"`);
  }
}

main();
