'use client'

import React, { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  sender: 'totoro' | 'user'
  text: string
  timestamp: string
  options?: { label: string; action: string }[]
}

const TOTORO_GREETINGS = [
  '🍃 Totoro chào bạn! Hôm nay bạn sẵn sàng học thêm từ mới chưa?',
  '⭐ Chào bạn! Cùng LinguaFlow tích lũy XP hôm nay nhé!',
  '☕ Nhớ nghỉ ngơi mắt và uống chút nước trong lúc học nha!',
  '🌱 Mỗi từ vựng bạn học hôm nay là một bước tiến lớn cho tương lai!',
  '🌧️ Dù thời tiết thế nào, Totoro vẫn luôn ở đây đồng hành cùng bạn!',
  '⚡ Cố lên nhé! Totoro tin bạn làm được!',
]

const STUDY_TIPS = [
  '💡 **Phương pháp Spaced Repetition**: Hãy ôn lại từ mới sau 1 ngày, 3 ngày, 7 ngày và 30 ngày để ghi nhớ dài hạn!',
  '🧠 **Học theo Collocation**: Đừng học từ đơn lẻ! Học cả cụm từ như "make a decision" hay "take responsibility" sẽ giúp bạn nói tự nhiên hơn.',
  '🎧 **Phương pháp Shadowing**: Nghe và nói nhại lại ngay lập tức theo người bản xứ để luyện ngữ điệu và phát âm chuẩn.',
  '📝 **Đặt câu cá nhân hóa**: Đặt câu chứa từ mới liên quan trực tiếp đến cuộc sống của bạn sẽ giúp bộ não ghi nhớ gấp 3 lần!',
  '⏱️ **Kỹ thuật Pomodoro**: Học tập trung 25 phút, nghỉ 5 phút. Totoro sẽ nhắc bạn nghỉ ngơi đúng lúc!',
]

const MOTIVATION_QUOTES = [
  '🌟 "Hành trình ngàn dặm bắt đầu từ một bước chân." - Lão Tử',
  '🚀 Bạn không cần phải giỏi mới bắt đầu, nhưng bạn phải bắt đầu để trở nên giỏi!',
  '🎋 Sự kiên trì mỗi ngày 15 phút sẽ đánh bại 3 tiếng học nhồi nhét cuối tuần!',
  '💖 Đừng so sánh bản thân với người khác. Hãy giỏi hơn chính mình của ngày hôm qua!',
  '🏆 Mục tiêu IELTS/C1 không còn xa nếu bạn duy trì streak học mỗi ngày!',
]

