'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Check,
  RefreshCw,
  Volume2,
  ArrowRight,
  Zap,
  BookOpen,
  Layers,
  Lightbulb,
  HelpCircle,
  X,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { INITIAL_COLLOCATIONS, InitialCollocation } from '@/lib/db/initial_collocations'

export interface CollocationItem {
  id: string
  head_word: string
  tail_chunk: string
  full_phrase: string
  meaning_vi: string
  example_sentence: string
  cefr_level: string
  ielts_topic: string
}

// Helper to replace collocation in example sentence with a blank gap
function formatSentenceWithBlank(sentence: string, fullPhrase: string, headWord: string, tailChunk: string) {
  if (!sentence) return { before: 'In this context, we need to ', phraseInSentence: fullPhrase, after: ' .' }

  const lowerSent = sentence.toLowerCase()
  const lowerPhrase = fullPhrase.toLowerCase()

  // 1. Direct match
  const idx = lowerSent.indexOf(lowerPhrase)
  if (idx !== -1) {
    return {
      before: sentence.substring(0, idx),
      phraseInSentence: sentence.substring(idx, idx + fullPhrase.length),
      after: sentence.substring(idx + fullPhrase.length),
    }
  }

  // 2. Try match using headWord & tailChunk
  const lowerHead = headWord.toLowerCase()
  const lowerTail = tailChunk.toLowerCase()
  const headIdx = lowerSent.indexOf(lowerHead)
  const tailIdx = lowerSent.indexOf(lowerTail)

  if (headIdx !== -1 && tailIdx !== -1 && headIdx < tailIdx) {
    const start = headIdx
    const end = tailIdx + lowerTail.length
    return {
      before: sentence.substring(0, start),
      phraseInSentence: sentence.substring(start, end),
      after: sentence.substring(end),
    }
  }

  // 3. Fallback: split around headWord
  if (headIdx !== -1) {
    return {
      before: sentence.substring(0, headIdx),
      phraseInSentence: fullPhrase,
      after: sentence.substring(headIdx + headWord.length),
    }
  }

  return {
    before: sentence + ' ( ',
    phraseInSentence: fullPhrase,
    after: ' )',
  }
}

// Helper to generate first-letter hints for collocation
function generateHintPattern(phrase: string): string {
  return phrase
    .split(' ')
    .map((word) => {
      if (word.length <= 2) return word
      return word[0] + '_'.repeat(word.length - 1)
    })
    .join(' ')
}

