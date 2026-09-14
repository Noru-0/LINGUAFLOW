import axios from 'axios';
import * as cheerio from 'cheerio';
import { VocabularyMetadata, DefinitionItem } from '../types/vocabulary';

const CAMBRIDGE_BASE_VI = 'https://dictionary.cambridge.org/vi/dictionary/english-vietnamese';
const CAMBRIDGE_BASE_EN = 'https://dictionary.cambridge.org/dictionary/english';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Referer': 'https://dictionary.cambridge.org/vi/',
};

async function fetchPage(url: string): Promise<cheerio.CheerioAPI | null> {
  try {
    const { data: html } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
    return cheerio.load(html);
  } catch {
    return null;
  }
}

export async function scrapeCambridge(word: string): Promise<Partial<VocabularyMetadata> | null> {
  const cleanWord = encodeURIComponent(word.trim().toLowerCase());
  
  // Try Vietnamese dictionary first, then English dictionary if no definitions found
  let $ = await fetchPage(`${CAMBRIDGE_BASE_VI}/${cleanWord}`);
  let isEnglishDictFallback = false;

  if (!$ || !$('.def, .ddef_d').length) {
    $ = await fetchPage(`${CAMBRIDGE_BASE_EN}/${cleanWord}`);
    isEnglishDictFallback = true;
  }

  if (!$) return null;

  // 1. Entry container
  let entry = $('.entry-body__el').first();
  if (!entry.length) {
    entry = $('.entry-body, .pr.di, .di-body').first();
  }
  const root: any = entry.length ? entry : $('body');

  // 2. Part of Speech
  const partOfSpeech = root.find('.pos').first().text().trim() || 'noun';

  // 3. IPA UK / US
  const ukSection = root.find('.uk.dpron-i, .uk').first();
  const usSection = root.find('.us.dpron-i, .us').first();

  let ipaUk = ukSection.find('.ipa').first().text().trim() || root.find('.ipa').eq(0).text().trim();
  let ipaUs = usSection.find('.ipa').first().text().trim() || root.find('.ipa').eq(1).text().trim();

  // 4. Audio URLs
  const extractAudio = (sec: any) => {
    const src = sec.find('source[type="audio/mpeg"]').first().attr('src');
    if (src) return `https://dictionary.cambridge.org${src}`;
    return null;
  };

  let audioUkUrl = extractAudio(ukSection) || extractAudio($('.uk.dpron-i').first());
  let audioUsUrl = extractAudio(usSection) || extractAudio($('.us.dpron-i').first());

  // If audio missing and we were on VI dict, check EN dict for audio
  if (!audioUkUrl && !audioUsUrl && !isEnglishDictFallback) {
    const $en = await fetchPage(`${CAMBRIDGE_BASE_EN}/${cleanWord}`);
    if ($en) {
      const enUkSec = $en('.uk.dpron-i').first();
      const enUsSec = $en('.us.dpron-i').first();
      const ukSrc = extractAudio(enUkSec) || $en('source[src*="/uk_pron/"]').first().attr('src');
      const usSrc = extractAudio(enUsSec) || $en('source[src*="/us_pron/"]').first().attr('src');
      if (ukSrc) audioUkUrl = ukSrc.startsWith('http') ? ukSrc : `https://dictionary.cambridge.org${ukSrc}`;
      if (usSrc) audioUsUrl = usSrc.startsWith('http') ? usSrc : `https://dictionary.cambridge.org${usSrc}`;
    }
  }

  // 5. Fetch English page for CEFR level extraction if needed
  let globalCefrLevel: string | null = null;
  const $enForCefr = isEnglishDictFallback ? $ : await fetchPage(`${CAMBRIDGE_BASE_EN}/${cleanWord}`);
  if ($enForCefr) {
    $enForCefr('.epp-xref, .dxref, .cefr, [class*="epp-xref"], [class*="dxref"]').each((_, el) => {
      if (globalCefrLevel) return;
      const match = $enForCefr(el).text().trim().match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
      if (match) {
        globalCefrLevel = match[1].toUpperCase();
      }
    });
  }

  // 6. Definitions, CEFR level, and Examples
  const definitions: DefinitionItem[] = [];
  const defBlocks = root.find('.def-block.ddef_block, .def-block, .ddef_block');

  defBlocks.each((_: number, defEl: any) => {
    const $def = $(defEl);

    // CEFR Level
    const rawLevelText = $def.find('.epp-xref, .dxref, .cefr, [class*="epp-xref"], [class*="dxref"]').first().text().trim();
    const levelMatch = rawLevelText.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
    const cefrLevel = levelMatch ? levelMatch[1].toUpperCase() : globalCefrLevel;

    // English Meaning
    const englishMeaning = $def.find('.def.ddef_d.db, .def').first().text().trim().replace(/:$/, '');

    // Vietnamese Meaning
    const vietnameseMeaning = $def.find('.trans.dtrans.dtrans-se, .trans').first().text().trim();

    // Examples
    const examples: string[] = [];
    $def.find('.examp.dexamp, .examp, .eg').each((__, exEl) => {
      const egText = $(exEl).find('.eg.deg, .eg').text().trim() || $(exEl).text().trim();
      if (egText && !examples.includes(egText)) {
        examples.push(egText);
      }
    });

    if (englishMeaning || vietnameseMeaning) {
      definitions.push({
        cefrLevel,
        englishMeaning,
        vietnameseMeaning: vietnameseMeaning || englishMeaning,
        examples: examples.slice(0, 3),
      });
    }
  });

  if (definitions.length === 0) return null;

  // Fallback CEFR level estimation if completely missing from Cambridge
  const finalCefrLevel =
    globalCefrLevel ||
    definitions.find((d) => Boolean(d.cefrLevel))?.cefrLevel ||
    (word.length >= 10 ? 'C2' : word.length >= 8 ? 'C1' : word.length >= 6 ? 'B2' : word.length >= 4 ? 'B1' : 'A2');

  // Assign finalCefrLevel to any definition lacking one
  definitions.forEach((d) => {
    if (!d.cefrLevel) d.cefrLevel = finalCefrLevel;
  });

  return {
    term: word,
    partOfSpeech,
    ipaUk: ipaUk ? `/${ipaUk.replace(/^\/|\/$/g, '')}/` : '',
    ipaUs: ipaUs ? `/${ipaUs.replace(/^\/|\/$/g, '')}/` : '',
    audioUkUrl,
    audioUsUrl,
    cefrLevel: finalCefrLevel,
    definitions: definitions.slice(0, 3),
  };
}
