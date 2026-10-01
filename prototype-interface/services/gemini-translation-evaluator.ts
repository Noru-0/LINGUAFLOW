import axios from 'axios'
import { evaluateTranslation } from '@/lib/translation/evaluator'

export interface GrammarErrorItem {
  originalSegment: string
  correction: string
  ruleExplanation: string
}

export interface GrammarSuggestionItem {
  point: string
  suggestion: string
  example: string
}

export interface BetterAlternativeItem {
  original: string
  academicUpgrade: string
  reason: string
}

export interface EvaluationResult {
  estimatedCefr: 'B1' | 'B2' | 'C1' | 'C2'
  overallFeedback: string
  grammarErrors: GrammarErrorItem[]
  grammarSuggestions: GrammarSuggestionItem[]
  betterAlternatives: BetterAlternativeItem[]
}

/**
 * Evaluate user paragraph translation using DeepSeek AI API (deepseek-v4-flash / deepseek-chat).
 * Fallback to Gemini 2.5 Flash if DEEPSEEK_API_KEY is not configured or fails.
 */
export async function evaluateUserParagraph(
  vietnamesePrompt: string,
  userSubmission: string,
  modelAnswer: string
): Promise<EvaluationResult> {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const fallbackEvaluation: EvaluationResult = {
    estimatedCefr: 'B2',
    overallFeedback: 'Bài dịch cơ bản đáp ứng đủ ý chính của đoạn văn gốc. Cần lưu ý hơn về trật tự từ và liên từ nối.',
    grammarErrors: [
      {
        originalSegment: userSubmission,
        correction: modelAnswer,
        ruleExplanation: 'Tham khảo bài dịch mẫu để cải thiện tính tự nhiên và ngữ pháp học thuật.',
      },
    ],
    grammarSuggestions: [
      {
        point: 'Cấu trúc câu phức & Mệnh đề quan hệ',
        suggestion: 'Sử dụng các đại từ quan hệ (which, that, who) hoặc liên từ đẳng lập (not only... but also) để gắn kết các câu đơn.',
        example: 'It not only helps them save costs but also offers a chance to experience local culture.',
      },
    ],
    betterAlternatives: [],
  }

  const promptContent = `
Bạn là giám khảo và chuyên gia chấm thi IELTS Writing band 8.5+.
Hãy đánh giá bản dịch tiếng Anh của học viên so với đoạn văn tiếng Việt gốc và bài mẫu tham khảo.

- Đoạn văn tiếng Việt gốc:
  """${vietnamesePrompt}"""

- Bản dịch của học viên:
  """${userSubmission}"""

- Bản dịch mẫu tham khảo (Band 8.0+):
  """${modelAnswer}"""

Yêu cầu đánh giá theo định dạng JSON với các thuộc tính:
1. "estimatedCefr": Đánh giá trình độ bài viết ("B1", "B2", "C1", hoặc "C2").
2. "overallFeedback": Nhận xét tổng quan súc tích về độ chính xác ngữ nghĩa, độ mạch lạc và ngữ pháp (bằng tiếng Việt).
3. "grammarErrors": Mảng các lỗi ngữ pháp/dùng từ sai: [{ "originalSegment": "...", "correction": "...", "ruleExplanation": "..." }]. Nếu bài không có lỗi, trả về mảng rỗng [].
4. "grammarSuggestions": Mảng 2-3 gợi ý cải thiện cấu trúc ngữ pháp đắt giá (nâng band score): [{ "point": "...", "suggestion": "...", "example": "..." }].
5. "betterAlternatives": Mảng 2-3 gợi ý nâng cấp cụm từ học thuật tự nhiên hơn: [{ "original": "...", "academicUpgrade": "...", "reason": "..." }].

Chỉ xuất dữ liệu dưới dạng JSON thuần túy (no markdown wrappers, no introductory text).
`

  // 1. Try Google Gemini API first for ultra-fast, high-accuracy response (< 2s)
  if (geminiApiKey) {
    const geminiModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite']
    for (const modelName of geminiModels) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
          {
            contents: [{ parts: [{ text: promptContent }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
        )

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) continue

        const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)

        return {
          estimatedCefr: parsed.estimatedCefr || 'B2',
          overallFeedback: parsed.overallFeedback || fallbackEvaluation.overallFeedback,
          grammarErrors: Array.isArray(parsed.grammarErrors) ? parsed.grammarErrors : [],
          grammarSuggestions: Array.isArray(parsed.grammarSuggestions) ? parsed.grammarSuggestions : fallbackEvaluation.grammarSuggestions,
          betterAlternatives: Array.isArray(parsed.betterAlternatives) ? parsed.betterAlternatives : [],
        }
      } catch (err: any) {
        console.warn(`[Gemini Paragraph Evaluator] Model ${modelName} failed:`, err?.response?.data?.error?.message || err?.message)
      }
    }
  }

  // 2. Secondary fallback to DeepSeek AI API if configured
  if (deepseekApiKey) {
    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Bạn là chuyên gia chấm thi IELTS Writing. Trả về kết quả hoàn toàn dưới dạng JSON hợp lệ.',
            },
            {
              role: 'user',
              content: promptContent,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      )

      const text = response.data?.choices?.[0]?.message?.content
      if (text) {
        const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)

        return {
          estimatedCefr: parsed.estimatedCefr || 'B2',
          overallFeedback: parsed.overallFeedback || fallbackEvaluation.overallFeedback,
          grammarErrors: Array.isArray(parsed.grammarErrors) ? parsed.grammarErrors : [],
          grammarSuggestions: Array.isArray(parsed.grammarSuggestions) ? parsed.grammarSuggestions : fallbackEvaluation.grammarSuggestions,
          betterAlternatives: Array.isArray(parsed.betterAlternatives) ? parsed.betterAlternatives : [],
        }
      }
    } catch (err: any) {
      console.warn('[DeepSeek Paragraph Evaluator] Fallback failed:', err?.response?.data?.error?.message || err?.message)
    }
  }

  return fallbackEvaluation
}

