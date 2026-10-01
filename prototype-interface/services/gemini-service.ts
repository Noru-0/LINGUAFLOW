import axios from 'axios';

export interface GeminiEnrichmentData {
  vietnameseMeaning: string;
  englishMeaning: string;
  partOfSpeech: string;
  phonetic: string;
  cefrLevel: string;
  exampleSentence: string;
  isTypo?: boolean;
  correctedWord?: string;
}

export function isDummyPlaceholder(text: string): boolean {
  if (!text) return true;
  const lower = text.trim().toLowerCase();
  if (lower.startsWith('nghĩa của') || lower.startsWith('nghĩa tiếng việt')) return true;
  if (lower.startsWith('definition of') || lower.startsWith('meaning of')) return true;
  if (lower.includes('an example sentence containing') || lower.includes('example sentence with')) return true;
  return false;
}

/**
 * Fetch vocabulary enrichment using Google Gemini 1.5 Flash (gemini-1.5-flash).
 * Includes auto-detection for misspelled words (e.g. "relentness" -> "relentless")
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

Return ONLY a raw JSON object with no markdown formatting, no codeblocks (do NOT use \`\`\`json):
{
  "isTypo": false,
  "correctedWord": "${cleanWord}",
  "vietnameseMeaning": "nghĩa 1, nghĩa 2",
  "englishMeaning": "Concise English definition",
  "partOfSpeech": "${partOfSpeech || 'noun'}",
  "phonetic": "/IPA/",
  "cefrLevel": "B1",
  "exampleSentence": "A complete, natural English sentence."
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

          return {
            isTypo: Boolean(parsed.isTypo),
            correctedWord: parsed.correctedWord || cleanWord,
            vietnameseMeaning: isDummyPlaceholder(rawVi) ? '' : rawVi,
            englishMeaning: isDummyPlaceholder(rawEng) ? '' : rawEng,
            partOfSpeech: parsed.partOfSpeech || partOfSpeech || 'noun',
            phonetic: parsed.phonetic || '',
            cefrLevel: parsed.cefrLevel || 'B1',
            exampleSentence: isDummyPlaceholder(rawEx) ? '' : rawEx,
          };
        }
      } catch (err) {
        // Try next model if endpoint fails
      }
    }
  }

  // Fallback if GEMINI_API_KEY is not set or request timed out:
  // Use spell correction dictionary & free translation API
  try {
    const fallbackVi = await fallbackTranslateVietnamese(cleanWord);
    const corrected = getCorrectedWord(cleanWord);
    const isTypo = corrected.toLowerCase() !== cleanWord.toLowerCase();

    return {
      isTypo,
      correctedWord: corrected,
      vietnameseMeaning: isDummyPlaceholder(fallbackVi) ? '' : fallbackVi,
      englishMeaning: '',
      partOfSpeech: getPartOfSpeechForWord(corrected, partOfSpeech),
      phonetic: `/${corrected}/`,
      cefrLevel: corrected.length > 8 ? 'B2' : 'B1',
      exampleSentence: '',
    };
  } catch {
    return null;
  }
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
