import { scrapeCambridge } from './cambridge-scraper';
import { fetchContextualImage } from './unsplash-service';
import { getFallbackAudio } from './audio-fallback';
import { fetchGeminiEnrichment } from './gemini-service';
import { VocabularyMetadata } from '../types/vocabulary';

export async function enrichVocabulary(word: string): Promise<VocabularyMetadata> {
  const cleanInputWord = word.trim();

  // Step 1: Try Gemini enrichment first to check for typos (e.g. "relentness" -> "relentless")
  let geminiData = await fetchGeminiEnrichment(cleanInputWord);

  const effectiveWord = geminiData?.correctedWord || cleanInputWord;

  // Step 2: Scrape Cambridge Dictionary for effective word
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
    geminiData = await fetchGeminiEnrichment(effectiveWord, cambridgeData?.partOfSpeech);
  }

  // Step 3: Combine Cambridge + Gemini 1.5 Flash data
  const partOfSpeech = (cambridgeData?.partOfSpeech && cambridgeData.partOfSpeech !== 'noun')
    ? cambridgeData.partOfSpeech
    : (geminiData?.partOfSpeech || cambridgeData?.partOfSpeech || 'noun');

  const ipaUk = cambridgeData?.ipaUk || geminiData?.phonetic || '';
  const ipaUs = cambridgeData?.ipaUs || geminiData?.phonetic || '';
  const cefrLevel = cambridgeData?.cefrLevel || geminiData?.cefrLevel || 'B1';

  let finalDefinitions = [...definitions];

  if (finalDefinitions.length === 0 && geminiData) {
    finalDefinitions = [
      {
        cefrLevel: geminiData.cefrLevel || 'B1',
        englishMeaning: geminiData.englishMeaning || '',
        vietnameseMeaning: geminiData.vietnameseMeaning || '',
        examples: geminiData.exampleSentence ? [geminiData.exampleSentence] : [],
      },
    ];
  } else if (finalDefinitions.length > 0) {
    // Collect top 3 clean Vietnamese meanings across definitions if available
    const cleanViMeanings: string[] = [];
    for (const d of finalDefinitions) {
      if (d.vietnameseMeaning && !/[a-zA-Z]{6,}\s+[a-zA-Z]{4,}/.test(d.vietnameseMeaning)) {
        const parts = d.vietnameseMeaning.split(/[;,/]/).map((p) => p.trim());
        for (const p of parts) {
          if (p && !cleanViMeanings.includes(p)) {
            cleanViMeanings.push(p);
          }
        }
      }
    }

    const combinedScrapedVi = cleanViMeanings.slice(0, 3).join(', ');

    finalDefinitions = finalDefinitions.map((def, idx) => {
      if (idx === 0) {
        return {
          ...def,
          vietnameseMeaning: geminiData?.vietnameseMeaning || combinedScrapedVi || def.vietnameseMeaning,
          englishMeaning: def.englishMeaning || geminiData?.englishMeaning || '',
          examples: def.examples && def.examples.length > 0
            ? def.examples
            : (geminiData?.exampleSentence ? [geminiData.exampleSentence] : []),
        };
      }
      return def;
    });
  }

  // Step 4: Audio fallback
  let audioUk = cambridgeData?.audioUkUrl || null;
  let audioUs = cambridgeData?.audioUsUrl || null;

  if (!audioUk && !audioUs) {
    const fallback = await getFallbackAudio(word);
    audioUk = fallback;
    audioUs = fallback;
  }

  // Step 5: Image fallback from Unsplash
  const primaryMeaning = finalDefinitions[0]?.englishMeaning || word;
  const imageData = await fetchContextualImage(word, primaryMeaning);

  return {
    term: cambridgeData?.term || word,
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

