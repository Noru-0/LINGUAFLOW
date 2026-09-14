import axios from 'axios';
import * as cheerio from 'cheerio';

async function getCefrLevel(word: string): Promise<string | null> {
  const cleanWord = encodeURIComponent(word.trim().toLowerCase());
  try {
    const { data: html } = await axios.get(`https://dictionary.cambridge.org/dictionary/english/${cleanWord}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 8000,
    });
    const $ = cheerio.load(html);

    let foundLevel: string | null = null;
    $('.epp-xref, .dxref, .cefr, [class*="epp-xref"], [class*="dxref"]').each((_, el) => {
      if (foundLevel) return;
      const text = $(el).text().trim();
      const match = text.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
      if (match) {
        foundLevel = match[1].toUpperCase();
      }
    });

    if (!foundLevel) {
      // Search entire entry-body for standalone A1-C2 badge text
      $('.entry-body__el .def-block, .entry-body__el').each((_, el) => {
        if (foundLevel) return;
        const text = $(el).find('.dxref, .epp-xref').text().trim();
        const match = text.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
        if (match) {
          foundLevel = match[1].toUpperCase();
        }
      });
    }

    return foundLevel;
  } catch {
    return null;
  }
}

async function run() {
  const words = ['cat', 'book', 'accomplish', 'raid', 'resilience', 'innovative', 'ubiquitous', 'ephemeral'];
  for (const w of words) {
    const lvl = await getCefrLevel(w);
    console.log(`Word: ${w.padEnd(12)} -> CEFR Level: ${lvl}`);
  }
}

run();