const VOCAB_QUIZZES = [
  {
    question: 'Từ "Resilient" nghĩa là gì?',
    options: ['A) Dễ vỡ', 'B) Kiên cường, phục hồi nhanh', 'C) Lười biếng', 'D) Cẩn thận'],
    correctIndex: 1,
    explanation: '✨ Chính xác! "Resilient" /rɪˈzɪl.jənt/ là tính từ chỉ khả năng phục hồi nhanh chóng sau khó khăn, kiên cường!',
  },
  {
    question: 'Cụm từ "Out of the blue" có nghĩa là gì?',
    options: ['A) Màu xanh biển', 'B) Bất ngờ, không báo trước', 'C) Buồn rầu', 'D) Rất xa xôi'],
    correctIndex: 1,
    explanation: '✨ Tuyệt vời! "Out of the blue" = completely unexpected (hoàn toàn bất ngờ, từ trên trời rơi xuống)!',
  },
  {
    question: 'Từ nào đồng nghĩa với "Crucial"?',
    options: ['A) Minor', 'B) Vital / Essential', 'C) Optional', 'D) Easy'],
    correctIndex: 1,
    explanation: '✨ Rất chuẩn! "Crucial" /ˈkruː.ʃəl/ nghĩa là cực kỳ quan trọng, thiết yếu (= Vital, Essential).',
  },
]

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

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'totoro',
      text: '🍃 Chào bạn! Tôi là Totoro, bạn đồng hành học tập của bạn tại LinguaFlow! Bạn cần tôi giúp gì hôm nay?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    setIsTyping(true)
    playCuteSound('chime')

    setTimeout(() => {
      setIsTyping(false)
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
    }, 600)
  }

  const handleUserSendMessage = (userText: string) => {
    if (!userText.trim()) return

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: formattedTime,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    playCuteSound('pop')

    // Bot response logic
    const lower = userText.toLowerCase()

    if (lower.includes('mẹo') || lower.includes('học') || lower.includes('nhớ') || lower.includes('phương pháp')) {
      const tip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]
      addTotoroReply(`🍃 Totoro dành riêng cho bạn mẹo này:\n\n${tip}`)
    } else if (lower.includes('động lực') || lower.includes('nản') || lower.includes('mệt') || lower.includes('cố lên')) {
      const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]
      addTotoroReply(`💖 Đừng nản lòng nhé! Totoro gửi bạn chút năng lượng tích cực:\n\n${quote}`)
    } else if (lower.includes('quiz') || lower.includes('đố') || lower.includes('hỏi') || lower.includes('từ vựng')) {
      const quiz = VOCAB_QUIZZES[Math.floor(Math.random() * VOCAB_QUIZZES.length)]
      addTotoroReply(`🎲 **Thử thách từ vựng nhanh từ Totoro:**\n\n${quiz.question}\n\n${quiz.options.join('\n')}`, [
        { label: quiz.options[0], action: `quiz_ans_0_${quiz.correctIndex}` },
        { label: quiz.options[1], action: `quiz_ans_1_${quiz.correctIndex}` },
        { label: quiz.options[2], action: `quiz_ans_2_${quiz.correctIndex}` },
        { label: quiz.options[3], action: `quiz_ans_3_${quiz.correctIndex}` },
      ])
    } else if (lower.includes('chào') || lower.includes('hi') || lower.includes('hello') || lower.includes('totoro')) {
      addTotoroReply('🍃 Vùuuu! Totoro chào bạn nha! Hôm nay việc học tập của bạn tiến triển thế nào rồi?')
    } else if (lower.includes('ielts') || lower.includes('speaking') || lower.includes('writing') || lower.includes('reading')) {
      addTotoroReply('📚 Để chinh phục IELTS:\n1. **Reading**: Luyện Skimming & Scanning.\n2. **Listening**: Tập chép chính tả (Dictation).\n3. **Speaking**: Nói tự tin, chú trọng độ lưu khoát.\n4. **Writing**: Dùng cấu trúc câu đa dạng & từ nối tự nhiên.\n\nTotoro luôn ở bên hỗ trợ bạn!')
    } else if (lower.includes('thư giãn') || lower.includes('thở') || lower.includes('stress')) {
      setBreathingMode(true)
      addTotoroReply('🌿 Hãy cùng Totoro thả lỏng vai, nhắm mắt nhẹ và hít thở sâu theo nhịp đồng hồ phía trên nhé!')
    } else {
      addTotoroReply(`🐾 Totoro đã lắng nghe bạn! "${userText}"\n\nHãy giữ vững tinh thần học tập nhé! Bạn có muốn thử 1 câu đố từ vựng hoặc xin mẹo học tập không?`, [
        { label: '💡 Cho tôi mẹo học', action: 'action_tip' },
        { label: '🎲 Đố tôi 1 từ', action: 'action_quiz' },
        { label: '⚡ Nạp động lực', action: 'action_quote' },
      ])
    }
  }

  const handleOptionClick = (action: string, label: string) => {
    // Render user choice
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: label,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])

    if (action === 'action_tip') {
      const tip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]
      addTotoroReply(`💡 Mẹo học hay:\n\n${tip}`)
    } else if (action === 'action_quote') {
      const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]
      addTotoroReply(`⚡ Động lực cho bạn:\n\n${quote}`)
    } else if (action === 'action_quiz') {
      const quiz = VOCAB_QUIZZES[Math.floor(Math.random() * VOCAB_QUIZZES.length)]
      addTotoroReply(`🎲 **Thử thách từ vựng:**\n\n${quiz.question}`, [
        { label: quiz.options[0], action: `quiz_ans_0_${quiz.correctIndex}` },
        { label: quiz.options[1], action: `quiz_ans_1_${quiz.correctIndex}` },
        { label: quiz.options[2], action: `quiz_ans_2_${quiz.correctIndex}` },
        { label: quiz.options[3], action: `quiz_ans_3_${quiz.correctIndex}` },
      ])
    } else if (action.startsWith('quiz_ans_')) {
      const parts = action.split('_')
      const chosen = parseInt(parts[2], 10)
      const correct = parseInt(parts[3], 10)

      if (chosen === correct) {
        playCuteSound('chime')
        addTotoroReply('🎉 **CHÍNH XÁC 100%!** Bạn thật xuất sắc! +10 XP tinh thần từ Totoro! 🌟')
      } else {
        playCuteSound('boing')
        addTotoroReply('😅 Chưa chính xác rồi! Nhưng không sao cả, thử lại ở câu sau nhé! Cố lên bạn ơi! 💪')
      }
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[99990] flex flex-col items-end font-sans select-none">
      {/* Speech Bubble when chat is closed */}
      {!isOpen && showSpeech && speechBubble && (
        <div className="totoro-speech-bubble mb-3 max-w-[240px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold leading-relaxed animate-bounce-short relative cursor-pointer"
             onClick={handleToggleChat}>
          {speechBubble}
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-slate-800" />
        </div>
      )}

      {/* Main Totoro Float Button */}
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          className="totoro-float-btn group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-700 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/40 dark:border-slate-700/60"
          title="Nói chuyện với Totoro 🍃"
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
            <path d="M 42 54 L 45 51 L 48 54 M 52 54 L 55 51 L 58 54 M 47 61 L 50 58 L 53 61 M 38 63 L 41 60 L 44 63 M 56 63 L 59 60 L 62 63"
                  stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

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
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-700 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white/20 p-1 flex items-center justify-center backdrop-blur-sm border border-white/30">
                <span className="text-xl">🍃</span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Totoro 🐾
                  <span className="text-[10px] bg-emerald-400/30 text-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300/30">
                    LinguaCompanion
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-100/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping" />
                  Sẵn sàng đồng hành cùng bạn
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5">
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
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
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
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
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
                <span className="text-[10px] ml-1 text-slate-400">Totoro đang nghĩ...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleOptionClick('action_tip', '💡 Mẹo học hay')}
              className="whitespace-nowrap text-[11px] bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              💡 Mẹo học từ
            </button>
            <button
              onClick={() => handleOptionClick('action_quiz', '🎲 Thử thách từ vựng')}
              className="whitespace-nowrap text-[11px] bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              🎲 Quiz 10s
            </button>
            <button
              onClick={() => handleOptionClick('action_quote', '⚡ Tiếp động lực')}
              className="whitespace-nowrap text-[11px] bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              ⚡ Động lực
            </button>
            <button
              onClick={() => {
                setBreathingMode(true)
                addTotoroReply('🌿 Thở sâu 1 phút cùng Totoro giúp giảm căng thẳng và tăng 30% khả năng tập trung!')
              }}
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
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi Totoro bất cứ điều gì (mẹo học, từ vựng, tâm sự)..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
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
