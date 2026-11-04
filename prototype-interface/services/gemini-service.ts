import axios from 'axios';
import { fastLookupTopicByKeywords, INITIAL_TOPICS } from '../lib/db/initial_topics';

export interface TopicClassification {
  majorTopicId: string;
  majorTopicName: string;
  subtopicId: string;
  subtopicName: string;
  confidence: number;
}

export interface GeminiEnrichmentData {
  vietnameseMeaning: string;
  englishMeaning: string;
  partOfSpeech: string;
  phonetic: string;
  cefrLevel: string;
  exampleSentence: string;
  isTypo?: boolean;
  correctedWord?: string;
  topicClassification?: TopicClassification | null;
}

export function isDummyPlaceholder(text: string): boolean {
  if (!text) return true;
  const lower = text.trim().toLowerCase();
  if (lower.startsWith('nghĩa của') || lower.startsWith('nghĩa tiếng việt')) return true;
  if (lower.startsWith('definition of') || lower.startsWith('meaning of')) return true;
  if (lower.includes('an example sentence containing') || lower.includes('example sentence with')) return true;
  return false;
}

export function findTopicDetails(subtopicId: string): TopicClassification | null {
  if (!subtopicId) return null;
  for (const major of INITIAL_TOPICS) {
    if (major.id === subtopicId) {
      const defaultSub = major.subtopics[0];
      return {
        majorTopicId: major.id,
        majorTopicName: major.nameEn,
        subtopicId: defaultSub ? defaultSub.id : major.id,
        subtopicName: defaultSub ? defaultSub.nameEn : major.nameEn,
        confidence: 0.8,
      };
    }
    for (const sub of major.subtopics) {
      if (sub.id === subtopicId) {
        return {
          majorTopicId: major.id,
          majorTopicName: major.nameEn,
          subtopicId: sub.id,
          subtopicName: sub.nameEn,
          confidence: 0.95,
        };
      }
    }
  }
  return null;
}

/**
 * Fetch vocabulary enrichment using Google Gemini 1.5/2.5 Flash.
 * Includes auto-detection for misspelled words, topic taxonomy categorization,
 * and filters out dummy/generic fallback strings.
 */
