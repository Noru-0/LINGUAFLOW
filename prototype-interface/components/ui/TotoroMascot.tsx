'use client'

import React, { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  sender: 'totoro' | 'user'
  text: string
  timestamp: string
  options?: { label: string; action: string }[]
}

const MAX_DAILY_PROMPTS = 20
const STORAGE_KEY = 'totoro_daily_usage_v1'

const TOTORO_GREETINGS = [
  '🍃 Totoro chào bạn! Hôm nay bạn sẵn sàng học thêm từ mới chưa?',
  '⭐ Chào bạn! Cùng LinguaFlow tích lũy XP hôm nay nhé!',
  '☕ Nhớ nghỉ ngơi mắt và uống chút nước trong lúc học nha!',
  '🌱 Mỗi từ vựng bạn học hôm nay là một bước tiến lớn cho tương lai!',
  '🌧️ Dù thời tiết thế nào, Totoro vẫn luôn ở đây đồng hành cùng bạn!',
  '⚡ Cố lên nhé! Totoro tin bạn làm được!',
]

function getLocalUsage(): { date: string; count: number } {
  if (typeof window === 'undefined') return { date: new Date().toISOString().slice(0, 10), count: 0 }
  try {
    const today = new Date().toISOString().slice(0, 10)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.date === today) {
        return parsed
      }
    }
    const fresh = { date: today, count: 0 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  } catch {
    return { date: new Date().toISOString().slice(0, 10), count: 0 }
  }
}

function saveLocalUsage(count: number) {
  if (typeof window === 'undefined') return
  try {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }))
  } catch {}
}