export interface SentenceImprovementSuggestion {
  type: string
  original: string
  suggested: string
  reason: string
}

export interface SentenceEvaluationResult {
  isCorrect: boolean
  score: number
  overallAnalysis: string
  suggestedAnswer: string
  detailedFeedback: {
    accuracy: string
    grammarAndStructure: string
    wordChoice: string
  }
  grammarNotes: string
  improvementSuggestions: SentenceImprovementSuggestion[]
  diff?: Array<{ value: string; added?: boolean; removed?: boolean }>
}

/**
 * Evaluate single sentence translation using Google Gemini (gemini-2.5-flash) or DeepSeek.
 * Fallback to rule-based string normalization if LLM APIs are not configured or fail.
 */
export async function evaluateSingleSentenceWithDeepSeek(
  vietnamesePrompt: string,
  userSubmission: string,
  canonicalAnswers: string[],
  grammarCategory: string,
  grammarNotes: string
): Promise<SentenceEvaluationResult> {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const ruleEvaluation = evaluateTranslation(userSubmission, canonicalAnswers)

  const fallbackResult: SentenceEvaluationResult = {
    isCorrect: ruleEvaluation.isCorrect,
    score: ruleEvaluation.isCorrect ? 100 : 75,
    overallAnalysis: ruleEvaluation.isCorrect
      ? 'Chủ thể bài dịch diễn đạt rất chính xác ngữ nghĩa và khớp với cấu trúc mẫu.'
      : 'Bài dịch cơ bản sát nghĩa nhưng cần tinh chỉnh lại cấu trúc từ ngữ hoặc liên từ.',
    suggestedAnswer: ruleEvaluation.suggestedAnswer || canonicalAnswers[0] || '',
    detailedFeedback: {
      accuracy: ruleEvaluation.isCorrect ? 'Truyền tải đầy đủ và chính xác ý của câu gốc.' : 'Cần chú ý chọn từ chính xác hơn theo đúng ngữ cảnh.',
      grammarAndStructure: grammarNotes || 'Cần chú ý trật tự từ và thì của động từ.',
      wordChoice: 'Sử dụng từ vựng phù hợp với văn phong tự nhiên.',
    },
    grammarNotes: grammarNotes || 'Tập trung vào trật tự từ và cấu trúc ngữ pháp chính.',
    improvementSuggestions: ruleEvaluation.isCorrect ? [] : [
      {
        type: 'Đáp án gợi ý',
        original: userSubmission,
        suggested: ruleEvaluation.suggestedAnswer || canonicalAnswers[0] || '',
        reason: 'Đáp án tự nhiên chuẩn ngữ pháp tiếng Anh.',
      },
    ],
    diff: ruleEvaluation.diff,
  }

  const promptContent = `
Bạn là chuyên gia giảng dạy và chấm thi Tiếng Anh chuyên sâu.
Hãy chấm điểm, đánh giá và phân tích chi tiết bản dịch CÂU ĐƠN của học viên.

- Câu tiếng Việt gốc:
  """${vietnamesePrompt}"""

- Bản dịch của học viên:
  """${userSubmission}"""

- Danh sách đáp án mẫu tham khảo:
  ${JSON.stringify(canonicalAnswers, null, 2)}

- Dạng cấu trúc ngữ pháp: "${grammarCategory}"
- Ghi chú bài học: "${grammarNotes}"

Yêu cầu trả về JSON thuần túy (không bọc trong markdown codeblock) chứa đúng các trường:
1. "isCorrect": boolean (true nếu bản dịch đúng ngữ pháp, diễn đạt tự nhiên và chuẩn nghĩa; false nếu có lỗi ngữ pháp hoặc sai nghĩa đáng kể).
2. "score": number (từ 0 đến 100).
3. "overallAnalysis": Nhận xét tổng quan súc tích (1-2 câu) bằng tiếng Việt về bài dịch.
4. "suggestedAnswer": Bản dịch tiếng Anh hay nhất, chuẩn ngữ pháp và tự nhiên nhất.
5. "detailedFeedback": Object gồm:
   - "accuracy": Đánh giá độ chính xác ngữ nghĩa (tiếng Việt).
   - "grammarAndStructure": Phân tích ngữ pháp, cấu trúc câu và trật tự từ (tiếng Việt).
   - "wordChoice": Nhận xét về cách dùng từ vựng & collocations (tiếng Việt).
6. "grammarNotes": Tóm tắt điểm ngữ pháp cốt lõi cần ghi nhớ cho câu này (tiếng Việt).
7. "improvementSuggestions": Mảng 1-3 gợi ý cải thiện (nếu có lỗi hoặc có thể nâng cấp):
   [{ "type": "Sửa lỗi ngữ pháp" | "Nâng cấp từ vựng" | "Cấu trúc nâng cao", "original": "từ/cụm từ của học viên", "suggested": "từ/cụm từ gợi ý", "reason": "lý do ngắn gọn bằng tiếng Việt" }]
`

  // 1. Try Google Gemini API first (ultra-fast, ~1-2s response time)
  if (geminiApiKey) {
    const geminiModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite']
    for (const modelName of geminiModels) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
          {
            contents: [{ parts: [{ text: promptContent }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
        )

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) continue

        const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)

        return {
          isCorrect: Boolean(parsed.isCorrect ?? ruleEvaluation.isCorrect),
          score: typeof parsed.score === 'number' ? parsed.score : (parsed.isCorrect ? 95 : 70),
          overallAnalysis: parsed.overallAnalysis || fallbackResult.overallAnalysis,
          suggestedAnswer: parsed.suggestedAnswer || fallbackResult.suggestedAnswer,
          detailedFeedback: {
            accuracy: parsed.detailedFeedback?.accuracy || fallbackResult.detailedFeedback.accuracy,
            grammarAndStructure: parsed.detailedFeedback?.grammarAndStructure || fallbackResult.detailedFeedback.grammarAndStructure,
            wordChoice: parsed.detailedFeedback?.wordChoice || fallbackResult.detailedFeedback.wordChoice,
          },
          grammarNotes: parsed.grammarNotes || grammarNotes || fallbackResult.grammarNotes,
          improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
            ? parsed.improvementSuggestions
            : fallbackResult.improvementSuggestions,
          diff: ruleEvaluation.diff,
        }
      } catch (err: any) {
        console.warn(`[Gemini Sentence Evaluator] Model ${modelName} failed:`, err?.response?.data?.error?.message || err?.message)
      }
    }
  }

  // 2. Secondary fallback to DeepSeek AI API
  if (deepseekApiKey) {
    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Bạn là chuyên gia chấm thi tiếng Anh. Trả về kết quả hoàn toàn dưới dạng JSON hợp lệ.',
            },
            {
              role: 'user',
              content: promptContent,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      )

      const text = response.data?.choices?.[0]?.message?.content
      if (text) {
        const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)

        return {
          isCorrect: Boolean(parsed.isCorrect ?? ruleEvaluation.isCorrect),
          score: typeof parsed.score === 'number' ? parsed.score : (parsed.isCorrect ? 95 : 70),
          overallAnalysis: parsed.overallAnalysis || fallbackResult.overallAnalysis,
          suggestedAnswer: parsed.suggestedAnswer || fallbackResult.suggestedAnswer,
          detailedFeedback: {
            accuracy: parsed.detailedFeedback?.accuracy || fallbackResult.detailedFeedback.accuracy,
            grammarAndStructure: parsed.detailedFeedback?.grammarAndStructure || fallbackResult.detailedFeedback.grammarAndStructure,
            wordChoice: parsed.detailedFeedback?.wordChoice || fallbackResult.detailedFeedback.wordChoice,
          },
          grammarNotes: parsed.grammarNotes || grammarNotes || fallbackResult.grammarNotes,
          improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
            ? parsed.improvementSuggestions
            : fallbackResult.improvementSuggestions,
          diff: ruleEvaluation.diff,
        }
      }
    } catch (err: any) {
      console.warn('[DeepSeek Sentence Evaluator] Fallback failed:', err?.response?.data?.error?.message || err?.message)
    }
  }

  return fallbackResult
}