export async function fetchGeminiEnrichment(
  word: string,
  partOfSpeech?: string,
  missingContext?: {
    missingVietnamese?: boolean;
    missingExample?: boolean;
    missingEnglish?: boolean;
    missingPhonetic?: boolean;
    missingCefr?: boolean;
  }
): Promise<GeminiEnrichmentData | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const cleanWord = word.trim();
  if (!cleanWord) return null;

  if (apiKey) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite'];

    const targetPosNotice = partOfSpeech ? `\nCRITICAL: The user has explicitly selected the part of speech as "${partOfSpeech.trim()}". You MUST strictly provide definitions, Vietnamese meanings, and an example sentence for "${cleanWord}" acting as a "${partOfSpeech.trim()}". Do NOT provide meanings for other parts of speech.` : '';

    const promptText = `Analyze the English word/phrase "${cleanWord}"${partOfSpeech ? ` (as a ${partOfSpeech})` : ''}:${targetPosNotice}

1. Check if "${cleanWord}" is misspelled (e.g. "relentness" is a typo for "relentless"). If misspelled, set "isTypo": true and "correctedWord": "relentless".
2. For vietnameseMeaning: Provide 2 to 3 most accurate and natural Vietnamese meanings strictly corresponding to the word as a ${partOfSpeech || 'given part of speech'}. Output only the Vietnamese meanings separated by commas (e.g. "nghĩa 1, nghĩa 2"). Do NOT output placeholders like "Nghĩa của...".
3. For englishMeaning: A concise, accurate English definition strictly matching the word as a ${partOfSpeech || 'given part of speech'}.
4. For partOfSpeech: Exact part of speech (${partOfSpeech || 'noun, verb, adjective, adverb, preposition, conjunction, phrase'}).
5. For phonetic: Accurate standard IPA transcription (e.g. "/.../").
6. For cefrLevel: CEFR level ("A1", "A2", "B1", "B2", "C1", "C2").
7. For exampleSentence: A COMPLETE, natural, grammatically correct full English sentence (with subject, verb, and proper punctuation) showing the word functioning strictly as a ${partOfSpeech || 'specified part of speech'}. MUST NOT be a mere phrase, collocation or incomplete clause.
8. For topic taxonomy: Choose the MOST suitable subtopicId from this taxonomy:
   - env.climate, env.wildlife, env.energy, env.pollution, env.disaster
   - tech.ai, tech.cyber, tech.space, tech.bio, tech.digital
   - biz.career, biz.finance, biz.marketing, biz.trade, biz.leadership
   - edu.university, edu.pedagogy, edu.exams, edu.research
   - health.diet, health.mental, health.disease, health.care
   - soc.equality, soc.arts, soc.heritage, soc.law
   - urban.planning, urban.transit, urban.housing
   - travel.eco, travel.aviation, travel.customs
   - life.family, life.food, life.finance, life.leisure
   - gov.diplomacy, gov.aid, gov.globalization

Return ONLY a raw JSON object with no markdown formatting, no codeblocks (do NOT use \`\`\`json):
{
  "isTypo": false,
  "correctedWord": "${cleanWord}",
  "vietnameseMeaning": "nghĩa 1, nghĩa 2",
  "englishMeaning": "Concise English definition",
  "partOfSpeech": "${partOfSpeech || 'noun'}",
  "phonetic": "/IPA/",
  "cefrLevel": "B1",
  "exampleSentence": "A complete, natural English sentence.",
  "majorTopicId": "env",
  "subtopicId": "env.climate",
  "confidence": 0.95
}`;

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const response = await axios.post(
          url,
          {
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
            },
          },
          {
            timeout: 7000,
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const cleanedText = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(cleanedText);

          const rawVi = parsed.vietnameseMeaning || '';
          const rawEng = parsed.englishMeaning || '';
          const rawEx = parsed.exampleSentence || '';

          let topicInfo: TopicClassification | null = null;
          if (parsed.subtopicId) {
            topicInfo = findTopicDetails(parsed.subtopicId);
          }
          if (!topicInfo) {
            const localLookup = fastLookupTopicByKeywords(cleanWord, rawVi, rawEx);
            if (localLookup) {
              topicInfo = findTopicDetails(localLookup.subtopicId);
            }
          }

          return {
            isTypo: Boolean(parsed.isTypo),
            correctedWord: parsed.correctedWord || cleanWord,
            vietnameseMeaning: isDummyPlaceholder(rawVi) ? '' : rawVi,
            englishMeaning: isDummyPlaceholder(rawEng) ? '' : rawEng,
            partOfSpeech: parsed.partOfSpeech || partOfSpeech || 'noun',
            phonetic: parsed.phonetic || '',
            cefrLevel: parsed.cefrLevel || 'B1',
            exampleSentence: isDummyPlaceholder(rawEx) ? '' : rawEx,
            topicClassification: topicInfo,
          };
        }
      } catch (err) {
        // Try next model if endpoint fails
      }
    }
  }

  // Fallback if GEMINI_API_KEY is not set or request timed out:
  // Use spell correction dictionary, free translation API, and local fast topic lookup
  try {
    const fallbackVi = await fallbackTranslateVietnamese(cleanWord);
    const corrected = getCorrectedWord(cleanWord);
    const isTypo = corrected.toLowerCase() !== cleanWord.toLowerCase();

    let topicInfo: TopicClassification | null = null;
    const localLookup = fastLookupTopicByKeywords(cleanWord, fallbackVi, '');
    if (localLookup) {
      topicInfo = findTopicDetails(localLookup.subtopicId);
    }

    return {
      isTypo,
      correctedWord: corrected,
      vietnameseMeaning: isDummyPlaceholder(fallbackVi) ? '' : fallbackVi,
      englishMeaning: '',
      partOfSpeech: getPartOfSpeechForWord(corrected, partOfSpeech),
      phonetic: `/${corrected}/`,
      cefrLevel: corrected.length > 8 ? 'B2' : 'B1',
      exampleSentence: '',
      topicClassification: topicInfo,
    };
  } catch {
    return null;
  }
}