export function TotoroMascot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [speechBubble, setSpeechBubble] = useState<string>('')
  const [showSpeech, setShowSpeech] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [breathingMode, setBreathingMode] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in')
  const [breathTimer, setBreathTimer] = useState(4)

  const [dailyUsage, setDailyUsage] = useState<number>(0)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'totoro',
      text: '🍃 Chào bạn! Tôi là Totoro AI (tích hợp DeepSeek AI). Hãy hỏi tôi bất cứ điều gì về từ vựng, ngữ pháp, mẹo học hoặc tâm sự nhé! (Giới hạn: 20 câu/ngày)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize usage counter from localStorage
  useEffect(() => {
    const usage = getLocalUsage()
    setDailyUsage(usage.count)
  }, [])

  // Web Audio Synth for cute popup sound
  const playCuteSound = (type: 'pop' | 'chime' | 'boing' = 'pop') => {
    if (!soundEnabled || typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      const now = ctx.currentTime
      if (type === 'pop') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, now)
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08)
        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
        osc.start(now)
        osc.stop(now + 0.08)
      } else if (type === 'chime') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(523.25, now) // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1) // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2) // G5
        gain.gain.setValueAtTime(0.12, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
        osc.start(now)
        osc.stop(now + 0.35)
      } else if (type === 'boing') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, now)
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.15)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
        osc.start(now)
        osc.stop(now + 0.2)
      }
    } catch {
      // Ignore audio context autoplay restrictions
    }
  }

  // Periodic greeting speech bubble when chat is closed
  useEffect(() => {
    const updateGreeting = () => {
      const randomGreeting = TOTORO_GREETINGS[Math.floor(Math.random() * TOTORO_GREETINGS.length)]
      setSpeechBubble(randomGreeting)
      setShowSpeech(true)

      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current)
      speechTimeoutRef.current = setTimeout(() => {
        setShowSpeech(false)
      }, 7000)
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 25000)

    return () => {
      clearInterval(interval)
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current)
    }
  }, [])

  // Auto scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  // Breathing exercise timer
  useEffect(() => {
    if (!breathingMode) return

    const timer = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          setBreathPhase((currentPhase) => {
            if (currentPhase === 'in') return 'hold'
            if (currentPhase === 'hold') return 'out'
            return 'in'
          })
          return 4
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [breathingMode])

  const handleToggleChat = () => {
    playCuteSound('pop')
    if (isMinimized) {
      setIsMinimized(false)
      setIsOpen(true)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const addTotoroReply = (text: string, options?: { label: string; action: string }[]) => {
    setIsTyping(false)
    playCuteSound('chime')
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'totoro',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options,
      },
    ])
  }

  const handleUserSendMessage = async (userText: string) => {
    if (!userText.trim() || isTyping) return

    const currentLocal = getLocalUsage()
    if (currentLocal.count >= MAX_DAILY_PROMPTS) {
      playCuteSound('boing')
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'user',
          text: userText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'totoro',
          text: `🍃 Bạn đã dùng hết ${MAX_DAILY_PROMPTS}/${MAX_DAILY_PROMPTS} câu hỏi AI của ngày hôm nay rồi. Hãy tiếp tục ôn tập từ vựng trên LinguaFlow và quay lại trò chuyện với Totoro vào ngày mai nhé! 💖`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setInputValue('')
      return
    }

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: formattedTime,
    }

    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInputValue('')
    setIsTyping(true)
    playCuteSound('pop')

    try {
      const res = await fetch('/api/totoro/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: nextMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      })

      const data = await res.json()

      if (res.ok && data.reply) {
        const newCount = data.usageCount ?? (currentLocal.count + 1)
        setDailyUsage(newCount)
        saveLocalUsage(newCount)
        addTotoroReply(data.reply)
      } else if (data.error === 'limit_exceeded') {
        const newCount = MAX_DAILY_PROMPTS
        setDailyUsage(newCount)
        saveLocalUsage(newCount)
        addTotoroReply(data.reply || `🍃 Bạn đã đạt giới hạn ${MAX_DAILY_PROMPTS} câu hỏi hôm nay. Hãy quay lại vào ngày mai nhé!`)
      } else {
        addTotoroReply(data.reply || '🍃 Totoro đang suy nghĩ thêm một chút, bạn thử gửi lại câu hỏi nhé! 🐾')
      }
    } catch {
      setIsTyping(false)
      addTotoroReply('🍃 Ôi, kết nối AI gặp chút gián đoạn. Bạn kiểm tra lại đường truyền và hỏi lại Totoro nhé! ⭐')
    }
  }

  const handleOptionClick = (action: string, label: string) => {
    if (action === 'action_breathing') {
      setBreathingMode(true)
      addTotoroReply('🌿 Hãy cùng Totoro thả lỏng vai, nhắm mắt nhẹ và hít thở sâu theo nhịp đồng hồ phía trên nhé!')
      return
    }

    handleUserSendMessage(label)
  }

  const remainingPrompts = Math.max(0, MAX_DAILY_PROMPTS - dailyUsage)
  const isLimitReached = dailyUsage >= MAX_DAILY_PROMPTS

  return (
    <div className="fixed bottom-6 right-6 z-[99990] flex flex-col items-end font-sans select-none">
      {/* Speech Bubble when chat is closed */}
      {!isOpen && showSpeech && speechBubble && (
        <div
          className="totoro-speech-bubble mb-3 max-w-[240px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold leading-relaxed animate-bounce-short relative cursor-pointer"
          onClick={handleToggleChat}
        >
          {speechBubble}
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-slate-800" />
        </div>
      )}

      {/* Main Totoro Float Button */}
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          className="totoro-float-btn group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-700 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/40 dark:border-slate-700/60"
          title="Nói chuyện với Totoro AI 🍃"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md group-hover:bg-emerald-400/50 transition-all" />

          {/* SVG Totoro Illustration */}
          <svg className="w-12 h-12 relative z-10 drop-shadow-md totoro-svg-animated" viewBox="0 0 100 100" fill="none">
            {/* Leaf Umbrella Stem & Leaf */}
            <path d="M 50 18 Q 50 8 40 4 Q 30 1 20 8 Q 15 15 25 22 Q 40 28 50 18 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <path d="M 50 18 Q 52 35 50 40" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />

            {/* Ears */}
            <ellipse cx="36" cy="28" rx="5" ry="12" fill="#64748b" transform="rotate(-12 36 28)" className="totoro-ear-left" />
            <ellipse cx="64" cy="28" rx="5" ry="12" fill="#64748b" transform="rotate(12 64 28)" className="totoro-ear-right" />

            {/* Main Body */}
            <ellipse cx="50" cy="62" rx="34" ry="30" fill="#64748b" />
            <circle cx="50" cy="46" r="26" fill="#64748b" />

            {/* White Belly */}
            <ellipse cx="50" cy="66" rx="24" ry="22" fill="#f8fafc" />

            {/* Belly Chevron Leaf Patterns ^ ^ ^ */}
            <path
              d="M 42 54 L 45 51 L 48 54 M 52 54 L 55 51 L 58 54 M 47 61 L 50 58 L 53 61 M 38 63 L 41 60 L 44 63 M 56 63 L 59 60 L 62 63"
              stroke="#475569"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Eyes */}
            <circle cx="38" cy="42" r="5" fill="#ffffff" />
            <circle cx="62" cy="42" r="5" fill="#ffffff" />
            <circle cx="39" cy="42" r="2.5" fill="#0f172a" className="totoro-eye-pupil" />
            <circle cx="61" cy="42" r="2.5" fill="#0f172a" className="totoro-eye-pupil" />

            {/* Nose & Whiskers */}
            <polygon points="48,46 52,46 50,49" fill="#1e293b" />
            <line x1="22" y1="46" x2="33" y2="47" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="51" x2="32" y2="50" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="78" y1="46" x2="67" y2="47" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="80" y1="51" x2="68" y2="50" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            {/* Mini White Totoro sitting on side */}
            <ellipse cx="78" cy="74" rx="7" ry="9" fill="#ffffff" />
            <ellipse cx="75" cy="67" rx="1.5" ry="3" fill="#ffffff" transform="rotate(-10 75 67)" />
            <ellipse cx="81" cy="67" rx="1.5" ry="3" fill="#ffffff" transform="rotate(10 81 67)" />
            <circle cx="76" cy="72" r="1" fill="#0f172a" />
            <circle cx="80" cy="72" r="1" fill="#0f172a" />
          </svg>

          {/* Status Badge */}
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
        </button>
      )}

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="totoro-chat-modal w-[360px] sm:w-[390px] h-[520px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-slide-up relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-700 text-white p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-white/20 p-1 flex items-center justify-center backdrop-blur-sm border border-white/30">
                <span className="text-lg">🍃</span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Totoro AI 🐾
                  <span className="text-[10px] bg-emerald-400/30 text-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300/30 font-semibold">
                    DeepSeek AI
                  </span>
                </h3>
                <p className="text-[10.5px] text-emerald-100/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping" />
                  Hôm nay: <strong className="text-white">{dailyUsage}/{MAX_DAILY_PROMPTS}</strong> câu (còn {remainingPrompts})
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 transition-colors text-xs"
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 transition-colors text-sm font-bold"
                title="Đóng chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Breathing Mode Banner if active */}
          {breathingMode && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-2.5 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="animate-spin text-base">🌿</span>
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-200">
                    {breathPhase === 'in' && 'Hít vào thật sâu... 🌬️'}
                    {breathPhase === 'hold' && 'Giữ hơi thở... ⏳'}
                    {breathPhase === 'out' && 'Thở ra từ từ... 🍃'}
                  </span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Đếm ngược: {breathTimer}s</p>
                </div>
              </div>
              <button
                onClick={() => setBreathingMode(false)}
                className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-1 rounded-md hover:bg-emerald-300"
              >
                Hoàn thành
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-scrollbar text-xs">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[88%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Interactive option buttons if provided */}
                {msg.options && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt.action, opt.label)}
                        className="text-[11px] bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-xl transition-all active:scale-95 shadow-xs font-medium"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl w-fit">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1 text-emerald-600 dark:text-emerald-400 font-medium">Totoro DeepSeek AI đang trả lời...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleOptionClick('action_tip', 'Cho tôi 1 mẹo ghi nhớ từ vựng tiếng Anh hay và thực tế')}
              className="whitespace-nowrap text-[11px] bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              💡 Mẹo học từ
            </button>
            <button
              onClick={() => handleOptionClick('action_quiz', 'Đố tôi 1 câu hỏi từ vựng tiếng Anh thú vị')}
              className="whitespace-nowrap text-[11px] bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              🎲 Đố từ vựng
            </button>
            <button
              onClick={() => handleOptionClick('action_quote', 'Gửi tôi một câu danh ngôn truyền động lực học tập')}
              className="whitespace-nowrap text-[11px] bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              ⚡ Động lực
            </button>
            <button
              onClick={() => handleOptionClick('action_breathing', 'Thư giãn')}
              className="whitespace-nowrap text-[11px] bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              🌿 Thư giãn
            </button>
          </div>

          {/* Text Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleUserSendMessage(inputValue)
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              disabled={isLimitReached}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isLimitReached
                  ? 'Đã hết 20 câu hỏi hôm nay. Hẹn gặp lại ngày mai!'
                  : 'Hỏi Totoro AI (từ vựng, ngữ pháp, mẹo học, IELTS)...'
              }
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping || isLimitReached}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
