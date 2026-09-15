import axios from 'axios'
import { db, fallbackToSqlite } from '@/lib/db'
import { translationParagraphs } from '@/lib/db/schema'

const THEMES = [
  { category: 'Daily Life, Family & Community', level: 'A2-B1' },
  { category: 'Education & Emerging Technology', level: 'B2-C1' },
  { category: 'Environment & Sustainable Living', level: 'B1-C1' },
  { category: 'Work, Career & Modern Society', level: 'B1-B2' },
  { category: 'Culture, Heritage & Globalisation', level: 'B2-C1' },
  { category: 'Artificial Intelligence, Ethics & Society', level: 'C1-C2' },
  { category: 'Global Economics, Trade & Governance', level: 'C1-C2' },
  { category: 'Health, Neuroscience & Psychology', level: 'B2-C2' },
]

export async function generateParagraphBatch(batchSize = 25) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.')
  }

  const chosenTheme = THEMES[Math.floor(Math.random() * THEMES.length)]
  console.log(`[Paragraph Generator] Generating ${batchSize} weekly paragraph prompts across CEFR levels (A2-C2) for theme: "${chosenTheme.category}"...`)

  const prompt = `
Bạn là giám khảo và chuyên gia biên soạn đề thi IELTS Writing band 8.5+ hàng đầu.
Hãy tạo đúng ${batchSize} bài tập luyện dịch đoạn văn từ Tiếng Việt sang Tiếng Anh.
Phân bổ đều các cấp độ CEFR từ A2, B1, B2, C1 đến C2 thuộc các chủ đề đa dạng bao gồm "${chosenTheme.category}".

Mỗi phần tử trong mảng JSON trả về phải chứa đầy đủ 6 thuộc tính:
1. "themeCategory": Tên nhóm chủ đề (ví dụ: "Education & Technology", "Environment", "Daily Life", "Economics").
2. "subTopic": Tên chủ đề con bằng tiếng Anh (ví dụ: "The Impact of Artificial Intelligence on Higher Education").
3. "targetBand": Band trình độ mục tiêu ("A2", "B1", "B2", "C1", hoặc "C2").
4. "vietnameseParagraph": Một đoạn văn tiếng Việt hoàn chỉnh từ 3 đến 5 câu có tính liên kết (cohesion), tự nhiên, giàu ý tưởng IELTS.
5. "targetCollocations": Mảng 3-5 cụm từ / collocations học thuật nên dùng: [{ "term": "digital literacy", "meaning": "năng lực số" }].
6. "modelTranslation": Một bài dịch mẫu tiếng Anh xuất sắc đạt IELTS Band 7.5 - 8.5+, văn phong trang trọng, chuẩn xác.
7. "grammarBreakdown": Giải thích 2-3 điểm ngữ pháp / cấu trúc câu đắt giá trong bài mẫu.

Yêu cầu trả về duy nhất mảng JSON thuần túy (Array of JSON Objects), không bọc thêm văn bản giải thích.
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

  const nowIso = new Date().toISOString()
  const records = rawData.map((item: any, idx: number) => ({
    id: `para_gen_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    themeCategory: item.themeCategory || chosenTheme.category,
    subTopic: item.subTopic || 'IELTS Writing Task',
    targetBand: (item.targetBand || 'B2').toUpperCase(),
    vietnameseParagraph: item.vietnameseParagraph,
    targetCollocationsJson: JSON.stringify(item.targetCollocations || []),
    modelTranslation: item.modelTranslation,
    grammarBreakdown: item.grammarBreakdown,
    createdAt: nowIso,
  }))

  let activeDb = db
  try {
    await activeDb.insert(translationParagraphs).values(records)
  } catch (err) {
    console.warn('[Paragraph Generator] Primary database insert failed, attempting SQLite fallback...', err)
    activeDb = fallbackToSqlite()
    await activeDb.insert(translationParagraphs).values(records)
  }

  console.log(`[Paragraph Generator] Successfully ingested ${records.length} new paragraph exercises into the database.`)
  return records
}