/**
 * Classify a single existing card/word into the topic taxonomy.
 */
export async function classifySingleWord(
  term: string,
  partOfSpeech?: string,
  vietnameseMeaning?: string,
  exampleSentence?: string
): Promise<TopicClassification> {
  const local = fastLookupTopicByKeywords(term, vietnameseMeaning, exampleSentence);
  if (local) {
    const details = findTopicDetails(local.subtopicId);
    if (details) return details;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `Classify this English vocabulary card into the exact subtopicId below:
Taxonomy:
- env.climate, env.wildlife, env.energy, env.pollution, env.disaster
- tech.ai, tech.cyber, tech.space, tech.bio, tech.digital
- biz.career, biz.finance, biz.marketing, biz.trade, biz.leadership
- edu.university, edu.pedagogy, edu.exams, edu.research
- health.diet, health.mental, health.disease, health.care
- soc.equality, soc.arts, soc.heritage, soc.law
- urban.planning, urban.transit, urban.housing
- travel.eco, travel.aviation, travel.customs
- life.family, life.food, life.finance, life.leisure
- gov.diplomacy, gov.aid, gov.globalization

Card info:
Word: "${term}"
Part of speech: "${partOfSpeech || 'noun'}"
Meaning: "${vietnameseMeaning || ''}"
Example: "${exampleSentence || ''}"

Return ONLY a raw JSON with no markdown (no \`\`\`json):
{"subtopicId": "chosen.subtopic", "confidence": 0.95}`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        },
        { timeout: 5000 }
      );
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.subtopicId) {
          const found = findTopicDetails(parsed.subtopicId);
          if (found) {
            found.confidence = parsed.confidence || 0.9;
            return found;
          }
        }
      }
    } catch {}
  }

  // Default fallback if not recognized
  return {
    majorTopicId: 'life',
    majorTopicName: 'Daily Life, Family & Relationships',
    subtopicId: 'life.leisure',
    subtopicName: 'Hobbies, Sports & Leisure',
    confidence: 0.5,
  };
}

/**
 * Batch classify a list of cards using a single Gemini prompt to save tokens & time.
 */
