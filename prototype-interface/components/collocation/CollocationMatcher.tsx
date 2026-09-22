'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Check, RefreshCw, Volume2, ArrowRight, Award, Zap } from 'lucide-react'
import { INITIAL_COLLOCATIONS } from '@/lib/db/initial_collocations'

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

export function CollocationMatcher() {
  const [allCollocations, setAllCollocations] = useState<CollocationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [batchIndex, setBatchIndex] = useState(0)

  // Current batch items (4 per batch for smooth dual-column matching)
  const BATCH_SIZE = 4
  const [currentBatch, setCurrentBatch] = useState<CollocationItem[]>([])
  const [heads, setHeads] = useState<string[]>([])
  const [tails, setTails] = useState<string[]>([])
  const [selectedHead, setSelectedHead] = useState<string | null>(null)
  const [selectedTail, setSelectedTail] = useState<string | null>(null)
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [failedAttempts, setFailedAttempts] = useState<Set<string>>(new Set())
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [showHint, setShowHint] = useState<boolean>(false)

  const fetchCollocations = () => {
    setLoading(true)
    fetch('/api/collocations')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => {
        const list: CollocationItem[] = data.collocations && data.collocations.length > 0 ? data.collocations : INITIAL_COLLOCATIONS
        setAllCollocations(list)
        setBatchIndex(0)
        setupBatch(list, 0)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Error fetching collocations, using fallback dataset:', err)
        setAllCollocations(INITIAL_COLLOCATIONS)
        setBatchIndex(0)
        setupBatch(INITIAL_COLLOCATIONS, 0)
        setLoading(false)
      })
  }

  const setupBatch = (items: CollocationItem[], index: number) => {
    const chunk = items.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE)
    setCurrentBatch(chunk)
    setMatchedIds([])
    setSelectedHead(null)
    setSelectedTail(null)
    setFailedAttempts(new Set())
    setShowHint(false)
    setFeedbackMessage(null)

    // Shuffle heads and tails independently
    setHeads([...chunk.map((i) => i.head_word)].sort(() => Math.random() - 0.5))
    setTails([...chunk.map((i) => i.tail_chunk)].sort(() => Math.random() - 0.5))
  }

  useEffect(() => {
    fetchCollocations()
  }, [])

  const handleSelectHead = (h: string) => setSelectedHead(h)
  const handleSelectTail = (t: string) => setSelectedTail(t)

  const playPhraseAudio = (phrase: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(phrase)
      u.lang = 'en-US'
      window.speechSynthesis.speak(u)
    }
  }

  // Evaluate matching pair
  useEffect(() => {
    if (selectedHead && selectedTail) {
      const match = currentBatch.find((i) => i.head_word === selectedHead && i.tail_chunk === selectedTail)
      if (match) {
        // Correct pair
        setMatchedIds((prev) => [...prev, match.id])
        setFeedbackMessage(`✨ Chính xác: "${match.full_phrase}" - ${match.meaning_vi}`)
        playPhraseAudio(match.full_phrase)

        // Grade 3 (Good) if no previous error on this card, else 1 (Again)
        const isFirstTry = !failedAttempts.has(match.id)
        const rating = isFirstTry ? 3 : 1

        fetch('/api/collocations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collocationId: match.id, rating }),
        }).catch((e) => console.error(e))
      } else {
        // Incorrect pair
        const targetCard = currentBatch.find((i) => i.head_word === selectedHead)
        if (targetCard) {
          setFailedAttempts((prev) => new Set(prev).add(targetCard.id))
        }
        setFeedbackMessage(`❌ Sai rồi! Thử lại cụm từ ghép với "${selectedHead}".`)
      }

      setSelectedHead(null)
      setSelectedTail(null)
    }
  }, [selectedHead, selectedTail, currentBatch, failedAttempts])

  const totalBatches = Math.ceil(allCollocations.length / BATCH_SIZE) || 1
  const isBatchCompleted = currentBatch.length > 0 && matchedIds.length === currentBatch.length

  const handleNextBatch = () => {
    const nextIdx = (batchIndex + 1) % totalBatches
    setBatchIndex(nextIdx)
    setupBatch(allCollocations, nextIdx)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <RefreshCw className="animate-spin" size={28} color="#4f46e5" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '10px 0' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1px',
              color: '#6366f1',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={14} /> ACADEMIC COLLOCATIONS · BỘ LỰA CHỌN C1/C2
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 0 0' }}>Ghép Cụm Từ Học Thuật</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
            Rèn luyện thói quen tự nhiên theo phrasal chunks cho bài thi IELTS Writing & Speaking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '12px' }}>
            Đợt {batchIndex + 1} / {totalBatches}
          </span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowHint(!showHint)}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
          >
            {showHint ? 'Ẩn nghĩa tiếng Việt' : '💡 Hiển thị gợi ý nghĩa'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '6px', marginBottom: '24px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${(matchedIds.length / BATCH_SIZE) * 100}%`,
            background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
            height: '100%',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Dynamic Feedback Box */}
      {feedbackMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: feedbackMessage.startsWith('✨') ? '#f0fdf4' : '#fef2f2',
            border: feedbackMessage.startsWith('✨') ? '1px solid #bbf7d0' : '1px solid #fecaca',
            color: feedbackMessage.startsWith('✨') ? '#166534' : '#991b1b',
            fontSize: '13.5px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{feedbackMessage}</span>
          {showHint && matchedIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const lastId = matchedIds[matchedIds.length - 1]
                const item = currentBatch.find((i) => i.id === lastId)
                if (item) playPhraseAudio(item.full_phrase)
              }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4f46e5' }}
            >
              <Volume2 size={16} />
            </button>
          )}
        </div>
      )}

      {/* Dual Column Matcher Interface */}
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
                  onClick={() => handleSelectHead(h)}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '15px',
                    borderRadius: '12px',
                    border: isMatched
                      ? '1px solid #cbd5e1'
                      : selectedHead === h
                      ? '2px solid #4f46e5'
                      : '1px solid #cbd5e1',
                    background: isMatched
                      ? '#f8fafc'
                      : selectedHead === h
                      ? '#eef2ff'
                      : '#ffffff',
                    color: isMatched ? '#94a3b8' : selectedHead === h ? '#4f46e5' : '#0f172a',
                    cursor: isMatched ? 'default' : 'pointer',
                    opacity: isMatched ? 0.6 : 1,
                    textDecoration: isMatched ? 'line-through' : 'none',
                    boxShadow: selectedHead === h ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none',
                    transition: 'all 0.2s',
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
                  onClick={() => handleSelectTail(t)}
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
                    background: isMatched
                      ? '#f8fafc'
                      : selectedTail === t
                      ? '#eef2ff'
                      : '#ffffff',
                    color: isMatched ? '#94a3b8' : selectedTail === t ? '#4f46e5' : '#0f172a',
                    cursor: isMatched ? 'default' : 'pointer',
                    opacity: isMatched ? 0.6 : 1,
                    textDecoration: isMatched ? 'line-through' : 'none',
                    boxShadow: selectedTail === t ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none',
                    transition: 'all 0.2s',
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

      {/* Hints & Meaning List */}
      {showHint && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#475569' }}>💡 Nghĩa Tiếng Việt & Ví Dụ Đợt Này:</h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentBatch.map((item) => (
              <li key={item.id}>
                <strong style={{ color: '#4f46e5' }}>{item.full_phrase}</strong>: {item.meaning_vi}
                <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#94a3b8', marginTop: '2px' }}>
                  &quot;{item.example_sentence}&quot;
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Batch Completion Screen */}
      {isBatchCompleted && (
        <div
          style={{
            marginTop: '28px',
            padding: '24px',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)',
            borderRadius: '16px',
            border: '1.5px solid #a5b4fc',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#312e81' }}>
            Xuất sắc! Đã ghép xong Đợt {batchIndex + 1}
          </h3>
          <p style={{ fontSize: '13px', color: '#4338ca', margin: '6px 0 16px 0' }}>
            Tất cả {BATCH_SIZE} cụm từ học thuật C1 trong đợt này đã được cập nhật điểm nhớ DSR/SRS!
          </p>
          <button
            type="button"
            className="hero-action"
            onClick={handleNextBatch}
            style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700, borderRadius: '10px', margin: '0 auto' }}
          >
            Chuyển sang Đợt {((batchIndex + 1) % totalBatches) + 1} tiếp theo <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
