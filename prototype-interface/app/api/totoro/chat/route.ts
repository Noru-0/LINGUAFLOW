import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const MAX_DAILY_PROMPTS = 20

// In-memory daily usage tracker (keyed by IP + YYYY-MM-DD)
const dailyUsageMap = new Map<string, number>()

function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'local-user'
  const today = new Date().toISOString().slice(0, 10)
  return `${ip}_${today}`
}

function getDailyUsage(key: string): number {
  return dailyUsageMap.get(key) || 0
}

function incrementDailyUsage(key: string): number {
  const current = getDailyUsage(key)
  const next = current + 1
  dailyUsageMap.set(key, next)
  return next
}

const TOTORO_SYSTEM_PROMPT = `Bạn là Totoro (🍃 Totoro 🐾), một người bạn đồng hành AI siêu dễ thương, thông minh, ấm áp và luôn khích lệ người học tiếng Anh trên ứng dụng LinguaFlow.
LinguaFlow là ứng dụng học tiếng Anh toàn diện với Spaced Repetition SRS, luyện điền từ Fill-in-the-blank, luyện dịch AI, luyện nói Speaking Shadowing, và học cụm từ Collocations.

Phong cách trò chuyện của bạn:
- Xưng hô thân mật: "Totoro" và "bạn".
- Giọng điệu: Vui vẻ, dễ thương, đầy năng lượng tích cực, dùng các biểu tượng emoji tự nhiên (🍃, ⭐, 🌿, 🐾, 💖, ✨, 🚀, 💡, 📚).
- Khả năng chuyên môn:
  1. Giải đáp mọi thắc mắc tiếng Anh: Nghĩa của từ/cụm từ, phát âm IPA, từ đồng nghĩa/trái nghĩa, collocations, ví dụ thực tế.
  2. Hướng dẫn ngữ pháp, mẹo nhớ lâu (Spaced Repetition, Shadowing, đặt câu cá nhân hoá).
  3. Lời khuyên luyện thi IELTS/TOEIC, phương pháp học tập hiệu quả.
  4. Động viên tinh thần, câu đố từ vựng mini (Quiz), bài tập hít thở thư giãn.
- Định dạng: Trình bày đẹp mắt với Markdown (in đậm từ khóa quan trọng, gạch đầu dòng gọn gàng), độ dài vừa phải (khoảng 2-4 đoạn ngắn), không lan man.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history } = body as {
      message?: string
      history?: { sender: 'totoro' | 'user'; text: string }[]
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Nội dung tin nhắn không hợp lệ.' }, { status: 400 })
    }

    const clientKey = getClientIdentifier(req)
    const currentUsage = getDailyUsage(clientKey)

    if (currentUsage >= MAX_DAILY_PROMPTS) {
      return NextResponse.json(
        {
          error: 'limit_exceeded',
          reply: `🍃 Bạn đã sử dụng hết giới hạn ${MAX_DAILY_PROMPTS}/${MAX_DAILY_PROMPTS} câu hỏi AI hôm nay. Hãy tiếp tục ôn tập từ vựng trên LinguaFlow và quay lại trò chuyện với Totoro vào ngày mai nhé! 💖`,
          usageCount: currentUsage,
          maxDaily: MAX_DAILY_PROMPTS,
          remaining: 0,
        },
        { status: 429 }
      )
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    // Build messages conversation array for DeepSeek Chat
    const formattedHistory = (history || [])
      .slice(-6)
      .map((item) => ({
        role: item.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: item.text,
      }))

    const deepseekMessages = [
      { role: 'system' as const, content: TOTORO_SYSTEM_PROMPT },
      ...formattedHistory,
      { role: 'user' as const, content: message.trim() },
    ]

    let aiReply = ''

    // 1. Try DeepSeek AI API (deepseek-chat)
    if (deepseekApiKey) {
      const endpoints = [
        'https://api.deepseek.com/chat/completions',
        'https://api.deepseek.com/v1/chat/completions',
      ]

      for (const endpoint of endpoints) {
        try {
          const res = await axios.post(
            endpoint,
            {
              model: 'deepseek-chat',
              messages: deepseekMessages,
              temperature: 0.7,
              max_tokens: 600,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${deepseekApiKey}`,
              },
              timeout: 15000,
            }
          )

          const replyContent = res.data?.choices?.[0]?.message?.content
          if (replyContent && typeof replyContent === 'string') {
            aiReply = replyContent.trim()
            break
          }
        } catch (err: any) {
          console.warn(`[Totoro DeepSeek] Endpoint ${endpoint} failed:`, err?.response?.data || err?.message)
        }
      }
    }

    // 2. Fallback to Gemini 1.5/2.0 Flash if DeepSeek is unavailable
    if (!aiReply && geminiApiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`
        const prompt = `${TOTORO_SYSTEM_PROMPT}\n\nLịch sử hội thoại:\n${(history || [])
          .slice(-4)
          .map((h) => `${h.sender === 'user' ? 'Người học' : 'Totoro'}: ${h.text}`)
          .join('\n')}\n\nNgười học: ${message.trim()}\nTotoro:`

        const res = await axios.post(
          geminiUrl,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          },
          { timeout: 12000 }
        )

        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          aiReply = text.trim()
        }
      } catch (geminiErr: any) {
        console.warn('[Totoro Gemini Fallback] Failed:', geminiErr?.message)
      }
    }

    // Fallback if AI providers failed completely
    if (!aiReply) {
      aiReply = `🍃 Totoro đã nhận câu hỏi của bạn: "${message.trim()}". Hiện tại kết nối AI đang chập chờn một chút, nhưng Totoro luôn ở đây đồng hành cùng bạn! Hãy thử lại sau vài giây nhé! ⭐`
    }

    // Increment daily usage count
    const newUsage = incrementDailyUsage(clientKey)
    const remaining = Math.max(0, MAX_DAILY_PROMPTS - newUsage)

    return NextResponse.json({
      reply: aiReply,
      usageCount: newUsage,
      maxDaily: MAX_DAILY_PROMPTS,
      remaining,
      date: new Date().toISOString().slice(0, 10),
    })
  } catch (error: any) {
    console.error('[Totoro Chat API Error]:', error)
    return NextResponse.json(
      {
        error: 'server_error',
        reply: '🍃 Ôi, có chút trục trặc nhỏ khi kết nối đến Totoro. Bạn thử gửi lại câu hỏi nhé! 🐾',
      },
      { status: 500 }
    )
  }
}