export function CollocationMatcher() {
  const [practiceMode, setPracticeMode] = useState<'context' | 'matching'>('context')
  const [allCollocations, setAllCollocations] = useState<CollocationItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')

  // Context Practice State
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [userTypedAnswer, setUserTypedAnswer] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState<boolean>(false)
  const [streak, setStreak] = useState<number>(0)
  const [inputMode, setInputMode] = useState<'choice' | 'typing'>('choice')

  // Dual Column Matching State
  const BATCH_SIZE = 4
  const [batchIndex, setBatchIndex] = useState(0)
  const [currentBatch, setCurrentBatch] = useState<CollocationItem[]>([])
  const [heads, setHeads] = useState<string[]>([])
  const [tails, setTails] = useState<string[]>([])
  const [selectedHead, setSelectedHead] = useState<string | null>(null)
  const [selectedTail, setSelectedTail] = useState<string | null>(null)
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [failedAttempts, setFailedAttempts] = useState<Set<string>>(new Set())
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null)

  // Fetch data
  const fetchCollocations = () => {
    setLoading(true)
    fetch('/api/collocations')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => {
        const list: CollocationItem[] =
          data.collocations && data.collocations.length > 0
            ? data.collocations.map((c: any) => ({
                id: c.id,
                head_word: c.headWord || c.head_word,
                tail_chunk: c.tailChunk || c.tail_chunk,
                full_phrase: c.fullPhrase || c.full_phrase,
                meaning_vi: c.meaningVi || c.meaning_vi,
                example_sentence: c.exampleSentence || c.example_sentence,
                cefr_level: c.cefrLevel || c.cefr_level || 'C1',
                ielts_topic: c.ieltsTopic || c.ielts_topic || 'Academic',
              }))
            : INITIAL_COLLOCATIONS
        setAllCollocations(list)
        setLoading(false)
      })
      .catch(() => {
        setAllCollocations(INITIAL_COLLOCATIONS)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCollocations()
  }, [])

  // Filtered List
  const filteredList = allCollocations.filter((item) => {
    const matchTopic = selectedTopic === 'ALL' || item.ielts_topic === selectedTopic
    const matchLevel = selectedLevel === 'ALL' || item.cefr_level === selectedLevel
    return matchTopic && matchLevel
  })

  const currentItem = filteredList[currentIndex] || filteredList[0] || null

  // Generate 4 candidate options for context mode
  useEffect(() => {
    if (!currentItem || allCollocations.length === 0) return

    const correctPhrase = currentItem.full_phrase
    const pool = allCollocations.filter((i) => i.id !== currentItem.id).map((i) => i.full_phrase)
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5).slice(0, 3)
    const fourChoices = [correctPhrase, ...shuffledPool].sort(() => Math.random() - 0.5)

    setOptions(fourChoices)
    setSelectedOption(null)
    setUserTypedAnswer('')
    setIsAnswered(false)
    setIsCorrect(null)
    setShowHint(false)
  }, [currentIndex, currentItem, practiceMode, selectedTopic, selectedLevel, allCollocations])

  // Setup Dual-Column Matching Batch
  const setupMatchingBatch = (items: CollocationItem[], index: number) => {
    const chunk = items.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE)
    setCurrentBatch(chunk)
    setMatchedIds([])
    setSelectedHead(null)
    setSelectedTail(null)
    setFailedAttempts(new Set())
    setMatchFeedback(null)

    setHeads([...chunk.map((i) => i.head_word)].sort(() => Math.random() - 0.5))
    setTails([...chunk.map((i) => i.tail_chunk)].sort(() => Math.random() - 0.5))
  }

  useEffect(() => {
    if (practiceMode === 'matching' && filteredList.length > 0) {
      setupMatchingBatch(filteredList, batchIndex)
    }
  }, [practiceMode, selectedTopic, selectedLevel, allCollocations])

  // Native Speech Synthesis Audio Player
  const playAudio = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      u.rate = 0.9
      window.speechSynthesis.speak(u)
    }
  }

  // Handle Context Answer Submission
  const handleAnswerSubmit = (chosenAnswer?: string) => {
    if (isAnswered || !currentItem) return

    const answerToTest = chosenAnswer || userTypedAnswer || selectedOption || ''
    if (!answerToTest.trim()) return

    const normalizedUser = answerToTest.toLowerCase().replace(/[.,!]/g, '').trim()
    const normalizedCorrect = currentItem.full_phrase.toLowerCase().replace(/[.,!]/g, '').trim()

    // Match checking (allowing slight conjugation match or head_word match)
    const isRight =
      normalizedUser === normalizedCorrect ||
      normalizedUser.includes(currentItem.head_word.toLowerCase()) ||
      normalizedCorrect.includes(normalizedUser)

    setIsAnswered(true)
    setIsCorrect(isRight)

    if (isRight) {
      setStreak((prev) => prev + 1)
      playAudio(currentItem.example_sentence || currentItem.full_phrase)

      // Post SRS rating 3 (Good)
      fetch('/api/collocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collocationId: currentItem.id, rating: 3 }),
      }).catch(() => {})
    } else {
      setStreak(0)
      // Post SRS rating 1 (Again)
      fetch('/api/collocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collocationId: currentItem.id, rating: 1 }),
      }).catch(() => {})
    }
  }

  const handleNextQuestion = () => {
    if (filteredList.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % filteredList.length)
  }

  const handlePrevQuestion = () => {
    if (filteredList.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + filteredList.length) % filteredList.length)
  }

  // Handle Matching Evaluation
  useEffect(() => {
    if (selectedHead && selectedTail && practiceMode === 'matching') {
      const match = currentBatch.find((i) => i.head_word === selectedHead && i.tail_chunk === selectedTail)
      if (match) {
        setMatchedIds((prev) => [...prev, match.id])
        setMatchFeedback(`✨ Chính xác: "${match.full_phrase}" - ${match.meaning_vi}`)
        playAudio(match.full_phrase)

        const isFirstTry = !failedAttempts.has(match.id)
        fetch('/api/collocations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collocationId: match.id, rating: isFirstTry ? 3 : 1 }),
        }).catch(() => {})
      } else {
        const targetCard = currentBatch.find((i) => i.head_word === selectedHead)
        if (targetCard) {
          setFailedAttempts((prev) => new Set(prev).add(targetCard.id))
        }
        setMatchFeedback(`❌ Chưa đúng! Thử ghép lại với từ "${selectedHead}".`)
      }
      setSelectedHead(null)
      setSelectedTail(null)
    }
  }, [selectedHead, selectedTail, currentBatch, practiceMode])

  // Topics extraction
  const availableTopics = Array.from(new Set(allCollocations.map((i) => i.ielts_topic))).filter(Boolean)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '320px' }}>
        <RefreshCw className="animate-spin" size={28} color="#6366f1" />
      </div>
    )
  }

  const blankData = currentItem
    ? formatSentenceWithBlank(
        currentItem.example_sentence,
        currentItem.full_phrase,
        currentItem.head_word,
        currentItem.tail_chunk
      )
    : { before: '', phraseInSentence: '', after: '' }

  const totalMatchingBatches = Math.ceil(filteredList.length / BATCH_SIZE) || 1
  const isMatchingBatchDone = currentBatch.length > 0 && matchedIds.length === currentBatch.length

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8px 0' }} className="select-none">
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              color: '#6366f1',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={14} /> ACADEMIC COLLOCATIONS IN CONTEXT
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 2px 0' }}>
            Học Collocations Theo Ngữ Cảnh Cụ Thể
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
            Điền cụm từ phù hợp vào câu ngữ cảnh thực tế của bài thi IELTS Writing & Speaking.
          </p>
        </div>

        {/* Practice Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
          <button
            type="button"
            onClick={() => setPracticeMode('context')}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: practiceMode === 'context' ? '#6366f1' : 'transparent',
              color: practiceMode === 'context' ? '#ffffff' : '#64748b',
              boxShadow: practiceMode === 'context' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookOpen size={14} /> Điền vào Ngữ Cảnh
          </button>
          <button
            type="button"
            onClick={() => setPracticeMode('matching')}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: practiceMode === 'matching' ? '#6366f1' : 'transparent',
              color: practiceMode === 'matching' ? '#ffffff' : '#64748b',
              boxShadow: practiceMode === 'matching' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Layers size={14} /> Ghép vế Cụm từ
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Topic & Level) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          background: 'rgba(255,255,255,0.7)',
          padding: '10px 14px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Chủ đề IELTS:</span>
          <select
            className="topic-dropdown-select"
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value)
              setCurrentIndex(0)
              setBatchIndex(0)
            }}
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            <option value="ALL">🌐 Tất cả chủ đề ({allCollocations.length} cụm)</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>
                📌 {topic}
              </option>
            ))}
          </select>

          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginLeft: '6px' }}>Cấp độ CEFR:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'B2', 'C1', 'C2'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelectedLevel(lvl)
                  setCurrentIndex(0)
                  setBatchIndex(0)
                }}
                style={{
                  padding: '3px 9px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: selectedLevel === lvl ? '1px solid #6366f1' : '1px solid #cbd5e1',
                  background: selectedLevel === lvl ? '#eef2ff' : '#ffffff',
                  color: selectedLevel === lvl ? '#4f46e5' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                {lvl === 'ALL' ? 'Tất cả' : lvl}
              </button>
            ))}
          </div>
        </div>

        {practiceMode === 'context' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={16} fill="#f59e0b" color="#f59e0b" /> Streak: {streak}
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', background: '#e2e8f0', padding: '3px 9px', borderRadius: '8px' }}>
              {currentIndex + 1} / {filteredList.length || 1}
            </span>
          </div>
        )}
      </div>

      {/* MODE 1: CONTEXTUAL FILL-IN-THE-BLANK (HỌC THEO NGỮ CẢNH CỤ THỂ) */}
      {practiceMode === 'context' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <HelpCircle size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Chưa có cụm từ nào cho bộ lọc này</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '6px 0 16px' }}>Vui lòng chọn lại chủ đề hoặc cấp độ CEFR khác.</p>
              <button
                type="button"
                className="hero-action"
                onClick={() => {
                  setSelectedTopic('ALL')
                  setSelectedLevel('ALL')
                }}
                style={{ margin: '0 auto', padding: '8px 18px', fontSize: '13px' }}
              >
                Reset bộ lọc
              </button>
            </div>
          ) : (
            currentItem && (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {/* Meta Tags Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#e0e7ff', color: '#4338ca', padding: '3px 9px', borderRadius: '6px' }}>
                      {currentItem.ielts_topic || 'IELTS Academic'}
                    </span>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '3px 9px', borderRadius: '6px' }}>
                      CEFR {currentItem.cefr_level || 'C1'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => playAudio(currentItem.example_sentence)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: '1px solid #c7d2fe',
                        background: '#eef2ff',
                        color: '#4f46e5',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Volume2 size={14} /> Phát âm câu mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: '1px solid #fef08a',
                        background: '#fefce8',
                        color: '#a16207',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Lightbulb size={14} /> {showHint ? 'Ẩn gợi ý' : 'Gợi ý chữ cái'}
                    </button>
                  </div>
                </div>

                {/* Context Sentence Card */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1.5px solid #cbd5e1',
                  }}
                >
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    NGỮ CẢNH CÂU (FILL IN THE BLANK):
                  </p>
                  <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#0f172a', lineHeight: 1.6, margin: 0 }}>
                    "{blankData.before}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '140px',
                        padding: '2px 12px',
                        margin: '0 4px',
                        borderRadius: '8px',
                        background: isAnswered
                          ? isCorrect
                            ? '#dcfce7'
                            : '#fee2e2'
                          : '#e0e7ff',
                        color: isAnswered
                          ? isCorrect
                            ? '#15803d'
                            : '#b91c1c'
                          : '#4338ca',
                        borderBottom: isAnswered
                          ? isCorrect
                            ? '3px solid #16a34a'
                            : '3px solid #dc2626'
                          : '3px solid #6366f1',
                        fontWeight: 800,
                        textAlign: 'center',
                      }}
                    >
                      {isAnswered
                        ? isCorrect
                          ? blankData.phraseInSentence
                          : currentItem.full_phrase
                        : showHint
                        ? generateHintPattern(currentItem.full_phrase)
                        : '[ ________________ ]'}
                    </span>
                    {blankData.after}"
                  </h3>

                  {/* Vietnamese Definition Prompt */}
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Sparkles size={16} color="#6366f1" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      Nghĩa tiếng Việt cần điền: <span style={{ color: '#4f46e5' }}>"{currentItem.meaning_vi}"</span>
                    </span>
                  </div>
                </div>

                {/* Input Method Switcher */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setInputMode('choice')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        background: inputMode === 'choice' ? '#ffffff' : 'transparent',
                        color: inputMode === 'choice' ? '#4f46e5' : '#64748b',
                        boxShadow: inputMode === 'choice' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      Trắc nghiệm (4 lựa chọn)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('typing')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        background: inputMode === 'typing' ? '#ffffff' : 'transparent',
                        color: inputMode === 'typing' ? '#4f46e5' : '#64748b',
                        boxShadow: inputMode === 'typing' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      Gõ trực tiếp (Typing)
                    </button>
                  </div>
                </div>

                {/* MODE A: MULTIPLE CHOICE OPTIONS */}
                {inputMode === 'choice' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {options.map((opt, idx) => {
                      const isThisSelected = selectedOption === opt
                      const isThisCorrect = opt === currentItem.full_phrase

                      let btnBg = '#ffffff'
                      let btnBorder = '1px solid #cbd5e1'
                      let btnColor = '#1e293b'

                      if (isAnswered) {
                        if (isThisCorrect) {
                          btnBg = '#f0fdf4'
                          btnBorder = '2px solid #22c55e'
                          btnColor = '#15803d'
                        } else if (isThisSelected && !isCorrect) {
                          btnBg = '#fef2f2'
                          btnBorder = '2px solid #ef4444'
                          btnColor = '#b91c1c'
                        }
                      } else if (isThisSelected) {
                        btnBg = '#eef2ff'
                        btnBorder = '2px solid #6366f1'
                        btnColor = '#4338ca'
                      }

                      return (
                        <button
                          key={opt + idx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => {
                            setSelectedOption(opt)
                            handleAnswerSubmit(opt)
                          }}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: btnBg,
                            border: btnBorder,
                            color: btnColor,
                            fontSize: '14px',
                            fontWeight: 700,
                            textAlign: 'left',
                            cursor: isAnswered ? 'default' : 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>
                            <strong style={{ opacity: 0.6, marginRight: '8px' }}>{String.fromCharCode(65 + idx)}.</strong> {opt}
                          </span>
                          {isAnswered && isThisCorrect && <CheckCircle2 size={18} color="#16a34a" />}
                          {isAnswered && isThisSelected && !isCorrect && <XCircle size={18} color="#dc2626" />}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  /* MODE B: DIRECT TYPING INPUT */
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      disabled={isAnswered}
                      value={userTypedAnswer}
                      onChange={(e) => setUserTypedAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isAnswered) handleAnswerSubmit()
                      }}
                      placeholder="Gõ cụm tiếng Anh hoàn chỉnh (vd: exert a profound impact on)..."
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                    {!isAnswered ? (
                      <button
                        type="button"
                        onClick={() => handleAnswerSubmit()}
                        style={{
                          padding: '0 20px',
                          borderRadius: '12px',
                          background: '#6366f1',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Kiểm tra
                      </button>
                    ) : null}
                  </div>
                )}

                {/* Feedback Box & Grammar Explanation */}
                {isAnswered && (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      background: isCorrect ? '#f0fdf4' : '#fef2f2',
                      border: isCorrect ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: isCorrect ? '#15803d' : '#b91c1c',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        {isCorrect ? 'Xuất sắc! Đáp án hoàn toàn chính xác.' : `Chưa đúng! Đáp án chuẩn: "${currentItem.full_phrase}"`}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                      <strong>Nghĩa & Ngữ cảnh:</strong> {currentItem.meaning_vi} — <em>"{currentItem.example_sentence}"</em>
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => playAudio(currentItem.example_sentence)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Volume2 size={14} /> Nghe đọc lại
                      </button>

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '8px',
                          background: '#6366f1',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        Câu tiếp theo <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Navigation Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ← Câu trước
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Bỏ qua / Câu tiếp →
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* MODE 2: DUAL-COLUMN MATCHING (GHÉP VẾ CỤM TỪ) */}
      {practiceMode === 'matching' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Matching Progress Bar */}
          <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(matchedIds.length / BATCH_SIZE) * 100}%`,
                background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                height: '100%',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {matchFeedback && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: matchFeedback.startsWith('✨') ? '#f0fdf4' : '#fef2f2',
                border: matchFeedback.startsWith('✨') ? '1px solid #bbf7d0' : '1px solid #fecaca',
                color: matchFeedback.startsWith('✨') ? '#166534' : '#991b1b',
                fontSize: '13.5px',
                fontWeight: 600,
              }}
            >
              {matchFeedback}
            </div>
          )}

          {/* Dual Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Left Column: Head Words */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                Cột vế đầu (Verbs / Adjectives)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {heads.map((h) => {
                  const matchedItem = currentBatch.find((i) => i.head_word === h && matchedIds.includes(i.id))
                  const isMatched = !!matchedItem

                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={isMatched}
                      onClick={() => setSelectedHead(h)}
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '14.5px',
                        borderRadius: '12px',
                        border: isMatched
                          ? '1px solid #cbd5e1'
                          : selectedHead === h
                          ? '2px solid #4f46e5'
                          : '1px solid #cbd5e1',
                        background: isMatched ? '#f8fafc' : selectedHead === h ? '#eef2ff' : '#ffffff',
                        color: isMatched ? '#94a3b8' : selectedHead === h ? '#4f46e5' : '#0f172a',
                        cursor: isMatched ? 'default' : 'pointer',
                        opacity: isMatched ? 0.6 : 1,
                        textDecoration: isMatched ? 'line-through' : 'none',
                        boxShadow: selectedHead === h ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{h}</span>
                      {isMatched && <Check size={16} color="#16a34a" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Tail Chunks */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                Cột vế sau (Noun Chunks / Prepositions)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tails.map((t) => {
                  const matchedItem = currentBatch.find((i) => i.tail_chunk === t && matchedIds.includes(i.id))
                  const isMatched = !!matchedItem

                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={isMatched}
                      onClick={() => setSelectedTail(t)}
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '14px',
                        borderRadius: '12px',
                        border: isMatched
                          ? '1px solid #cbd5e1'
                          : selectedTail === t
                          ? '2px solid #4f46e5'
                          : '1px solid #cbd5e1',
                        background: isMatched ? '#f8fafc' : selectedTail === t ? '#eef2ff' : '#ffffff',
                        color: isMatched ? '#94a3b8' : selectedTail === t ? '#4f46e5' : '#0f172a',
                        cursor: isMatched ? 'default' : 'pointer',
                        opacity: isMatched ? 0.6 : 1,
                        textDecoration: isMatched ? 'line-through' : 'none',
                        boxShadow: selectedTail === t ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{t}</span>
                      {isMatched && <Check size={16} color="#16a34a" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Batch Completed Screen */}
          {isMatchingBatchDone && (
            <div
              style={{
                marginTop: '16px',
                padding: '20px',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '1.5px solid #a5b4fc',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#312e81' }}>
                🎉 Đã hoàn thành Đợt {batchIndex + 1}!
              </h3>
              <p style={{ fontSize: '13px', color: '#4338ca', margin: '4px 0 14px 0' }}>
                Tất cả {BATCH_SIZE} cụm từ đợt này đã được lưu vào hệ thống ôn lặp ngắt quãng DSR.
              </p>
              <button
                type="button"
                className="hero-action"
                onClick={() => {
                  const nextIdx = (batchIndex + 1) % totalMatchingBatches
                  setBatchIndex(nextIdx)
                  setupMatchingBatch(filteredList, nextIdx)
                }}
                style={{ padding: '8px 20px', fontSize: '13.5px', fontWeight: 700, borderRadius: '10px', margin: '0 auto' }}
              >
                Sang Đợt {((batchIndex + 1) % totalMatchingBatches) + 1} tiếp theo <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
