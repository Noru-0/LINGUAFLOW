import axios from 'axios'
import { db, fallbackToSqlite } from '@/lib/db'
import { translationPrompts } from '@/lib/db/schema'

const PATTERN_CATEGORIES = [
  'Core Patterns (S+V, S+V+O, S+V+C, S+V+Oi+Od, S+V+O+Co)',
  'Passive Voice & Impersonal Passive',
  'Causative & Existential Clauses (Have/Get, There + be/exist)',
  'Gerund Subject & Infinitive of Purpose',
  'Participle Phrases (Active, Passive, Perfect)',
  'Cleft Sentences & Inversion (Emphasis, Negative/Locative Inversion)',
  'Conditionals & Subjunctive (Type 1-3, Mixed, Inverted)',
  'Reported Speech & Special Reporting Verbs',
  'Relative Clauses (Defining, Non-defining, Preposition + Which/Whom, Reduced)',
  'Adverbial Clauses (Concession, Cause & Effect, Purpose)',
]

export async function generateSentenceBatch(batchSize = 30) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.')
  }

  const chosenCategory = PATTERN_CATEGORIES[Math.floor(Math.random() * PATTERN_CATEGORIES.length)]
  console.log(`[Sentence Generator] Generating ${batchSize} weekly sentence prompts for pattern category: "${chosenCategory}"...`)

  const prompt = `
Bạn là chuyên gia ngữ pháp và biên soạn đề thi tiếng Anh (IELTS / CEFR).
Hãy tạo đúng ${batchSize} bài tập dịch câu đơn / câu phức từ Tiếng Việt sang Tiếng Anh.
Tập trung chuyên sâu vào nhóm cấu trúc ngữ pháp: "${chosenCategory}".

Mỗi phần tử trong mảng JSON trả về phải chứa 5 thuộc tính:
1. "vietnameseText": Câu tiếng Việt gốc chuẩn nghĩa, tự nhiên (chủ đề công việc, xã hội, đời sống, khoa học).
2. "canonicalAnswers": Mảng 2-3 câu dịch tiếng Anh chuẩn (canonical answers) chính xác tuyệt đối.
3. "grammarCategory": "${chosenCategory}"
4. "grammarNotes": Giải thích ngắn gọn công thức ngữ pháp và lưu ý khi dịch.
5. "difficulty": Trình độ CEFR ("A2", "B1", "B2", "C1", hoặc "C2").

Trả về duy nhất mảng JSON thuần túy (Array of JSON Objects), không kèm văn bản giải thích.
`

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
  )

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini API')

  const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim()
  const rawData = JSON.parse(cleanJson)

  const records = rawData.map((item: any, idx: number) => ({
    id: `prompt_gen_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    vietnameseText: item.vietnameseText,
    canonicalAnswersJson: JSON.stringify(item.canonicalAnswers || [item.canonicalAnswer || '']),
    grammarCategory: item.grammarCategory || chosenCategory,
    grammarNotes: item.grammarNotes || 'Tự động bổ sung bằng Gemini AI',
    difficulty: (item.difficulty || 'B2').toUpperCase(),
  }))

  let activeDb = db
  try {
    await activeDb.insert(translationPrompts).values(records)
  } catch (err) {
    console.warn('[Sentence Generator] Primary DB insert failed, fallback to SQLite...', err)
    activeDb = fallbackToSqlite()
    await activeDb.insert(translationPrompts).values(records)
  }

  console.log(`[Sentence Generator] Successfully ingested ${records.length} new sentence prompts.`)
  return records
}
