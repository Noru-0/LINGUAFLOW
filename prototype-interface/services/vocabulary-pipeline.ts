import { scrapeCambridge } from './cambridge-scraper';
import { fetchContextualImage } from './unsplash-service';
import { getFallbackAudio } from './audio-fallback';
import { fetchGeminiEnrichment } from './gemini-service';
import { fetchFullDictionaryData } from './dictionary-api-service';
import { VocabularyMetadata } from '../types/vocabulary';

// In-memory cache for fast lookup (TTL: 2 hours, max 1000 items)
const pipelineCache = new Map<string, { data: VocabularyMetadata; timestamp: number }>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;

export async function enrichVocabulary(word: string, targetPos?: string): Promise<VocabularyMetadata> {
  const cleanInputWord = word.trim();
  const cacheKey = `${cleanInputWord.toLowerCase()}_${(targetPos || '').toLowerCase()}`;

  const cached = pipelineCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Run Gemini, Full Dictionary API (FreeDict + Google Oxford + Datamuse + Google Bilingual), Cambridge scraper, and Unsplash in parallel!
  const [geminiResult, fullDictResult, cambridgeResult] = await Promise.allSettled([
    fetchGeminiEnrichment(cleanInputWord, targetPos),
    fetchFullDictionaryData(cleanInputWord, targetPos),
    scrapeCambridge(cleanInputWord, targetPos).catch(() => null),
  ]);

  let geminiData = geminiResult.status === 'fulfilled' ? geminiResult.value : null;
  const fullDict = fullDictResult.status === 'fulfilled' && fullDictResult.value ? fullDictResult.value : {
    phonetic: '',
    partOfSpeech: '',
    englishDefinition: '',
    allEnglishDefinitions: [],
    example: '',
    allExamples: [],
    vietnameseMeaning: '',
    audioUrl: null,
  };
  const cambridgeData = cambridgeResult.status === 'fulfilled' ? cambridgeResult.value : null;

  const effectiveWord = geminiData?.correctedWord || cleanInputWord;
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

  // If Gemini wasn't available or needs another call
  if (!geminiData && (!cambridgeData || missingVietnamese || missingExample || missingEnglish || missingPhonetic || missingCefr)) {
    try {
      geminiData = await fetchGeminiEnrichment(effectiveWord, targetPos || cambridgeData?.partOfSpeech);
    } catch {}
  }

  // Determine best Part of Speech
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

  // Determine best Vietnamese Meaning (Multiple comma-separated meanings, strictly matching targetPos if provided)
  let bestVietnamese = '';
  if (targetPos) {
    bestVietnamese = geminiData?.vietnameseMeaning || fullDict.vietnameseMeaning || '';
  } else {
    bestVietnamese = fullDict.vietnameseMeaning || geminiData?.vietnameseMeaning || '';
  }

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
  let bestEnglish = '';
  if (targetPos) {
    bestEnglish = geminiData?.englishMeaning || fullDict.englishDefinition || primaryDef?.englishMeaning || '';
  } else {
    bestEnglish = fullDict.englishDefinition || primaryDef?.englishMeaning || geminiData?.englishMeaning || '';
  }

  // Helper to validate complete sentence (Subject + Verb structure with min words & punctuation)
  const isCompleteSentence = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    const words = trimmed.split(/\s+/);
    return words.length >= 4 && (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?'));
  };

  // Determine best Examples (Strictly prioritize full complete sentences matching targetPos)
  const candidateExamples: string[] = [];
  if (geminiData?.exampleSentence && isCompleteSentence(geminiData.exampleSentence)) {
    candidateExamples.push(geminiData.exampleSentence.trim());
  }
  if (primaryDef?.examples && primaryDef.examples.length > 0) {
    for (const ex of primaryDef.examples) {
      if (ex && !candidateExamples.includes(ex.trim())) {
        candidateExamples.push(ex.trim());
      }
    }
  }
  if (fullDict.allExamples && fullDict.allExamples.length > 0) {
    for (const ex of fullDict.allExamples) {
      if (ex && !candidateExamples.includes(ex.trim())) {
        candidateExamples.push(ex.trim());
      }
    }
  }
  if (geminiData?.exampleSentence && !candidateExamples.includes(geminiData.exampleSentence.trim())) {
    candidateExamples.push(geminiData.exampleSentence.trim());
  }

  // Sort candidate examples so complete sentences are always on top
  candidateExamples.sort((a, b) => {
    const aScore = isCompleteSentence(a) ? 2 : 0;
    const bScore = isCompleteSentence(b) ? 2 : 0;
    return bScore - aScore;
  });

  const bestExamples = candidateExamples.slice(0, 4);

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
          englishMeaning: bestEnglish || def.englishMeaning,
          examples: bestExamples.length > 0 ? bestExamples.slice(0, 3) : (def.examples || []),
        };
      }
      return def;
    });
  }

  // Audio fallback
  let audioUk = cambridgeData?.audioUkUrl || fullDict.audioUrl || null;
  let audioUs = cambridgeData?.audioUsUrl || fullDict.audioUrl || null;

  // Run image and fallback audio concurrently in the background (topics are classified explicitly on /topics)
  const [audioFallbackResult, imageResult] = await Promise.allSettled([
    (!audioUk && !audioUs) ? getFallbackAudio(effectiveWord) : Promise.resolve(null),
    fetchContextualImage(effectiveWord, bestEnglish || effectiveWord),
  ]);

  if (!audioUk && !audioUs && audioFallbackResult.status === 'fulfilled' && audioFallbackResult.value) {
    audioUk = audioFallbackResult.value;
    audioUs = audioFallbackResult.value;
  }

  const imageData = imageResult.status === 'fulfilled' ? imageResult.value : null;

  const resultData: VocabularyMetadata = {
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
    topicClassification: null,
  };

  if (pipelineCache.size >= 1000) {
    const oldestKey = pipelineCache.keys().next().value;
    if (oldestKey) pipelineCache.delete(oldestKey);
  }
  pipelineCache.set(cacheKey, { data: resultData, timestamp: Date.now() });

  return resultData;
}
