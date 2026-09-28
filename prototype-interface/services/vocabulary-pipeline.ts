import { scrapeCambridge } from './cambridge-scraper';
import { fetchContextualImage } from './unsplash-service';
import { getFallbackAudio } from './audio-fallback';
import { fetchGeminiEnrichment } from './gemini-service';
import { fetchFullDictionaryData } from './dictionary-api-service';
import { VocabularyMetadata } from '../types/vocabulary';

export async function enrichVocabulary(word: string, targetPos?: string): Promise<VocabularyMetadata> {
  const cleanInputWord = word.trim();

  // Step 1: Try Gemini enrichment first to check for typos (e.g. "relentness" -> "relentless")
  let geminiData = await fetchGeminiEnrichment(cleanInputWord, targetPos);
  const effectiveWord = geminiData?.correctedWord || cleanInputWord;

  // Step 2: Fetch comprehensive multi-source dictionary data (FreeDict + Google Oxford + Datamuse + Google Bilingual)
  const fullDict = await fetchFullDictionaryData(effectiveWord, targetPos);

  // Step 3: Scrape Cambridge Dictionary for effective word
  let cambridgeData: Partial<VocabularyMetadata> | null = null;
  try {
    cambridgeData = await scrapeCambridge(effectiveWord);
  } catch (err) {
    console.warn(`Cambridge scraper failed for "${effectiveWord}":`, err);
  }

  const definitions = cambridgeData?.definitions || [];
  const primaryDef = definitions[0];

  const isEnglishLeak = primaryDef?.vietnameseMeaning && /[a-zA-Z]{6,}\s+[a-zA-Z]{4,}/.test(primaryDef.vietnameseMeaning);

  // Identify missing or incomplete dictionary columns
  const missingVietnamese =
    !primaryDef?.vietnameseMeaning ||
    primaryDef.vietnameseMeaning.trim().toLowerCase() === (primaryDef.englishMeaning || '').trim().toLowerCase() ||
    primaryDef.vietnameseMeaning.startsWith('Nghĩa') ||
    Boolean(isEnglishLeak);

  const missingExample = !primaryDef?.examples || primaryDef.examples.length === 0;
  const missingEnglish = !primaryDef?.englishMeaning;
  const missingPhonetic = !cambridgeData?.ipaUk && !cambridgeData?.ipaUs;
  const missingCefr = !cambridgeData?.cefrLevel && !primaryDef?.cefrLevel;

  // If Gemini wasn't run earlier or needs re-running for effective word:
  if (!geminiData && (!cambridgeData || missingVietnamese || missingExample || missingEnglish || missingPhonetic || missingCefr)) {
    geminiData = await fetchGeminiEnrichment(effectiveWord, targetPos || cambridgeData?.partOfSpeech);
  }

  // Step 4: Determine best Part of Speech
  const partOfSpeech = targetPos || (cambridgeData?.partOfSpeech && cambridgeData.partOfSpeech !== 'noun'
    ? cambridgeData.partOfSpeech
    : (geminiData?.partOfSpeech || fullDict.partOfSpeech || cambridgeData?.partOfSpeech || 'noun'));

  // Determine best Phonetics
  let ipaUk = cambridgeData?.ipaUk || fullDict.phonetic || geminiData?.phonetic || `/${effectiveWord}/`;
  if (ipaUk && !ipaUk.startsWith('/')) ipaUk = `/${ipaUk.replace(/^\/|\/$/g, '')}/`;
  const ipaUs = cambridgeData?.ipaUs || ipaUk;

  // Determine best CEFR Level
  const cefrLevel = cambridgeData?.cefrLevel || geminiData?.cefrLevel || primaryDef?.cefrLevel || (
    effectiveWord.length >= 10 ? 'C1' : effectiveWord.length >= 7 ? 'B2' : effectiveWord.length >= 5 ? 'B1' : 'A2'
  );

  // Determine best Vietnamese Meaning (Multiple comma-separated meanings)
  let bestVietnamese = fullDict.vietnameseMeaning || geminiData?.vietnameseMeaning || '';
  if (!bestVietnamese && definitions.length > 0) {
    const cleanViMeanings: string[] = [];
    for (const d of definitions) {
      if (d.vietnameseMeaning && !/[a-zA-Z]{6,}\s+[a-zA-Z]{4,}/.test(d.vietnameseMeaning)) {
        const parts = d.vietnameseMeaning.split(/[;,/]/).map((p) => p.trim());
        for (const p of parts) {
          if (p && !cleanViMeanings.includes(p)) {
            cleanViMeanings.push(p);
          }
        }
      }
    }
    bestVietnamese = cleanViMeanings.slice(0, 4).join(', ');
  }
  if (!bestVietnamese && primaryDef?.vietnameseMeaning) {
    bestVietnamese = primaryDef.vietnameseMeaning;
  }

  // Determine best English Definition
  const bestEnglish = fullDict.englishDefinition || primaryDef?.englishMeaning || geminiData?.englishMeaning || '';

  // Determine best Examples
  const bestExamples: string[] = [];
  if (fullDict.allExamples && fullDict.allExamples.length > 0) {
    for (const ex of fullDict.allExamples) {
      if (!bestExamples.includes(ex)) bestExamples.push(ex);
    }
  }
  if (primaryDef?.examples && primaryDef.examples.length > 0) {
    for (const ex of primaryDef.examples) {
      if (!bestExamples.includes(ex)) bestExamples.push(ex);
    }
  }
  if (geminiData?.exampleSentence && !bestExamples.includes(geminiData.exampleSentence)) {
    bestExamples.push(geminiData.exampleSentence);
  }

  let finalDefinitions = [...definitions];

  if (finalDefinitions.length === 0) {
    finalDefinitions = [
      {
        cefrLevel,
        englishMeaning: bestEnglish,
        vietnameseMeaning: bestVietnamese,
        examples: bestExamples.slice(0, 3),
      },
    ];
  } else {
    finalDefinitions = finalDefinitions.map((def, idx) => {
      if (idx === 0) {
        return {
          ...def,
          vietnameseMeaning: bestVietnamese || def.vietnameseMeaning,
          englishMeaning: def.englishMeaning || bestEnglish,
          examples: def.examples && def.examples.length > 0 ? def.examples : bestExamples.slice(0, 3),
        };
      }
      return def;
    });
  }

  // Step 5: Audio fallback
  let audioUk = cambridgeData?.audioUkUrl || fullDict.audioUrl || null;
  let audioUs = cambridgeData?.audioUsUrl || fullDict.audioUrl || null;

  if (!audioUk && !audioUs) {
    const fallback = await getFallbackAudio(effectiveWord);
    audioUk = fallback;
    audioUs = fallback;
  }

  // Step 6: Image fallback from Unsplash
  const primaryMeaning = bestEnglish || effectiveWord;
  const imageData = await fetchContextualImage(effectiveWord, primaryMeaning);

  return {
    term: cambridgeData?.term || effectiveWord,
    partOfSpeech,
    ipaUk,
    ipaUs,
    audioUkUrl: audioUk,
    audioUsUrl: audioUs,
    cefrLevel,
    definitions: finalDefinitions,
    imageUrl: imageData?.imageUrl || null,
    imagePhotographer: imageData?.photographer || null,
  };
}
