import axios from 'axios';

async function fetchGoogleTranslateMeanings(word: string): Promise<string> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  };
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(word)}`;
    const res = await axios.get(url, { headers, timeout: 4000 });

    const dictEntries = res.data?.[1];
    const resultWords: string[] = [];

    if (Array.isArray(dictEntries)) {
      for (const entry of dictEntries) {
        const terms = entry[1];
        if (Array.isArray(terms)) {
          for (const t of terms) {
            if (t && typeof t === 'string') {
              const clean = t.trim().toLowerCase();
              if (clean && !resultWords.includes(clean)) {
                resultWords.push(clean);
                if (resultWords.length >= 3) break;
              }
            }
          }
        }
        if (resultWords.length >= 3) break;
      }
    }

    if (resultWords.length > 0) {
      return resultWords.join(', ');
    }

    const mainTrans = res.data?.[0]?.[0]?.[0];
    if (mainTrans && typeof mainTrans === 'string') {
      return mainTrans;
    }
  } catch (e) {
    console.error('Err:', e);
  }
  return '';
}

async function main() {
  const words = ['scarcely', 'designate', 'trough', 'restlessness', 'relentless'];
  for (const w of words) {
    const res = await fetchGoogleTranslateMeanings(w);
    console.log(`${w}:`, res);
  }
}

main();