export async function batchClassifyWords(
  cardsToClassify: Array<{ id: string; term: string; vietnameseMeaning?: string; exampleSentence?: string }>
): Promise<Map<string, TopicClassification>> {
  const results = new Map<string, TopicClassification>();
  if (!cardsToClassify || cardsToClassify.length === 0) return results;

  // First pass: resolve using fast local keyword lookup
  const unclassified: Array<{ id: string; term: string; vietnameseMeaning?: string; exampleSentence?: string }> = [];
  for (const c of cardsToClassify) {
    const local = fastLookupTopicByKeywords(c.term, c.vietnameseMeaning, c.exampleSentence);
    if (local) {
      const details = findTopicDetails(local.subtopicId);
      if (details) {
        results.set(c.id, details);
        continue;
      }
    }
    unclassified.push(c);
  }

  if (unclassified.length === 0) return results;

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    // Fill remaining with sensible fallback
    for (const c of unclassified) {
      results.set(c.id, {
        majorTopicId: 'life',
        majorTopicName: 'Daily Life, Family & Relationships',
        subtopicId: 'life.leisure',
        subtopicName: 'Hobbies, Sports & Leisure',
        confidence: 0.5,
      });
    }
    return results;
  }

  // Process in chunks of 15 cards per Gemini prompt for maximum reliability & speed
  const chunkSize = 15;
  for (let i = 0; i < unclassified.length; i += chunkSize) {
    const chunk = unclassified.slice(i, i + chunkSize);
    const itemsText = chunk
      .map((c) => `- ID: ${c.id} | Word: "${c.term}" | Meaning: "${(c.vietnameseMeaning || '').slice(0, 80)}"`)
      .join('\n');

    const prompt = `Classify each English vocabulary card into the best matching subtopicId from this taxonomy:
- env.climate, env.wildlife, env.energy, env.pollution, env.disaster
- tech.ai, tech.cyber, tech.space, tech.bio, tech.digital
- biz.career, biz.finance, biz.marketing, biz.trade, biz.leadership
- edu.university, edu.pedagogy, edu.exams, edu.research
- health.diet, health.mental, health.disease, health.care
- soc.equality, soc.arts, soc.heritage, soc.law
- urban.planning, urban.transit, urban.housing
- travel.eco, travel.aviation, travel.customs
- life.family, life.food, life.finance, life.leisure
- gov.diplomacy, gov.aid, gov.globalization

Cards:
${itemsText}

Return ONLY a raw JSON array with objects matching:
[
  {"id": "card_id", "subtopicId": "chosen.subtopic"}
]`;

    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        },
        { timeout: 7000 }
      );
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsedArray = JSON.parse(cleaned);
        if (Array.isArray(parsedArray)) {
          for (const item of parsedArray) {
            if (item.id && item.subtopicId) {
              const details = findTopicDetails(item.subtopicId);
              if (details) {
                results.set(item.id, details);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Batch topic classification error for chunk:', e);
    }

    // Fallback for any cards in this chunk that couldn't be classified by Gemini
    for (const c of chunk) {
      if (!results.has(c.id)) {
        // Attempt secondary heuristic lookup
        const secondary = fastLookupTopicByKeywords(c.term, c.vietnameseMeaning, c.exampleSentence);
        const details = secondary ? findTopicDetails(secondary.subtopicId) : null;
        results.set(c.id, details || {
          majorTopicId: 'life',
          majorTopicName: 'Daily Life, Family & Relationships',
          subtopicId: 'life.leisure',
          subtopicName: 'Hobbies, Sports & Leisure',
          confidence: 0.5,
        });
      }
    }
  }

  return results;
}


const COMMON_TYPOS: Record<string, { corrected: string; pos: string; vi: string; eng: string; eg: string }> = {
  relentness: {
    corrected: 'relentless',
    pos: 'adjective',
    vi: 'không ngừng nghỉ, tàn nhẫn, kiên cường',
    eng: 'without pity; not allowing anything to keep one from what one is doing or trying to do',
    eg: 'The police fight a relentless battle against crime.',
  },
  scarcly: {
    corrected: 'scarcely',
    pos: 'adverb',
    vi: 'hiếm khi, hầu như không, vừa mới',
    eng: 'only just; not quite',
    eg: 'I can scarcely hear you.',
  },
  deliberit: {
    corrected: 'deliberate',
    pos: 'adjective',
    vi: 'cố ý, thận trọng, có tính toán',
    eng: 'done consciously and intentionally',
    eg: 'That was a deliberate lie.',
  },
};

function getCorrectedWord(word: string): string {
  const clean = word.trim().toLowerCase();
  if (COMMON_TYPOS[clean]) return COMMON_TYPOS[clean].corrected;
  return word;
}

function getPartOfSpeechForWord(word: string, fallbackPos?: string): string {
  const clean = word.trim().toLowerCase();
  if (COMMON_TYPOS[clean]) return COMMON_TYPOS[clean].pos;
  if (clean.endsWith('ness')) return 'noun';
  if (clean.endsWith('less')) return 'adjective';
  if (clean.endsWith('ly')) return 'adverb';
  return fallbackPos || 'noun';
}

async function fallbackTranslateVietnamese(text: string): Promise<string> {
  const clean = text.trim().toLowerCase();
  if (COMMON_TYPOS[clean]) return COMMON_TYPOS[clean].vi;

  const dict: Record<string, string> = {
    scarcely: 'hiếm khi, hầu như không, vừa mới',
    relentless: 'không ngừng nghỉ, tàn nhẫn, kiên cường',
    restlessness: 'bồn chồn, sự thao thức, sự không yên',
    designate: 'chỉ định, bổ nhiệm, định rõ',
    trough: 'máng ăn, vùng lõm, vùng áp suất thấp',
  };

  if (dict[clean]) return dict[clean];

  try {
    const res = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(clean)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        timeout: 4000,
      }
    );
    const mainTrans = res.data?.[0]?.[0]?.[0];
    if (mainTrans && typeof mainTrans === 'string' && !mainTrans.toLowerCase().includes('het tien')) {
      return mainTrans.trim();
    }
  } catch {}

  return '';
}
