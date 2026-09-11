'use client'

import { useState, useEffect } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Flame,
  GraduationCap,
  Image as ImageIcon,
  Keyboard,
  LayoutDashboard,
  Library,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Zap,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react'

type View = 'Dashboard' | 'Review' | 'Translate' | 'Decks' | 'Analytics'

const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Review', icon: Zap },
  { label: 'Translate', icon: BookOpen },
  { label: 'Decks', icon: Library },
  { label: 'Analytics', icon: BarChart3 },
]

function AppLogo() {
  return (
    <div className="logo-mark">
      <GraduationCap size={19} strokeWidth={2.5} />
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Target
  label: string
  value: string
  detail?: string
  tone: string
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </div>
  )
}

// ----------------------------------------------------
// Dashboard View
// ----------------------------------------------------
function Dashboard({ setView, user }: { setView: (view: View) => void; user: any }) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activityPeriod, setActivityPeriod] = useState('12m')
  const [heatTooltip, setHeatTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const rawActivity = metrics?.activityMap || []
  const activityData: number[] = rawActivity.length >= 364
    ? rawActivity.slice(0, 364)
    : [...rawActivity, ...new Array(364 - rawActivity.length).fill(0)]
  const cardsDueCount = metrics?.cardsDue ?? 0
  const totalCardsCount = metrics?.totalCards ?? 0
  const progressPercent = totalCardsCount > 0 ? Math.min(100, Math.round(((totalCardsCount - cardsDueCount) / totalCardsCount) * 100)) : 100

  // GitHub-style contribution calendar: 52 weeks x 7 days ending today (Sunday-first columns)
  const today = new Date()
  const heatmapStart = new Date(today)
  heatmapStart.setDate(heatmapStart.getDate() - 363)
  const heatmapDateAt = (i: number) => {
    const d = new Date(heatmapStart)
    d.setDate(d.getDate() + i)
    return d
  }
  const heatmapDateLabel = (i: number) =>
    heatmapDateAt(i).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Place a month label on the first column whose week contains the 1st of that month
  const monthLabels: { index: number; label: string }[] = []
  for (let w = 0; w < 52; w++) {
    for (let d = 0; d < 7; d++) {
      const date = heatmapDateAt(w * 7 + d)
      if (date.getDate() === 1) {
        const label = date.toLocaleDateString('en-US', { month: 'short' })
        if (!monthLabels.some((m) => m.label === label)) {
          monthLabels.push({ index: w, label })
        }
        break
      }
    }
  }

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow" suppressHydrationWarning>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1>Good morning, {user?.name?.split(' ')[0] || 'Alex'}</h1>
          <p className="subhead">Keep your momentum going with LinguaFlow.</p>
        </div>
      </div>

      <section className="hero-card">
        <div className="hero-copy">
          <span className="hero-pill">
            <Sparkles size={14} /> DAILY GOAL
          </span>
          <h2>Make today count.</h2>
          <p>You&apos;re building long-term memory with SuperMemo SM-2 algorithms.</p>
          <div className="hero-progress">
            <div>
              <span>Daily target</span>
              <b>{loading ? '...' : `${cardsDueCount} cards due today`}</b>
            </div>
            <div className="progress-track">
              <div style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <button className="hero-action" onClick={() => setView('Review')}>
            Start reviewing vocabulary <ArrowRight size={17} />
          </button>
        </div>
        <div className="hero-illustration">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="book-shape">
            <BookOpen size={68} strokeWidth={1.1} />
          </div>
          <div className="spark spark-a">✦</div>
          <div className="spark spark-b">✧</div>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR PROGRESS</p>
          <h2>At a glance</h2>
        </div>
        <button className="text-button" onClick={() => setView('Analytics')}>
          View analytics <ArrowRight size={15} />
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="metrics-grid">
            <MetricCard
              icon={Target}
              label="Due today"
              value={loading ? '...' : String(cardsDueCount)}
              tone="blue"
            />
            <MetricCard
              icon={Flame}
              label="Day streak"
              value={loading ? '...' : `${metrics?.streak?.current ?? 0} days`}
              detail={`Personal best: ${metrics?.streak?.longest ?? 0} days`}
              tone="orange"
            />
          </div>

          <section className="panel activity-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">CONSISTENCY</p>
                <h3>Learning activity</h3>
              </div>
              <select
                className="select-field"
                style={{ width: 'auto', padding: '4px 10px', fontSize: '11.5px', height: '30px' }}
                value={activityPeriod}
                onChange={(e) => setActivityPeriod(e.target.value)}
              >
                <option value="12m">12 tháng gần nhất</option>
                <option value="6m">6 tháng gần nhất</option>
                <option value="3m">3 tháng gần nhất</option>
              </select>
            </div>
            <div className="heatmap-wrap">
              <div className="heatmap-scroll">
                <div className="months">
                  {monthLabels.map((m) => (
                    <span key={m.index} style={{ gridColumnStart: m.index + 1 }}>
                      {m.label}
                    </span>
                  ))}
                </div>
                <div className="heatmap">
                  <div className="weekdays">
                    <span />
                    <span>Mon</span>
                    <span />
                    <span>Wed</span>
                    <span />
                    <span>Fri</span>
                    <span />
                  </div>
                  <div className="squares">
                    {activityData.map((v, i) => (
                      <span
                        key={i}
                        className={`level-${v === 0 ? 0 : Math.min(4, v)}${i === activityData.length - 1 ? ' is-today' : ''}`}
                        onMouseEnter={(e) => {
                          const r = e.currentTarget.getBoundingClientRect()
                          setHeatTooltip({
                            x: r.left + r.width / 2,
                          y: r.top,
                          text: `${v} ${v === 1 ? 'activity' : 'activities'} on ${heatmapDateLabel(i)}`,
                        })
                      }}
                      onMouseLeave={() => setHeatTooltip(null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
            <div className="heatmap-legend">
              <span>Less</span>
              {[1, 2, 3, 4].map((n) => (
                <i key={n} className={`level-${n}`} />
              ))}
              <span>More</span>
            </div>
          </section>
        </div>

        <section className="panel memory-status-panel">
          <p className="eyebrow" style={{ marginBottom: '6px' }}>MEMORY OVERVIEW</p>
          <div className="memory-status-list">
            <div className="memory-status-item">
              <div className="memory-status-badge badge-mastered">
                <Sparkles size={14} />
              </div>
              <div className="memory-status-info">
                <div className="memory-status-title-row">
                  <b>Mastered</b>
                  <span className="memory-count green">{metrics?.memoryStatus?.mastered ?? 172}</span>
                </div>
                <small>Half-life ≥ 30 ngày (Đã nhớ sâu)</small>
              </div>
            </div>

            <div className="memory-status-item">
              <div className="memory-status-badge badge-reviewing">
                <RefreshCw size={14} />
              </div>
              <div className="memory-status-info">
                <div className="memory-status-title-row">
                  <b>Reviewing</b>
                  <span className="memory-count blue">{metrics?.memoryStatus?.reviewing ?? 617}</span>
                </div>
                <small>Half-life ≥ 2 ngày (Đang ôn tập)</small>
              </div>
            </div>

            <div className="memory-status-item">
              <div className="memory-status-badge badge-learning">
                <Zap size={14} />
              </div>
              <div className="memory-status-info">
                <div className="memory-status-title-row">
                  <b>Learning</b>
                  <span className="memory-count orange">{metrics?.memoryStatus?.learning ?? 191}</span>
                </div>
                <small>Mới luyện tập (Ghi nhớ ban đầu)</small>
              </div>
            </div>

            <div className="memory-status-item">
              <div className="memory-status-badge badge-new">
                <BookOpen size={14} />
              </div>
              <div className="memory-status-info">
                <div className="memory-status-title-row">
                  <b>New</b>
                  <span className="memory-count gray">{metrics?.memoryStatus?.new ?? 0}</span>
                </div>
                <small>Trong kho (Chưa từng học)</small>
              </div>
            </div>
          </div>
        </section>
      </div>

      {heatTooltip && (
        <div className="heatmap-tooltip" style={{ left: heatTooltip.x, top: heatTooltip.y }}>
          {heatTooltip.text}
        </div>
      )}
    </div>
  )
}
// ----------------------------------------------------
// Review View (SRS Flashcards)
// ----------------------------------------------------
function Review({ setView }: { setView: (view: View) => void }) {
  const [queue, setQueue] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cardImages, setCardImages] = useState<any[]>([])
  const [imageIndex, setImageIndex] = useState(0)
  const [imagesLoading, setImagesLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const fetchQueue = () => {
    setLoading(true)
    fetch('/api/srs/queue')
      .then((res) => res.json())
      .then((data) => {
        setQueue(data.queue || [])
        setCurrentIndex(0)
        setRevealed(false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  const currentCard = queue[currentIndex]

  // Load illustration images for the current word (both card faces)
  useEffect(() => {
    if (!currentCard?.term) {
      setCardImages([])
      return
    }

    let cancelled = false
    setImagesLoading(true)
    setImageError(false)
    setImageIndex(0)
    setCardImages([])

    fetch(`/api/images?q=${encodeURIComponent(currentCard.term)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setCardImages(data.images || [])
      })
      .catch(() => {
        if (!cancelled) setCardImages([])
      })
      .finally(() => {
        if (!cancelled) setImagesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentCard?.term])

  const currentImage = cardImages[imageIndex]

  const handleGrade = async (rating: number) => {
    if (!currentCard || submitting) return
    setSubmitting(true)

    try {
      await fetch('/api/srs/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.cardId,
          rating,
        }),
      })

      if (currentIndex + 1 < queue.length) {
        setCurrentIndex((prev) => prev + 1)
        setRevealed(false)
      } else {
        setView('Dashboard')
      }
    } catch (err) {
      console.error('Error grading card:', err)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setRevealed((r) => !r)
      } else if (revealed && !submitting) {
        if (e.key === '1') handleGrade(1)
        if (e.key === '2') handleGrade(2)
        if (e.key === '3') handleGrade(3)
        if (e.key === '4') handleGrade(4)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [revealed, submitting, currentCard, currentIndex, queue])

  if (loading) {
    return (
      <div className="page-content review-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="page-content review-page">
        <div className="review-top">
          <div>
            <p className="eyebrow">VOCABULARY REVIEW</p>
            <h1>Review Complete! 🎉</h1>
            <p className="subhead">You have cleared all scheduled cards in queue.</p>
          </div>
        </div>
        <button className="hero-action" style={{ marginTop: '24px' }} onClick={() => setView('Dashboard')}>
          Return to Dashboard <ArrowRight size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="page-content review-page">
      <div className="review-top">
        <div>
          <p className="eyebrow">VOCABULARY REVIEW · {currentCard.deckTitle}</p>
          <h1>Daily review</h1>
          <p className="subhead">SuperMemo SM-2 automated queue</p>
        </div>
        <div className="review-count">
          <strong>{currentIndex + 1}</strong>
          <span>/ {queue.length} cards</span>
        </div>
      </div>

      <div className="session-progress">
        <span style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }} />
      </div>

      <div className="review-layout">
        <div className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(!revealed)}>
          <div className="card-label">{revealed ? 'ENGLISH' : 'VIETNAMESE DEFINITION'}</div>

          {revealed && (
            <div className="card-media">
              {imagesLoading ? (
                <div className="card-media-placeholder">
                  <Loader2 className="animate-spin" size={22} />
                  <span>Đang tìm hình minh hoạ…</span>
                </div>
              ) : currentImage && !imageError ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={currentImage.alt || currentCard.term}
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                  <span className="card-media-credit">
                    {currentImage.author} · {currentImage.source === 'unsplash' ? 'Unsplash' : 'Openverse'}
                  </span>
                  {cardImages.length > 1 && (
                    <div className="card-media-dots" onClick={(e) => e.stopPropagation()}>
                      {cardImages.slice(0, 6).map((_: any, i: number) => (
                        <button
                          key={i}
                          className={i === imageIndex ? 'dot active' : 'dot'}
                          aria-label={`Hình ${i + 1}`}
                          onClick={() => {
                            setImageIndex(i)
                            setImageError(false)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="card-media-placeholder">
                  <ImageIcon size={22} />
                  <span>Không có hình minh hoạ</span>
                </div>
              )}
            </div>
          )}

          <div className={`card-word ${!revealed ? 'vietnamese-text' : ''}`}>{revealed ? currentCard.term : currentCard.vietnameseDefinition}</div>
          <p>{revealed ? `${currentCard.phonetic || ''} • ${currentCard.partOfSpeech || ''}` : 'Tap card or press space to reveal answer'}</p>
          <div className="card-example">
            {revealed ? currentCard.exampleSentence || 'No example provided' : 'Mental recall challenge'}
          </div>
          <span className="flip-hint">
            <Keyboard size={14} /> Press space to flip
          </span>
        </div>

        <div className="rating-panel">
          <p className="eyebrow">HOW WELL DID YOU KNOW IT?</p>
          <div className="rating-buttons">
            {[
              ['Again', '< 1d', 'red', 1],
              ['Hard', '6d', 'orange', 2],
              ['Good', '10d', 'green', 3],
              ['Easy', '15d', 'blue', 4],
            ].map(([name, time, tone, num]) => (
              <button
                key={String(name)}
                className={`rating ${tone}`}
                disabled={!revealed || submitting}
                onClick={() => handleGrade(Number(num))}
              >
                <b>{num}</b>
                <span>{name}</span>
                <small>{time}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="keyboard-tip">
        <Keyboard size={16} />
        <span>Keyboard shortcuts:</span>
        <kbd>Space</kbd>
        <small>flip card</small>
        <kbd>1</kbd>
        <kbd>2</kbd>
        <kbd>3</kbd>
        <kbd>4</kbd>
        <small>rate card</small>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// Translate View (Bilingual Drills)
// ----------------------------------------------------
function Translate({ setView }: { setView: (view: View) => void }) {
  const [prompts, setPrompts] = useState<any[]>([])
  const [promptIndex, setPromptIndex] = useState(0)
  const [userSubmission, setUserSubmission] = useState('')
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [streakCount, setStreakCount] = useState(0)

  useEffect(() => {
    fetch('/api/translate/prompt')
      .then((res) => res.json())
      .then((data) => {
        setPrompts(data.prompts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((data) => setStreakCount(data?.streak?.current || 0))
      .catch(() => {})
  }, [])

  const currentPrompt = prompts[promptIndex]

  const handleSubmit = async () => {
    if (!currentPrompt || !userSubmission.trim() || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/translate/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: currentPrompt.id,
          userSubmission,
        }),
      })
      const data = await res.json()
      setEvaluation(data.evaluation)
    } catch (err) {
      console.error('Translation error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    setEvaluation(null)
    setUserSubmission('')
    if (promptIndex + 1 < prompts.length) {
      setPromptIndex((i) => i + 1)
    } else {
      setPromptIndex(0)
    }
  }

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">GRAMMAR WORKOUT</p>
          <h1>Translate in context</h1>
          <p className="subhead">Turn understanding into confident expression.</p>
        </div>
        <div className="streak-chip">
          <Flame size={17} /> {streakCount} day streak
        </div>
      </div>

      <div className="translate-layout">
        <section className="prompt-card">
          <div className="prompt-top">
            <span className="tag purple-tag">{currentPrompt?.grammarCategory || 'GRAMMAR'}</span>
            <span className="prompt-number">
              Prompt {promptIndex + 1} of {prompts.length}
            </span>
          </div>
          <p className="eyebrow">TRANSLATE THIS SENTENCE TO ENGLISH</p>
          <h2>{currentPrompt?.vietnameseText || 'Loading prompt...'}</h2>
          <p className="prompt-note">{currentPrompt?.grammarNotes || 'Focus on correct sentence structure.'}</p>

          <div className="answer-area">
            <label htmlFor="translation">Your translation</label>
            <textarea
              id="translation"
              placeholder="Type your English translation here..."
              value={userSubmission}
              onChange={(e) => setUserSubmission(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !evaluation) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <div className="answer-footer">
              <span>
                <Keyboard size={14} /> Press Enter to submit
              </span>
              <button className="hero-action" disabled={submitting || !userSubmission.trim()} onClick={handleSubmit}>
                {submitting ? 'Evaluating...' : 'Submit translation'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <aside className={`feedback-card ${evaluation ? 'visible' : ''}`}>
          {evaluation ? (
            <>
              <div className="feedback-title">
                <span className={evaluation.isCorrect ? 'success-icon' : 'error-icon'}>
                  {evaluation.isCorrect ? <Check size={18} /> : <X size={18} />}
                </span>
                <div>
                  <p className="eyebrow">{evaluation.isCorrect ? 'GREAT WORK' : 'NEEDS REVISION'}</p>
                  <h3>{evaluation.isCorrect ? "That's correct!" : 'Review feedback'}</h3>
                </div>
              </div>

              <div className="comparison">
                <span>Your submission</span>
                <p>{userSubmission}</p>
                <span>Canonical Answer</span>
                <p>{evaluation.suggestedAnswer}</p>
              </div>

              <div className="rule-box">
                <b>Grammar note</b>
                <p>{evaluation.grammarNotes}</p>
              </div>

              <button className="next-button" onClick={handleNext}>
                Next sentence <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <div className="empty-feedback">
              <Sparkles size={25} />
              <h3>Your feedback will appear here</h3>
              <p>Submit your translation to see automated string normalization evaluation and detailed grammar notes.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// Decks View
// Built-in Smart Dictionary Auto-Completion Database
const dictionaryDb: Record<string, {
  level: string
  phonetic: string
  vietnamese: string
  definition: string
  example: string
  grammarLabel: string
}> = {
  accomplish: {
    level: 'B2',
    phonetic: '/əˈkʌm.plɪʃ/',
    vietnamese: 'Đạt được, hoàn thành mục tiêu',
    definition: 'To achieve or complete successfully a desired goal.',
    example: 'She accomplished all her objectives before the deadline.',
    grammarLabel: 'Transitive Verb (VT) / Past: -ed',
  },
  resilience: {
    level: 'C1',
    phonetic: '/rɪˈzɪl.jəns/',
    vietnamese: 'Khả năng phục hồi, sự kiên cường',
    definition: 'The capacity to recover quickly from difficulties; toughness.',
    example: 'Her resilience helped her overcome difficult times.',
    grammarLabel: 'Uncountable Noun [U]',
  },
  innovative: {
    level: 'B2',
    phonetic: '/ˈɪn.ə.veɪ.tɪv/',
    vietnamese: 'Mang tính sáng tạo, đổi mới',
    definition: 'Featuring new methods; advanced and original.',
    example: 'The company introduced an innovative product line.',
    grammarLabel: 'Adjective [Attributive & Predicative]',
  },
  meticulous: {
    level: 'C1',
    phonetic: '/məˈtɪk.jə.ləs/',
    vietnamese: 'Tỉ mỉ, cẩn thận từng chi tiết',
    definition: 'Showing great attention to detail; very careful and precise.',
    example: 'He was meticulous about keeping his records clean.',
    grammarLabel: 'Adjective [Gradable]',
  },
  collaborate: {
    level: 'B2',
    phonetic: '/kəˈlæb.ə.reɪt/',
    vietnamese: 'Hợp tác, cộng tác',
    definition: 'Work jointly on an activity or project.',
    example: 'Teams collaborate across different departments.',
    grammarLabel: 'Intransitive Verb [VI] + with/on',
  },
  ubiquitous: {
    level: 'C2',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    vietnamese: 'Có mặt ở khắp nơi, phổ biến',
    definition: 'Present, appearing, or found everywhere.',
    example: 'Smartphones have become ubiquitous in modern daily life.',
    grammarLabel: 'Formal Adjective',
  },
  pragmatic: {
    level: 'C1',
    phonetic: '/præɡˈmæt.ɪk/',
    vietnamese: 'Thực tế, thực dụng',
    definition: 'Dealing with things sensibly and realistically.',
    example: 'They took a pragmatic approach to solving the issue.',
    grammarLabel: 'Adjective',
  },
  eloquent: {
    level: 'C1',
    phonetic: '/ˈel.ə.kwənt/',
    vietnamese: 'Hùng hồn, lưu loát, giàu sức thuyết phục',
    definition: 'Fluent or persuasive in speaking or writing.',
    example: 'An eloquent speaker moved the entire audience.',
    grammarLabel: 'Descriptive Adjective',
  },
  scrutinize: {
    level: 'C1',
    phonetic: '/ˈskruː.tɪ.naɪz/',
    vietnamese: 'Xem xét kỹ lưỡng, kiểm tra tỉ mỉ',
    definition: 'Examine or inspect closely and thoroughly.',
    example: 'Auditors will scrutinize the financial records.',
    grammarLabel: 'Transitive Verb [VT]',
  },
  synergy: {
    level: 'B2',
    phonetic: '/ˈsɪn.ə.dʒi/',
    vietnamese: 'Sự cộng hưởng, hợp lực',
    definition: 'Interaction or cooperation producing a combined effect.',
    example: 'The merger created great synergy between both teams.',
    grammarLabel: 'Uncountable Noun [U]',
  },
}

function autoGenerateWordDetails(term: string, type: string) {
  const cleanTerm = term.trim().toLowerCase()
  if (!cleanTerm) {
    return {
      level: 'B1',
      phonetic: '',
      vietnamese: '',
      definition: '',
      example: '',
      grammarLabel: '',
    }
  }

  if (dictionaryDb[cleanTerm]) {
    const match = dictionaryDb[cleanTerm]
    return {
      level: match.level,
      phonetic: match.phonetic,
      vietnamese: match.vietnamese,
      definition: match.definition,
      example: match.example,
      grammarLabel: match.grammarLabel,
    }
  }

  const len = cleanTerm.length
  const inferredLevel = len >= 10 ? 'C1' : len >= 7 ? 'B2' : len >= 5 ? 'B1' : 'A2'
  const pseudoPhonetic = `/${cleanTerm.replace(/e$/, 'ə').replace(/tion$/, 'ʃən').replace(/ing$/, 'ɪŋ')}/`
  const capitalized = cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1)

  let defaultViet = `Nghĩa tiếng Việt cho từ "${capitalized}"`
  let defaultDef = `To act or express characteristics associated with "${cleanTerm}".`
  let defaultExample = `It is important to understand how to use "${cleanTerm}" in context.`
  let defaultGrammar = 'General Usage'

  if (type === 'noun') {
    defaultViet = `Danh từ: Khái niệm hoặc đối tượng "${capitalized}"`
    defaultDef = `The quality, state, or object defined as "${cleanTerm}".`
    defaultExample = `The project demonstrated impressive ${cleanTerm} during testing.`
    defaultGrammar = 'Noun [Countable / Uncountable]'
  } else if (type === 'verb') {
    defaultViet = `Động từ: Thực hiện hành động "${capitalized}"`
    defaultDef = `To perform, execute, or initiate the action of "${cleanTerm}".`
    defaultExample = `We need to ${cleanTerm} key processes to improve results.`
    defaultGrammar = 'Verb [Transitive / Intransitive]'
  } else if (type === 'adjective') {
    defaultViet = `Tính từ: Có tính chất "${capitalized}"`
    defaultDef = `Describing a state, feature, or characteristic of "${cleanTerm}".`
    defaultExample = `They presented an exceptionally ${cleanTerm} solution.`
    defaultGrammar = 'Adjective [Attributive]'
  } else if (type === 'adverb') {
    defaultViet = `Trạng từ: Một cách "${capitalized}"`
    defaultDef = `In a manner related to "${cleanTerm}".`
    defaultExample = `The team performed ${cleanTerm} under pressure.`
    defaultGrammar = 'Adverb [Adv]'
  }

  return {
    level: inferredLevel,
    phonetic: pseudoPhonetic,
    vietnamese: defaultViet,
    definition: defaultDef,
    example: defaultExample,
    grammarLabel: defaultGrammar,
  }
}

// ----------------------------------------------------
// Decks View
// ----------------------------------------------------
function Decks() {
  const [decksList, setDecksList] = useState<any[]>([])
  const [cardsList, setCardsList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showNewDeckModal, setShowNewDeckModal] = useState(false)
  const [showNewCardModal, setShowNewCardModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedCardAction, setSelectedCardAction] = useState<any>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleDeleteCard = async (cardId: string) => {
    if (!selectedDeckId) return
    try {
      await fetch(`/api/decks/${selectedDeckId}/cards?cardId=${cardId}`, {
        method: 'DELETE',
      })
      fetchCards()
      setSelectedCardAction(null)
    } catch (err) {
      console.error('Delete card error:', err)
    }
  }

  // Form inputs
  const [newDeckTitle, setNewDeckTitle] = useState('')
  const [newDeckDesc, setNewDeckDesc] = useState('')

  // 8-column vocabulary form fields
  const [newTerm, setNewTerm] = useState('')
  const [newPartOfSpeech, setNewPartOfSpeech] = useState('noun')
  const [newLevel, setNewLevel] = useState('B2')
  const [newPhonetic, setNewPhonetic] = useState('')
  const [newVietDefinition, setNewVietDefinition] = useState('')
  const [newDefinition, setNewDefinition] = useState('')
  const [newExampleSentence, setNewExampleSentence] = useState('')
  const [newGrammarLabel, setNewGrammarLabel] = useState('')

  const [bulkInput, setBulkInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDecks = () => {
    fetch('/api/decks')
      .then((res) => res.json())
      .then((data) => {
        setDecksList(data.decks || [])
        if (!selectedDeckId && data.decks?.[0]?.id) {
          setSelectedDeckId(data.decks[0].id)
        }
      })
  }

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchCards = () => {
    if (!selectedDeckId) return
    setLoading(true)
    fetch(`/api/decks/${selectedDeckId}/cards`)
      .then((res) => res.json())
      .then((data) => {
        setCardsList(data.cards || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchCards()
  }, [selectedDeckId])

  // Excel Batch Grid State
  const [excelRows, setExcelRows] = useState<any[]>([
    { id: '1', term: 'accomplish', partOfSpeech: 'verb', ...autoGenerateWordDetails('accomplish', 'verb') },
    { id: '2', term: 'resilience', partOfSpeech: 'noun', ...autoGenerateWordDetails('resilience', 'noun') },
    { id: '3', term: 'innovative', partOfSpeech: 'adjective', ...autoGenerateWordDetails('innovative', 'adjective') },
    { id: '4', term: '', partOfSpeech: 'noun', ...autoGenerateWordDetails('', 'noun') },
    { id: '5', term: '', partOfSpeech: 'noun', ...autoGenerateWordDetails('', 'noun') },
  ])

  const handleExcelCellChange = (index: number, field: string, value: string) => {
    setExcelRows((prev) => {
      const updated = [...prev]
      const current = { ...updated[index], [field]: value }

      if (field === 'term' || field === 'partOfSpeech') {
        const generated = autoGenerateWordDetails(
          field === 'term' ? value : current.term,
          field === 'partOfSpeech' ? value : current.partOfSpeech
        )
        current.level = generated.level
        current.phonetic = generated.phonetic
        current.vietnameseDefinition = generated.vietnamese
        current.englishDefinition = generated.definition
        current.exampleSentence = generated.example
        current.grammarLabel = generated.grammarLabel
      }

      updated[index] = current
      return updated
    })
  }

  const addExcelRow = (count = 1) => {
    setExcelRows((prev) => {
      const newRows = []
      for (let i = 0; i < count; i++) {
        newRows.push({
          id: String(Date.now() + Math.random()),
          term: '',
          partOfSpeech: 'noun',
          ...autoGenerateWordDetails('', 'noun'),
        })
      }
      return [...prev, ...newRows]
    })
  }

  // Inline Deck Creation State
  const [isCreatingCustomDeck, setIsCreatingCustomDeck] = useState(false)
  const [inlineDeckTitle, setInlineDeckTitle] = useState('')

  const createNewDeckHelper = async (title: string) => {
    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: 'Tạo từ danh sách từ vựng' }),
      })
      const data = await res.json()
      if (data.deck?.id) {
        await fetchDecks()
        setSelectedDeckId(data.deck.id)
      }
    } catch (err) {
      console.error('Error creating deck:', err)
    }
  }

  const handleSaveInlineDeck = async () => {
    if (!inlineDeckTitle.trim()) return
    await createNewDeckHelper(inlineDeckTitle.trim())
    setIsCreatingCustomDeck(false)
    setInlineDeckTitle('')
  }

  const handleDeckSelectChange = async (val: string) => {
    if (val === 'CREATE_CUSTOM') {
      setInlineDeckTitle('')
      setIsCreatingCustomDeck(true)
    } else if (val === 'CREATE_AUTO') {
      const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const autoTitle = `Deck ${todayStr}`
      await createNewDeckHelper(autoTitle)
    } else {
      setSelectedDeckId(val)
    }
  }

  const removeExcelRow = (index: number) => {
    setExcelRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveExcelBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeckId || isSubmitting) return

    const validRows = excelRows.filter((r) => r.term && r.term.trim().length > 0)
    if (validRows.length === 0) return

    setIsSubmitting(true)

    try {
      const cardsToInsert = validRows.map((r) => ({
        term: r.term.trim(),
        vietnameseDefinition: r.vietnameseDefinition || `Nghĩa tiếng Việt cho ${r.term}`,
        phonetic: r.phonetic,
        partOfSpeech: r.partOfSpeech || 'noun',
        exampleSentence: r.exampleSentence,
        collocations: {
          level: r.level,
          englishDefinition: r.englishDefinition,
          grammarLabel: r.grammarLabel,
        },
      }))

      await fetch(`/api/decks/${selectedDeckId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardsToInsert),
      })

      setShowNewCardModal(false)
      fetchCards()
      fetchDecks()
    } catch (err) {
      console.error('Save excel batch error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeckTitle.trim() || isSubmitting) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newDeckTitle, description: newDeckDesc }),
      })
      const data = await res.json()
      if (data.deck?.id) {
        setSelectedDeckId(data.deck.id)
        setNewDeckTitle('')
        setNewDeckDesc('')
        setShowNewDeckModal(false)
        fetchDecks()
      }
    } catch (err) {
      console.error('Create deck error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeckId || !newTerm.trim() || isSubmitting) return
    setIsSubmitting(true)

    try {
      await fetch(`/api/decks/${selectedDeckId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: newTerm,
          vietnameseDefinition: newVietDefinition || `Nghĩa tiếng Việt cho ${newTerm}`,
          phonetic: newPhonetic,
          partOfSpeech: newPartOfSpeech,
          exampleSentence: newExampleSentence,
          collocations: {
            level: newLevel,
            englishDefinition: newDefinition,
            grammarLabel: newGrammarLabel,
          },
        }),
      })

      setNewTerm('')
      setNewVietDefinition('')
      setNewPhonetic('')
      setNewDefinition('')
      setNewExampleSentence('')
      setNewGrammarLabel('')
      setShowNewCardModal(false)
      fetchCards()
      fetchDecks()
    } catch (err) {
      console.error('Create card error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeckId || !bulkInput.trim() || isSubmitting) return
    setIsSubmitting(true)

    try {
      let cardsToInsert: any[] = []

      try {
        const parsed = JSON.parse(bulkInput)
        if (Array.isArray(parsed)) cardsToInsert = parsed
      } catch {
        const lines = bulkInput.split('\n')
        cardsToInsert = lines
          .map((line) => {
            const parts = line.split('|').map((s) => s.trim())
            if (parts.length >= 2 && parts[0] && parts[1]) {
              const gen = autoGenerateWordDetails(parts[0], parts[3] || 'noun')
              return {
                term: parts[0],
                vietnameseDefinition: parts[1],
                exampleSentence: parts[2] || gen.example,
                partOfSpeech: parts[3] || 'noun',
                phonetic: parts[4] || gen.phonetic,
                collocations: {
                  level: gen.level,
                  englishDefinition: gen.definition,
                  grammarLabel: gen.grammarLabel,
                },
              }
            }
            return null
          })
          .filter(Boolean)
      }

      if (cardsToInsert.length > 0) {
        await fetch(`/api/decks/${selectedDeckId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardsToInsert),
        })

        setBulkInput('')
        setShowBulkModal(false)
        fetchCards()
        fetchDecks()
      }
    } catch (err) {
      console.error('Bulk import error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">YOUR LIBRARY</p>
          <h1>Decks & cards</h1>
          <p className="subhead">Organize your vocabulary into real database decks.</p>
        </div>
        <div className="deck-actions">
          <button className="secondary-button" onClick={() => setShowNewDeckModal(true)}>
            <Plus size={16} /> New deck
          </button>
          <button
            className="hero-action"
            onClick={() => setShowNewCardModal(true)}
          >
            <Sparkles size={16} /> Thêm list từ vựng
          </button>
        </div>
      </div>

      <div className="deck-tabs">
        {decksList.map((d) => (
          <button
            key={d.id}
            className={selectedDeckId === d.id ? 'active' : ''}
            onClick={() => setSelectedDeckId(d.id)}
          >
            {d.title} <span>{d.cardCount}</span>
          </button>
        ))}
      </div>

      <div className="panel cards-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Search Word, Type, Vietnamese, Level..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="cards-table">
          <div className="table-head">
            <span>WORD</span>
            <span>TYPE</span>
            <span>LEVEL</span>
            <span>PRONUNCIATION</span>
            <span>VIETNAMESE</span>
            <span>DEFINITION</span>
            <span>EXAMPLE</span>
            <span />
          </div>

          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : cardsList.length === 0 ? (
            <div style={{ padding: '32px', color: '#64748b', textAlign: 'center' }}>
              No vocabulary words in this deck. Click <strong>Thêm list từ vựng</strong> to generate your first word list!
            </div>
          ) : (
            cardsList
              .filter((c) =>
                `${c.term} ${c.vietnameseDefinition} ${c.partOfSpeech}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((c) => {
                const meta =
                  typeof c.collocations === 'object' && c.collocations !== null && !Array.isArray(c.collocations)
                    ? c.collocations
                    : {}
                const autoGen = autoGenerateWordDetails(c.term, c.partOfSpeech || 'noun')
                const level = meta.level || autoGen.level
                const engDef = meta.englishDefinition || autoGen.definition
                const phonetic = c.phonetic || autoGen.phonetic

                return (
                  <div className="table-row" key={c.id}>
                    <strong className="word-col">{c.term}</strong>
                    <span className="type-chip">{c.partOfSpeech || 'noun'}</span>
                    <span className={`level-chip ${level.toLowerCase()}`}>{level}</span>
                    <span className="phonetic-col">{phonetic}</span>
                    <span className="vietnamese-col">{c.vietnameseDefinition}</span>
                    <span className="def-col">{engDef}</span>
                    <span className="example-col">{c.exampleSentence || '—'}</span>
                    <button className="more-btn" title="Tùy chọn từ vựng" onClick={() => setSelectedCardAction(c)}>
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                )
              })
          )}
        </div>
      </div>

      {/* CARD ACTION DETAILS & DELETE MODAL */}
      {selectedCardAction && (
        <div className="modal-overlay" onClick={() => setSelectedCardAction(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, color: '#0f172a' }}>{selectedCardAction.term}</h3>
                <span className="type-chip">{selectedCardAction.partOfSpeech || 'noun'}</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedCardAction(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', margin: '12px 0 18px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, display: 'block' }}>PHÁT ÂM</span>
                <span style={{ fontFamily: 'monospace', color: '#4f46e5', fontSize: '14px' }}>{selectedCardAction.phonetic || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, display: 'block' }}>NGHĨA TIẾNG VIỆT</span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>{selectedCardAction.vietnameseDefinition}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, display: 'block' }}>ĐỊNH NGHĨA TIẾNG ANH</span>
                <p style={{ margin: '2px 0 0', color: '#475569', lineHeight: 1.4 }}>
                  {typeof selectedCardAction.collocations === 'object' && selectedCardAction.collocations?.englishDefinition
                    ? selectedCardAction.collocations.englishDefinition
                    : 'A key vocabulary term recorded in your database deck.'}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, display: 'block' }}>CÂU VÍ DỤ</span>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {selectedCardAction.exampleSentence || '—'}
                </p>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="secondary-button"
                style={{ color: '#ef4444', borderColor: '#fca5a5', background: '#fff5f5' }}
                onClick={() => handleDeleteCard(selectedCardAction.id)}
              >
                Xóa từ này
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${selectedCardAction.term}: ${selectedCardAction.vietnameseDefinition}`)
                    setCopiedId(selectedCardAction.id)
                    setTimeout(() => setCopiedId(null), 2000)
                  }}
                >
                  {copiedId === selectedCardAction.id ? 'Đã chép ✓' : 'Sao chép'}
                </button>
                <button type="button" className="hero-action" onClick={() => setSelectedCardAction(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW DECK MODAL */}
      {showNewDeckModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create New Deck</h3>
              <button className="modal-close" onClick={() => setShowNewDeckModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateDeck}>
              <div className="form-group">
                <label>Deck Title *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Advanced Academic Vocabulary"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  className="input-field"
                  placeholder="e.g. High-yield IELTS & TOEFL terms"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowNewDeckModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="hero-action" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Deck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART VOCABULARY BATCH LIST MODAL */}
      {showNewCardModal && (
        <div className="modal-overlay">
          <div className="modal-card excel-modal">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Thêm list từ vựng</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Target Deck:</label>
                {isCreatingCustomDeck ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      className="input-field"
                      style={{
                        padding: '0 8px',
                        fontSize: '11.5px',
                        height: '30px',
                        width: '160px',
                        margin: 0,
                        boxSizing: 'border-box',
                        borderRadius: '6px'
                      }}
                      placeholder="Nhập tên Deck..."
                      value={inlineDeckTitle}
                      onChange={(e) => setInlineDeckTitle(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSaveInlineDeck()
                        } else if (e.key === 'Escape') {
                          setIsCreatingCustomDeck(false)
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        height: '30px',
                        padding: '0 12px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 0,
                        boxSizing: 'border-box'
                      }}
                      onClick={handleSaveInlineDeck}
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      style={{
                        height: '30px',
                        padding: '0 12px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: '#ffffff',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 0,
                        boxSizing: 'border-box'
                      }}
                      onClick={() => setIsCreatingCustomDeck(false)}
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <select
                    className="select-field"
                    style={{ padding: '4px 8px', fontSize: '11.5px', width: 'auto', minWidth: '180px' }}
                    value={selectedDeckId || ''}
                    onChange={(e) => handleDeckSelectChange(e.target.value)}
                  >
                    <optgroup label="Danh sách Deck hiện có">
                      {decksList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title} ({d.cardCount || 0} từ)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="＋ Tạo Deck mới">
                      <option value="CREATE_CUSTOM">＋ Tạo Deck mới (Tự đặt tên...)</option>
                      <option value="CREATE_AUTO">
                        ＋ Tạo Deck tự động (Deck {new Date().toLocaleDateString('vi-VN')})
                      </option>
                    </optgroup>
                  </select>
                )}

                <button type="button" className="secondary-button" style={{ padding: '4px 8px', fontSize: '11px', height: '30px' }} onClick={() => addExcelRow(1)}>
                  <Plus size={14} /> Thêm 1 hàng
                </button>
                <button type="button" className="secondary-button" style={{ padding: '4px 8px', fontSize: '11px', height: '30px' }} onClick={() => addExcelRow(5)}>
                  <Plus size={14} /> Thêm 5 hàng
                </button>

                <button className="modal-close" onClick={() => setShowNewCardModal(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveExcelBatch}>
              {/* INSTRUCTION BANNER */}
              <div
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}
              >
                <span style={{ fontSize: '14px' }}>💡</span>
                <span>
                  <strong>Hướng dẫn:</strong> Bạn chỉ cần nhập <strong>Word</strong> và chọn <strong>Type</strong>. Tất cả các cột có biểu tượng <strong>⚡</strong> sẽ được hệ thống tự động hoàn thiện chi tiết!
                </span>
              </div>

              {/* EXCEL SPREADSHEET TABLE GRID */}
              <div className="excel-grid-table">
                <div className="excel-head">
                  <span>#</span>
                  <span>WORD *</span>
                  <span>TYPE *</span>
                  <span>LEVEL ⚡</span>
                  <span>PRONUNCIATION ⚡</span>
                  <span>VIETNAMESE ⚡</span>
                  <span>DEFINITION ⚡</span>
                  <span>EXAMPLE ⚡</span>
                  <span />
                </div>

                <div className="excel-body">
                  {excelRows.map((row, idx) => (
                    <div className="excel-row" key={row.id}>
                      <span className="row-num">{idx + 1}</span>

                      {/* WORD */}
                      <input
                        className="excel-input word-cell"
                        placeholder="Nhập từ (e.g. accomplish)"
                        value={row.term}
                        onChange={(e) => handleExcelCellChange(idx, 'term', e.target.value)}
                      />

                      {/* TYPE */}
                      <select
                        className="excel-select type-cell"
                        value={row.partOfSpeech}
                        onChange={(e) => handleExcelCellChange(idx, 'partOfSpeech', e.target.value)}
                      >
                        <option value="noun">noun</option>
                        <option value="verb">verb</option>
                        <option value="adjective">adjective</option>
                        <option value="adverb">adverb</option>
                        <option value="idiom">idiom</option>
                        <option value="phrasal verb">phrasal verb</option>
                      </select>

                      {/* LEVEL */}
                      <select
                        className="excel-select level-cell"
                        value={row.level}
                        onChange={(e) => handleExcelCellChange(idx, 'level', e.target.value)}
                      >
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                      </select>

                      {/* PRONUNCIATION */}
                      <input
                        className="excel-input auto-cell"
                        placeholder="/Phát âm/"
                        value={row.phonetic}
                        onChange={(e) => handleExcelCellChange(idx, 'phonetic', e.target.value)}
                      />

                      {/* VIETNAMESE */}
                      <textarea
                        className="excel-textarea auto-cell"
                        rows={2}
                        placeholder="Nghĩa tiếng Việt"
                        value={row.vietnameseDefinition}
                        onChange={(e) => handleExcelCellChange(idx, 'vietnameseDefinition', e.target.value)}
                      />

                      {/* DEFINITION */}
                      <textarea
                        className="excel-textarea auto-cell"
                        rows={2}
                        placeholder="English definition"
                        value={row.englishDefinition}
                        onChange={(e) => handleExcelCellChange(idx, 'englishDefinition', e.target.value)}
                      />

                      {/* EXAMPLE */}
                      <textarea
                        className="excel-textarea auto-cell"
                        rows={2}
                        placeholder="Example sentence"
                        value={row.exampleSentence}
                        onChange={(e) => handleExcelCellChange(idx, 'exampleSentence', e.target.value)}
                      />

                      {/* DELETE ROW */}
                      <button type="button" className="delete-row-btn" title="Xóa hàng này" onClick={() => removeExcelRow(idx)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '14px' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                  Đã sẵn sàng {excelRows.filter((r) => r.term && r.term.trim().length > 0).length} từ để thêm vào Deck
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="secondary-button" onClick={() => setShowNewCardModal(false)}>
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="hero-action"
                    disabled={isSubmitting || excelRows.filter((r) => r.term && r.term.trim().length > 0).length === 0}
                  >
                    <Sparkles size={16} />
                    {isSubmitting
                      ? 'Đang lưu...'
                      : `Lưu tất cả (${excelRows.filter((r) => r.term && r.term.trim().length > 0).length}) từ vựng vào Deck`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Bulk Import Vocabulary Cards</h3>
              <button className="modal-close" onClick={() => setShowBulkModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBulkImport}>
              <div className="form-group">
                <label>Paste Data (Format: English Term | Vietnamese Definition | Example Sentence)</label>
                <textarea
                  className="textarea-field"
                  style={{ minHeight: '160px', fontFamily: 'monospace', fontSize: '12px' }}
                  placeholder={`meticulous | Tỉ mỉ, cẩn thận từng chi tiết | He is a meticulous worker.\nresilient | Kiên cường, có khả năng phục hồi nhanh | The city is resilient against storms.`}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="hero-action" disabled={isSubmitting}>
                  {isSubmitting ? 'Importing...' : 'Import Cards'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------
// Analytics View
// ----------------------------------------------------
function Analytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  const learningCount = data?.cardHealth?.learning ?? 0
  const youngCount = data?.cardHealth?.young ?? 0
  const matureCount = data?.cardHealth?.mature ?? 0
  const totalCards = data?.totalCards ?? (learningCount + youngCount + matureCount)

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">INSIGHTS</p>
          <h1>Your learning analytics</h1>
          <p className="subhead">SuperMemo retention rates and translation history.</p>
        </div>
      </div>

      <div className="analytics-metrics">
        <MetricCard icon={TrendingUp} label="Retention rate" value={data?.retentionRate || '100.0%'} detail="Calculated over DB review logs" tone="mint" />
        <MetricCard icon={Target} label="Cards tracked" value={String(totalCards)} detail={`${data?.cardsDue || 0} due for review`} tone="blue" />
        <MetricCard icon={Zap} label="Current streak" value={`${data?.streak?.current || 0} days`} detail={`Longest: ${data?.streak?.longest || 0} days`} tone="purple" />
      </div>

      <div className="analytics-grid">
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">RETENTION</p>
              <h3>Memory stability trend</h3>
            </div>
            <span className="chart-key">
              <i /> Live Database Activity
            </span>
          </div>
          <div className="line-chart">
            <div className="chart-lines">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <svg viewBox="0 0 700 200" preserveAspectRatio="none" aria-label="Retention trend chart">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Filled area */}
              <path
                d="M0 150 C55 135 70 105 130 123 S205 62 260 92 S325 130 365 72 S440 85 480 52 S550 75 600 30 S665 46 700 18 L700 200 L0 200 Z"
                fill="url(#chartGrad)"
              />
              {/* Smooth Trend Line */}
              <path
                d="M0 150 C55 135 70 105 130 123 S205 62 260 92 S325 130 365 72 S440 85 480 52 S550 75 600 30 S665 46 700 18"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Glowing Data Nodes */}
              <circle cx="130" cy="123" r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="260" cy="92" r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="365" cy="72" r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="480" cy="52" r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="600" cy="30" r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="700" cy="18" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
            </svg>
            <div className="chart-labels">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Today</span>
            </div>
          </div>
        </section>

        <section className="panel distribution-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">CARD STABILITY</p>
              <h3>Memory stages</h3>
            </div>
          </div>
          {[
            ['Learning', learningCount, 'blue'],
            ['Young', youngCount, 'purple'],
            ['Mature', matureCount, 'green'],
          ].map(([stageName, countVal, tone]) => {
            const numVal = Number(countVal)
            const percent = totalCards > 0 ? Math.round((numVal / totalCards) * 100) : 0
            return (
              <div className="bar-item" key={String(stageName)}>
                <div>
                  <span>{stageName}</span>
                  <b>{numVal} cards ({percent}%)</b>
                </div>
                <div className="bar">
                  <i className={String(tone)} style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </section>
      </div>

      <section className="panel history-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">RECENT ATTEMPTS</p>
            <h3>Translation history log</h3>
          </div>
        </div>

        {data?.recentTranslations?.length > 0 ? (
          data.recentTranslations.map((log: any) => (
            <div className="history-row" key={log.id}>
              <span className={log.isCorrect ? 'success-icon' : 'error-icon'}>
                {log.isCorrect ? <Check size={15} /> : <X size={15} />}
              </span>
              <span>
                <b>{log.userSubmission}</b>
                <small>{log.grammarCategory} • {log.vietnameseText}</small>
              </span>
              <strong className={log.isCorrect ? 'positive' : 'negative'}>
                {log.isCorrect ? 'Correct' : 'Review'}
              </strong>
            </div>
          ))
        ) : (
          <div style={{ padding: '16px', color: '#64748b' }}>No recent translation logs recorded in database yet.</div>
        )}
      </section>
    </div>
  )
}

// ----------------------------------------------------
// Main App Component
// ----------------------------------------------------
export default function Page() {
  const [view, setView] = useState<View>('Dashboard')
  const [user, setUser] = useState<any>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Global Interactive Modals
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  // Settings State
  const [userNameInput, setUserNameInput] = useState('')
  const [dailyGoalTarget, setDailyGoalTarget] = useState(20)
  const [autoPlayAudio, setAutoPlayAudio] = useState(true)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          setUserNameInput(data.user.name || '')
        }
      })
      .catch(() => {})
  }, [])

  const userInitials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AL'

  const handleGlobalSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch('/api/decks')
      const data = await res.json()
      const allDecks = data.decks || []
      const matches: any[] = []

      for (const d of allDecks) {
        const cRes = await fetch(`/api/decks/${d.id}/cards`)
        const cData = await cRes.json()
        const cards = cData.cards || []
        const filtered = cards.filter(
          (c: any) =>
            c.term?.toLowerCase().includes(query.toLowerCase()) ||
            c.vietnameseDefinition?.toLowerCase().includes(query.toLowerCase())
        )
        matches.push(...filtered.map((c: any) => ({ ...c, deckTitle: d.title, deckId: d.id })))
      }
      setSearchResults(matches)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setUser((prev: any) => ({ ...prev, name: userNameInput || 'Alex Lee' }))
    setSaveMessage('Cài đặt đã được lưu thành công!')
    setTimeout(() => {
      setSaveMessage('')
      setShowSettingsModal(false)
    }, 1000)
  }

  return (
    <main className="app-shell">
      <div
        className={mobileNavOpen ? 'sidebar-backdrop open' : 'sidebar-backdrop'}
        onClick={() => setMobileNavOpen(false)}
      />

      <aside className={mobileNavOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <AppLogo />
          <span>
            lingua<span>flow</span>
          </span>
        </div>

        <nav>
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={view === label ? 'nav-item active' : 'nav-item'}
              onClick={() => {
                setView(label)
                setMobileNavOpen(false)
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setShowHelpModal(true)}>
            <CircleHelp size={18} />
            <span>Help center</span>
          </button>
          <button className="nav-item" onClick={() => setShowSettingsModal(true)}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div
            className="sidebar-user"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowProfileModal(true)}
            title="Xem hồ sơ"
          >
            <span className="avatar">{userInitials}</span>
            <span>
              <b>{user?.name || 'Alex Lee'}</b>
              <small>Student</small>
            </span>
            <MoreHorizontal size={17} />
          </div>
        </div>
      </aside>

      <div className="mobile-header">
        <div className="brand">
          <AppLogo />
          <span>
            lingua<span>flow</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="icon-button" title="Tìm kiếm từ vựng" onClick={() => setShowSearchModal(true)}>
            <Search size={20} />
          </button>
          <button
            className="icon-button"
            title="Mở menu"
            aria-label="Mở menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
      <section className="main-area">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="breadcrumbs">
              <span>Workspace</span>
              <span>/</span>
              <b>{view}</b>
            </div>

            <div className="topbar-actions">
              <button className="icon-button" title="Tìm kiếm từ vựng" onClick={() => setShowSearchModal(true)}>
                <Search size={18} />
              </button>
              <span
                className="avatar"
                style={{ cursor: 'pointer' }}
                title="Hồ sơ cá nhân"
                onClick={() => setShowProfileModal(true)}
              >
                {userInitials}
              </span>
            </div>
          </div>
        </header>

        {view === 'Dashboard' && <Dashboard setView={setView} user={user} />}
        {view === 'Review' && <Review setView={setView} />}
        {view === 'Translate' && <Translate setView={setView} />}
        {view === 'Decks' && <Decks />}
        {view === 'Analytics' && <Analytics />}
      </section>

      <nav className="bottom-nav" aria-label="Điều hướng chính">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={view === label ? 'bottom-nav-item active' : 'bottom-nav-item'}
            onClick={() => setView(label)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* HELP CENTER MODAL */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CircleHelp size={20} style={{ color: '#4f46e5' }} />
                <h3 style={{ margin: 0 }}>Trung tâm trợ giúp (Help Center)</h3>
              </div>
              <button className="modal-close" onClick={() => setShowHelpModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#334155' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <b style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>⚡ 1. Thêm danh sách từ vựng tự động</b>
                <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>
                  Vào mục <strong>Decks</strong> → nhấn <strong>Thêm list từ vựng</strong>. Bạn chỉ cần nhập từ tiếng Anh và chọn loại từ (Noun/Verb/Adj), hệ thống sẽ tự động gợi ý phát âm, nghĩa Việt và câu ví dụ!
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <b style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>🧠 2. Thuật toán lặp lại ngắt quãng SuperMemo SM-2</b>
                <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>
                  Hệ thống phân tích mức độ nhớ của bạn (Again, Hard, Good, Easy) để lên lịch ôn tập chính xác vào thời điểm bạn sắp quên, chuyển từ vựng vào trí nhớ dài hạn.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <b style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>⌨️ 3. Phím tắt thao tác nhanh</b>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginTop: '6px' }}>
                  <div><kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>Space</kbd> : Lật thẻ bài tập</div>
                  <div><kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>1 / 2 / 3 / 4</kbd> : Đánh giá mức độ</div>
                  <div><kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>Enter</kbd> : Gửi đáp án dịch</div>
                  <div><kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>Esc</kbd> : Hủy / Đóng cửa sổ</div>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button type="button" className="hero-action" onClick={() => setShowHelpModal(false)}>
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} style={{ color: '#4f46e5' }} />
                <h3 style={{ margin: 0 }}>Cài đặt hệ thống (Settings)</h3>
              </div>
              <button className="modal-close" onClick={() => setShowSettingsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings}>
              {saveMessage && (
                <div style={{ padding: '8px 12px', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                  {saveMessage}
                </div>
              )}

              <div className="form-group">
                <label>Tên hiển thị người dùng</label>
                <input
                  className="input-field"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mục tiêu thẻ từ ôn tập mỗi ngày (Cards/day)</label>
                <select
                  className="select-field"
                  value={dailyGoalTarget}
                  onChange={(e) => setDailyGoalTarget(Number(e.target.value))}
                >
                  <option value={10}>10 từ / ngày (Nhẹ nhàng)</option>
                  <option value={20}>20 từ / ngày (Tiêu chuẩn - Khuyên dùng)</option>
                  <option value={30}>30 từ / ngày (Chuyên sâu)</option>
                  <option value={50}>50 từ / ngày (Cấp tốc)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phát âm tự động khi lật thẻ</label>
                <select
                  className="select-field"
                  value={autoPlayAudio ? 'on' : 'off'}
                  onChange={(e) => setAutoPlayAudio(e.target.value === 'on')}
                >
                  <option value="on">Bật phát âm tự động</option>
                  <option value="off">Tắt phát âm tự động</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowSettingsModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="hero-action">
                  Lưu cài đặt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL SEARCH MODAL */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={20} style={{ color: '#4f46e5' }} />
                <h3 style={{ margin: 0 }}>Tìm kiếm từ vựng (Global Search)</h3>
              </div>
              <button className="modal-close" onClick={() => setShowSearchModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="search-box" style={{ width: '100%', marginBottom: '14px', padding: '8px 12px' }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Nhập từ tiếng Anh hoặc nghĩa tiếng Việt..."
                value={searchQuery}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {searching ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  <Loader2 className="animate-spin" size={20} /> Đang tìm kiếm...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowSearchModal(false)
                      setView('Decks')
                    }}
                  >
                    <div>
                      <strong style={{ color: '#0f172a', fontSize: '13px' }}>{item.term}</strong>
                      <span className="type-chip" style={{ marginLeft: '8px' }}>{item.partOfSpeech || 'noun'}</span>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>{item.vietnameseDefinition}</p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.deckTitle}
                    </span>
                  </div>
                ))
              ) : searchQuery.trim() ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  Không tìm thấy từ vựng nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  Nhập từ khóa ở ô trên để tìm kiếm nhanh trong toàn bộ các bộ từ vựng của bạn.
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '14px' }}>
              <button type="button" className="secondary-button" onClick={() => setShowSearchModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Hồ sơ người dùng</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: 700 }}>
                {userInitials}
              </div>
              <h3 style={{ margin: 0, color: '#0f172a' }}>{user?.name || 'Alex Lee'}</h3>
              <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px' }}>
                Học viên chính thức • LinguaFlow Member
              </span>
              <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0' }}>
                Email: {user?.email || 'alex.lee@linguaflow.app'}
              </p>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="secondary-button" onClick={() => setShowProfileModal(false)}>
                Đóng
              </button>
              <button type="button" className="hero-action" onClick={() => { setShowProfileModal(false); setShowSettingsModal(true); }}>
                Chỉnh sửa cài đặt
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
