import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch {}

import { db, fallbackToSqlite } from '../lib/db';
import { collocations } from '../lib/db/schema';
import { INITIAL_COLLOCATIONS } from '../lib/db/initial_collocations';

interface ExtractedCollocation {
  category: string;
  head_word: string;
  tail_chunk: string;
  full_phrase: string;
  context_sentence: string;
  vietnamese_meaning: string;
  distractors: string[];
  cefr_level?: string;
}

/**
 * Extraction helper using Gemini 2.5 Flash API
 */
async function extractCollocationsFromText(chunkText: string, unitIndex: number): Promise<ExtractedCollocation[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Warning] GEMINI_API_KEY is not set. Skipping LLM extraction.');
    return [];
  }

  const prompt = `
  Bạn là một chuyên gia ngôn ngữ học tiếng Anh & IELTS. Hãy đọc đoạn văn bản sau được trích từ sách "English Collocations in Use".
  Nhiệm vụ của bạn là trích xuất TẤT CẢ các collocations (cụm từ cố định) xuất hiện trong phần lý thuyết (thường có tiêu đề A, B, C). BỎ QUA bài tập (Exercises).

  Với mỗi collocation:
  - category: Tên bài/chủ đề (ví dụ: 'Everyday Verbs: Make/Do', 'Intensifying Adverbs', 'Topic: Weather')
  - head_word: Từ khóa chính (ví dụ: 'make', 'heavy', 'bitterly')
  - tail_chunk: Cụm đi kèm (ví dụ: 'an effort', 'rain', 'disappointed')
  - full_phrase: Cụm đầy đủ (ví dụ: 'make an effort', 'heavy rain')
  - context_sentence: Một câu ngữ cảnh hoàn chỉnh chứa cụm từ
  - vietnamese_meaning: Nghĩa tiếng Việt chính xác, tự nhiên
  - distractors: Mảng gồm đúng 3 đáp án nhiễu (lỗi sai phổ biến của người học, ví dụ: ['do an effort', 'take an effort', 'give an effort'])
  - cefr_level: 'B1' | 'B2' | 'C1' | 'C2'

  Trả về DUY NHẤT một mảng JSON các objects (không kèm markdown codeblock):
  [
    {
      "category": "Everyday Verbs: Make/Do",
      "head_word": "make",
      "tail_chunk": "an effort",
      "full_phrase": "make an effort",
      "context_sentence": "You should make an effort to arrive on time.",
      "vietnamese_meaning": "nỗ lực, cố gắng",
      "distractors": ["do an effort", "take an effort", "give an effort"],
      "cefr_level": "B2"
    }
  ]

  Văn bản nguồn:
  """
  ${chunkText}
  """
  `;

  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        },
        { timeout: 12000 }
      );

      const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) return parsed;
    } catch (err: any) {
      console.warn(`[Unit ${unitIndex}] Model ${model} failed:`, err.message);
    }
  }

  return [];
}

/**
 * Seed collocations into Database (Postgres / SQLite)
 */
async function seedInitialCollocations() {
  console.log('🔄 Đang đồng bộ bộ dữ liệu Cambridge Collocations vào Database...');
  let activeDb = db;

  try {
    for (const item of INITIAL_COLLOCATIONS) {
      const record = {
        id: item.id,
        category: item.category,
        headWord: item.head_word,
        tailChunk: item.tail_chunk,
        fullPhrase: item.full_phrase,
        meaningVi: item.meaning_vi,
        exampleSentence: item.example_sentence,
        distractorsJson: JSON.stringify(item.distractors || []),
        cefrLevel: item.cefr_level,
        ieltsTopic: item.ielts_topic,
      };

      try {
        await activeDb.insert(collocations).values(record);
      } catch {
        try {
          activeDb = fallbackToSqlite();
          await activeDb.insert(collocations).values(record);
        } catch {}
      }
    }
    console.log(`✅ Hoàn tất nạp ${INITIAL_COLLOCATIONS.length} cụm từ Collocations chuẩn vào Database!`);
  } catch (error: any) {
    console.error('❌ Lỗi khi nạp dữ liệu collocations:', error.message);
  }
}

// Run execution
seedInitialCollocations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal seed error:', err);
    process.exit(1);
  });

export { extractCollocationsFromText, seedInitialCollocations };
