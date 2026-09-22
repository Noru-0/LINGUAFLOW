'use client'

import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Play, RefreshCw, Sparkles, Volume2, Award, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { SpeakingEvaluationResult } from '@/services/gemini-speaking-evaluator'
import { INITIAL_SPEAKING_PROMPTS } from '@/lib/db/initial_speaking_prompts'

export interface SpeakingPrompt {
  id: string
  part: 1 | 2 | 3
  topic: string
  questionPrompt: string
  cuePoints: string[]
  modelResponse: string
  suggestedVocabulary: string[]
}

export function SpeakingPractice() {
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt | null>(null)
  const [loadingPrompts, setLoadingPrompts] = useState(true)

  // Speech recognition hook
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition()

  // Manual editable transcript text area
  const [manualTranscript, setManualTranscript] = useState('')

  // Timers
  const [prepSeconds, setPrepSeconds] = useState<number>(60)
  const [isPrepActive, setIsPrepActive] = useState<boolean>(false)
  const [speechSeconds, setSpeechSeconds] = useState<number>(0)
  const [isSpeechActive, setIsSpeechActive] = useState<boolean>(false)

  // AI Evaluation state
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<SpeakingEvaluationResult | null>(null)

  // Fetch speaking prompts
  useEffect(() => {
    fetchPrompts()
  }, [])

  const useFallbackPrompts = () => {
    const fallbackFormatted = INITIAL_SPEAKING_PROMPTS.map((r) => ({
      id: r.id,
      part: r.part,
      topic: r.topic,
      questionPrompt: r.question_prompt,
      cuePoints: r.cue_points_json ? JSON.parse(r.cue_points_json) : [],
      modelResponse: r.model_response,
      suggestedVocabulary: r.suggested_vocabulary_json ? JSON.parse(r.suggested_vocabulary_json) : [],
    }))
    setPrompts(fallbackFormatted)
    if (fallbackFormatted.length > 0) {
      setSelectedPrompt(fallbackFormatted[0])
    }
  }

  const fetchPrompts = () => {
    setLoadingPrompts(true)
    fetch('/api/speaking/prompts')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => {
        const list: SpeakingPrompt[] = data.prompts || []
        if (list.length > 0) {
          setPrompts(list)
          setSelectedPrompt(list[0])
        } else {
          useFallbackPrompts()
        }
        setLoadingPrompts(false)
      })
      .catch((err) => {
        console.warn('Error fetching speaking prompts, using fallback:', err)
        useFallbackPrompts()
        setLoadingPrompts(false)
      })
  }

  // Update manual transcript state whenever Speech-to-Text transcript updates
  useEffect(() => {
    if (transcript) {
      setManualTranscript(transcript)
    }
  }, [transcript])

  // Prep timer countdown (60s for Part 2)
  useEffect(() => {
    let timer: any = null
    if (isPrepActive && prepSeconds > 0) {
      timer = setInterval(() => {
        setPrepSeconds((prev) => prev - 1)
      }, 1000)
    } else if (prepSeconds === 0 && isPrepActive) {
      setIsPrepActive(false)
      // Auto-start recording after prep timer ends
      handleStartRecording()
    }
    return () => clearInterval(timer)
  }, [isPrepActive, prepSeconds])

  // Speech duration timer
  useEffect(() => {
    let timer: any = null
    if (isSpeechActive) {
      timer = setInterval(() => {
        setSpeechSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isSpeechActive])

  const handleStartPrep = () => {
    setPrepSeconds(60)
    setIsPrepActive(true)
  }

  const handleStartRecording = () => {
    setIsPrepActive(false)
    resetTranscript()
    setManualTranscript('')
    setEvaluation(null)
    setSpeechSeconds(0)
    setIsSpeechActive(true)
    startListening()
  }

  const handleStopRecording = () => {
    stopListening()
    setIsSpeechActive(false)
  }

  const handleEvaluate = () => {
    if (!selectedPrompt) return
    const textToSubmit = manualTranscript || transcript
    if (!textToSubmit.trim()) {
      alert('Vui lòng thu âm hoặc nhập đoạn bài nói trước khi nộp cho AI chấm điểm!')
      return
    }

    if (isListening) {
      handleStopRecording()
    }

    setEvaluating(true)
    fetch('/api/speaking/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promptId: selectedPrompt.id,
        question: selectedPrompt.questionPrompt,
        userTranscript: textToSubmit,
        part: selectedPrompt.part,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.evaluation) {
          setEvaluation(data.evaluation)
        }
        setEvaluating(false)
      })
      .catch((err) => {
        console.error('Error evaluating speaking:', err)
        setEvaluating(false)
      })
  }

  const playTTS = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      window.speechSynthesis.speak(u)
    }
  }

  if (loadingPrompts) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <RefreshCw className="animate-spin" size={28} color="#4f46e5" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '10px 0' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '24px' }}>
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
          <Mic size={14} /> IELTS SPEAKING SIMULATION · BỘ CHẤM ĐIỂM GEMINI AI
        </span>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 0 0' }}>Mô Phỏng IELTS Speaking & Phản Hồi Giọng Nói</h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
          Thu âm trực tiếp trên trình duyệt (Web Speech API) và nhận phân tích chi tiết Band điểm, lỗi ngữ pháp & từ vựng C1 từ AI.
        </p>
      </div>

      {/* Select Prompt Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
        {prompts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelectedPrompt(p)
              setEvaluation(null)
              resetTranscript()
              setManualTranscript('')
              setIsPrepActive(false)
              setIsSpeechActive(false)
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              border: selectedPrompt?.id === p.id ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
              background: selectedPrompt?.id === p.id ? '#eef2ff' : '#ffffff',
              color: selectedPrompt?.id === p.id ? '#4f46e5' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Part {p.part}: {p.topic}
          </button>
        ))}
      </div>

      {selectedPrompt && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {/* Prompt Cue Card Box */}
          <div
            style={{
              padding: '24px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#6366f1', background: '#e0e7ff', padding: '4px 10px', borderRadius: '12px' }}>
                IELTS SPEAKING PART {selectedPrompt.part}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Chủ đề: {selectedPrompt.topic}</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              {selectedPrompt.questionPrompt}
            </h3>

            {selectedPrompt.cuePoints && selectedPrompt.cuePoints.length > 0 && (
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  You should say:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedPrompt.cuePoints.map((cp, idx) => (
                    <li key={idx}>{cp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Vocabulary Badges */}
            {selectedPrompt.suggestedVocabulary && selectedPrompt.suggestedVocabulary.length > 0 && (
              <div>
                <strong style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Gợi ý cụm từ C1 nên dùng:
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {selectedPrompt.suggestedVocabulary.map((vocab, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {vocab}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Practice & Recording Controls */}
          <div
            style={{
              padding: '24px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Part 2 Prep Button */}
                {selectedPrompt.part === 2 && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleStartPrep}
                    disabled={isPrepActive || isSpeechActive}
                    style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Clock size={16} /> {isPrepActive ? `Chuẩn bị: ${prepSeconds}s` : '1 Phút chuẩn bị'}
                  </button>
                )}

                {/* Record Toggle Button */}
                {!isListening ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    <Mic size={18} /> Bắt đầu thu âm
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: '#15803d',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      animation: 'pulse 1.5s infinite',
                    }}
                  >
                    <MicOff size={18} /> Dừng thu âm ({speechSeconds}s)
                  </button>
                )}
              </div>

              <button
                type="button"
                className="hero-action"
                onClick={handleEvaluate}
                disabled={evaluating || (!manualTranscript.trim() && !transcript.trim())}
                style={{
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  margin: 0,
                  opacity: evaluating || (!manualTranscript.trim() && !transcript.trim()) ? 0.6 : 1,
                }}
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> AI đang chấm bài...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Nộp bài cho Gemini AI chấm <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {!isSupported && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '10px' }}>
                ⚠️ Trình duyệt hiện tại không hỗ trợ Web Speech API. Bạn vẫn có thể nhập trực tiếp bài nói vào ô dưới đây!
              </div>
            )}

            {/* Transcript Display Textarea */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Văn bản bài nói (Tự động nhận diện qua giọng nói hoặc tự nhập):
              </label>
              <textarea
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                placeholder="Nói vào micro để ứng dụng tự phiên âm tiếng Anh theo thời gian thực..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isListening ? '2px solid #ef4444' : '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  color: '#0f172a',
                  background: isListening ? '#fef2f2' : '#ffffff',
                }}
              />
            </div>
          </div>

          {/* AI Evaluation Report Result */}
          {evaluation && (
            <div
              style={{
                padding: '24px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #6366f1',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    IELTS SPEAKING EVALUATION REPORT
                  </span>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 800 }}>Kết Quả Phân Tích Từ Gemini AI</h3>
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    color: '#ffffff',
                    textAlign: 'center',
                  }}
                >
                  <small style={{ fontSize: '10px', display: 'block', opacity: 0.9 }}>ESTIMATED BAND</small>
                  <strong style={{ fontSize: '22px' }}>{evaluation.estimatedBand.toFixed(1)}</strong>
                </div>
              </div>

              {/* Overall & Coherence */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '12px', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>
                    🎯 Nhận xét tổng quan:
                  </strong>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>{evaluation.overallImpression}</p>
                </div>
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '12px', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>
                    🌊 Mạch lạc & Từ nối (Fluency):
                  </strong>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>{evaluation.coherenceAndFluency}</p>
                </div>
              </div>

              {/* Grammar Corrections */}
              {evaluation.grammarCorrection && evaluation.grammarCorrection.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '10px' }}>
                    🛠️ Lỗi ngữ pháp phát hiện & Cách sửa Band 8+:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {evaluation.grammarCorrection.map((item, idx) => (
                      <div key={idx} style={{ padding: '12px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                        <div style={{ fontSize: '13px', color: '#991b1b', textDecoration: 'line-through' }}>
                          ❌ Candidate spoke: &quot;{item.spokenPhrase}&quot;
                        </div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#15803d', marginTop: '2px' }}>
                          ✅ Band 8+ Correction: &quot;{item.correctedPhrase}&quot;
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>💡 {item.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lexical Upgrades */}
              {evaluation.lexicalUpgrade && evaluation.lexicalUpgrade.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', marginBottom: '10px' }}>
                    🚀 Nâng cấp từ vựng C1/C2 (Lexical Upgrades):
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {evaluation.lexicalUpgrade.map((item, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', borderRadius: '10px', background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Từ đơn giản: &quot;{item.simpleWord}&quot;</span>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#3730a3', marginTop: '2px' }}>
                          → {item.band8Alternative}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Band 8 Model Answer Rewrite */}
              {evaluation.improvedAnswer && (
                <div style={{ padding: '16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#166534' }}>
                      🌟 Bản viết lại Band 8.5+ nâng cấp tự nhiên (Model Rewrite):
                    </strong>
                    <button
                      type="button"
                      onClick={() => playTTS(evaluation.improvedAnswer)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#166534' }}
                      title="Nghe mẫu phát âm"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#14532d', lineHeight: 1.5, fontStyle: 'italic' }}>
                    &quot;{evaluation.improvedAnswer}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
