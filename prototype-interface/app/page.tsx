'use client'

import { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle,
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
  RefreshCw,
  Volume2,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AuthModal } from '@/components/auth/AuthModal'
import { evaluateFillInBlank, buildHintPattern, firstLetterOf } from '@/lib/srs/dsr'

type View = 'Dashboard' | 'Review' | 'Translate' | 'Decks' | 'Analytics'

const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Review', icon: Zap },
  { label: 'Translate', icon: BookOpen },
  { label: 'Decks', icon: Library },
  { label: 'Analytics', icon: BarChart3 },
]

function getTypeStyle(type: string) {
  const t = (type || '').toLowerCase().trim()
  if (!t) return { background: '#eef2ff', color: '#4338ca', border: '1px solid #818cf8', fontWeight: 600 }
  if (t === 'noun') return { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontWeight: 600 }
  if (t === 'verb') return { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 600 }
  if (t === 'adjective') return { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', fontWeight: 600 }
  if (t === 'adverb') return { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', fontWeight: 600 }
  return { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', fontWeight: 600 }
}

function getLevelRedStyle(level: string) {
  const lvl = (level || '').toUpperCase().trim()
  if (!lvl) return { background: '#f8fafc', color: '#94a3b8', border: '1px dashed #cbd5e1', fontWeight: 400 }
  if (lvl === 'A1') return { background: '#fff1f2', color: '#f43f5e', border: '1px solid #ffe4e6', fontWeight: 600 }
  if (lvl === 'A2') return { background: '#ffe4e6', color: '#e11d48', border: '1px solid #fecdd3', fontWeight: 600 }
  if (lvl === 'B1') return { background: '#fecdd3', color: '#be123c', border: '1px solid #fda4af', fontWeight: 700 }
  if (lvl === 'B2') return { background: '#fda4af', color: '#9f1239', border: '1px solid #f43f5e', fontWeight: 700 }
  if (lvl === 'C1') return { background: '#fb7185', color: '#ffffff', border: '1px solid #f43f5e', fontWeight: 800 }
  if (lvl === 'C2') return { background: '#e11d48', color: '#ffffff', border: '1px solid #be123c', fontWeight: 800 }
  return { background: '#fff1f2', color: '#f43f5e', border: '1px solid #ffe4e6', fontWeight: 600 }
}

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
          <h1>Good morning, {user?.name ? user.name.split(' ')[0] : 'Guest'}</h1>
          <p className="subhead">Keep your momentum going with LinguaFlow.</p>
        </div>
      </div>

      <section className="hero-card">
        <div className="hero-copy">
          <span className="hero-pill">
            <Sparkles size={14} /> DAILY GOAL
          </span>
          <h2>Make today count.</h2>
          <p>Rèn luyện và ghi nhớ từ vựng hiệu quả mỗi ngày cùng LinguaFlow.</p>
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
              detail={metrics?.reviewedToday ? `✓ Đã hoàn thành ${metrics.reviewedToday} từ hôm nay` : 'Số từ vựng đến lịch ôn tập'}
              tone="blue"
            />
            <MetricCard
              icon={Flame}
              label="Day streak"
              value={loading ? '...' : `${metrics?.streak?.current ?? 0} ngày`}
              detail={`Kỷ lục cá nhân: ${metrics?.streak?.longest ?? 0} ngày`}
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
                            text: `${v} từ vựng đã học ngày ${heatmapDateLabel(i)}`,
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
                  <span className="memory-count green">{loading ? '...' : (metrics?.memoryStatus?.mastered ?? 0)}</span>
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
                  <span className="memory-count blue">{loading ? '...' : (metrics?.memoryStatus?.reviewing ?? 0)}</span>
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
                  <span className="memory-count orange">{loading ? '...' : (metrics?.memoryStatus?.learning ?? 0)}</span>
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
                  <span className="memory-count gray">{loading ? '...' : (metrics?.memoryStatus?.new ?? 0)}</span>
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
// Review View (SRS Flashcards & Fill-in-the-Blank DSR)
// ----------------------------------------------------
function Review({ setView }: { setView: (view: View) => void }) {
  const BATCH_SIZE = 12
  const SESSION_STORAGE_KEY = 'linguaflow_review_session_progress_v1'

  const [modeFilter, setModeFilter] = useState<'mixed' | 'flashcard' | 'fill_in_blank'>('mixed')
  const [fullQueue, setFullQueue] = useState<any[]>([])
  const [batches, setBatches] = useState<any[][]>([])
  const [batchIndex, setBatchIndex] = useState(0)
  const [activeBatchQueue, setActiveBatchQueue] = useState<any[]>([])
  const [batchCompletedCardIds, setBatchCompletedCardIds] = useState<Set<string>>(new Set())
  const [gradedCardIds, setGradedCardIds] = useState<Set<string>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasStartedBatch, setHasStartedBatch] = useState<boolean>(false)

  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageError, setImageError] = useState(false)

  // State for Fill-in-the-Blank exercise
  const [fillInput, setFillInput] = useState('')
  const [hintsUsedCount, setHintsUsedCount] = useState(0)
  const [showPattern, setShowPattern] = useState(false)
  const [showPhonetic, setShowPhonetic] = useState(false)
  const [fillResult, setFillResult] = useState<{ isCorrect: boolean; rating: number; dsr?: any } | null>(null)
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now())
  const fillInputRef = useRef<HTMLInputElement | null>(null)

  const fetchQueue = (all = false, resetSavedSession = false) => {
    setLoading(true)

    // Restore saved session if user left in the middle of a batch
    if (!all && !resetSavedSession) {
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && Array.isArray(parsed.activeBatchQueue) && parsed.activeBatchQueue.length > 0) {
            setFullQueue(parsed.fullQueue || [])
            setBatches(parsed.batches || [])
            setBatchIndex(parsed.batchIndex || 0)
            setActiveBatchQueue(parsed.activeBatchQueue)
            setBatchCompletedCardIds(new Set(parsed.batchCompletedCardIds || []))
            setGradedCardIds(new Set(parsed.gradedCardIds || []))
            setCurrentIndex(parsed.currentIndex || 0)
            setHasStartedBatch(parsed.hasStartedBatch ?? false)
            resetCardState()
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.error('Error restoring saved review session:', err)
      }
    }

    // Otherwise fetch fresh queue from server
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch {}

    fetch(`/api/srs/queue${all ? '?all=true' : ''}`)
      .then((res) => res.json())
      .then((data) => {
        const rawQueue: any[] = data.queue || []
        setFullQueue(rawQueue)

        const chunked: any[][] = []
        for (let i = 0; i < rawQueue.length; i += BATCH_SIZE) {
          chunked.push(rawQueue.slice(i, i + BATCH_SIZE))
        }

        setBatches(chunked)
        setBatchIndex(0)

        const firstBatch = chunked[0] || []
        setActiveBatchQueue([...firstBatch])
        setBatchCompletedCardIds(new Set())
        setGradedCardIds(new Set())
        setCurrentIndex(0)
        setHasStartedBatch(false)
        resetCardState()
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  // Auto-save session progress on state change
  useEffect(() => {
    if (loading || activeBatchQueue.length === 0) return
    try {
      const payload = {
        batchIndex,
        activeBatchQueue,
        batchCompletedCardIds: Array.from(batchCompletedCardIds),
        gradedCardIds: Array.from(gradedCardIds),
        currentIndex,
        fullQueue,
        batches,
        hasStartedBatch,
        timestamp: Date.now(),
      }
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload))
    } catch {}
  }, [batchIndex, activeBatchQueue, batchCompletedCardIds, gradedCardIds, currentIndex, fullQueue, batches, hasStartedBatch, loading])

  const resetCardState = () => {
    setRevealed(false)
    setImageError(false)
    setFillInput('')
    setHintsUsedCount(0)
    setShowPattern(false)
    setShowPhonetic(false)
    setFillResult(null)
    setCardStartTime(Date.now())
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  useEffect(() => {
    resetCardState()
  }, [currentIndex, modeFilter])

  const currentBatchInitial = batches[batchIndex] || []
  const totalBatchUniqueCount = currentBatchInitial.length
  const currentCard = activeBatchQueue[currentIndex]
  const isBatchCompleted = totalBatchUniqueCount > 0 && batchCompletedCardIds.size >= totalBatchUniqueCount

  // Calculate effective mode for current card
  const activeMode: 'flashcard' | 'fill_in_blank' =
    modeFilter === 'flashcard'
      ? 'flashcard'
      : modeFilter === 'fill_in_blank'
      ? 'fill_in_blank'
      : currentIndex % 2 === 0
      ? 'flashcard'
      : 'fill_in_blank'

  const playCardAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentCard?.term) return
    if (currentCard.audioUrl) {
      const audio = new Audio(currentCard.audioUrl)
      audio.play().catch(() => {
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(currentCard.term)
          u.lang = 'en-US'
          window.speechSynthesis.speak(u)
        }
      })
    } else if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(currentCard.term)
      u.lang = 'en-US'
      window.speechSynthesis.speak(u)
    }
  }

  const recordCardResult = (rating: number) => {
    if (!currentCard) return
    const cardId = currentCard.cardId

    if (rating >= 3) {
      // Good or Easy (or correct fill-in): Mark card as completed in current batch
      setBatchCompletedCardIds((prev) => {
        const next = new Set(prev)
        next.add(cardId)
        return next
      })
    } else {
      // Rating 1 (Again) or 2 (Hard) or Incorrect fill-in:
      // Re-insert card 3 positions later in activeBatchQueue so user repeats it within this batch!
      setActiveBatchQueue((prevQueue) => {
        const insertOffset = Math.min(prevQueue.length, currentIndex + 3)
        const updated = [...prevQueue]
        updated.splice(insertOffset, 0, currentCard)
        return updated
      })
    }
  }

  const advanceToNextCard = () => {
    if (currentIndex + 1 < activeBatchQueue.length) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const startNextBatch = () => {
    if (batchIndex + 1 < batches.length) {
      const nextIdx = batchIndex + 1
      setBatchIndex(nextIdx)
      const nextBatchCards = batches[nextIdx] || []
      setActiveBatchQueue([...nextBatchCards])
      setBatchCompletedCardIds(new Set())
      setCurrentIndex(0)
      setHasStartedBatch(false)
      resetCardState()
    }
  }

  const handleGrade = async (rating: number) => {
    if (!currentCard || submitting) return

    const cardId = currentCard.cardId
    const isFirstRatingInSession = !gradedCardIds.has(cardId)

    setSubmitting(true)

    try {
      if (isFirstRatingInSession) {
        // State 1: Call Database SRS / DSR algorithm update ONLY for the FIRST rating of the card
        await fetch('/api/srs/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId,
            rating,
          }),
        })
        setGradedCardIds((prev) => {
          const next = new Set(prev)
          next.add(cardId)
          return next
        })
      }

      // State 2: Intra-batch in-memory RAM queue update
      recordCardResult(rating)
      advanceToNextCard()
    } catch (err) {
      console.error('Error grading card:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFillSubmit = async (gaveUp = false) => {
    if (!currentCard || submitting || fillResult) return

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - cardStartTime) / 1000))
    const evalRes = evaluateFillInBlank({
      userInput: fillInput,
      targetWord: currentCard.term,
      hintsUsedCount: gaveUp ? 3 : hintsUsedCount,
      elapsedSeconds,
      gaveUp,
    })

    // Correct fill-in always counts as passing grade (rating >= 3, like Good/Easy) => +1 progress
    const effectiveRating = evalRes.isCorrect ? Math.max(3, evalRes.rating) : evalRes.rating

    const cardId = currentCard.cardId
    const isFirstRatingInSession = !gradedCardIds.has(cardId)

    setSubmitting(true)

    try {
      let dsrData: any = null

      if (isFirstRatingInSession) {
        // State 1: Call Database SRS / DSR algorithm update ONLY for the FIRST rating of the card
        const res = await fetch('/api/srs/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId,
            rating: effectiveRating,
          }),
        })
        const data = await res.json()
        dsrData = data.dsr || data.newState
        setGradedCardIds((prev) => {
          const next = new Set(prev)
          next.add(cardId)
          return next
        })
      }

      // State 2: Intra-batch in-memory RAM queue update (+1 progress if effectiveRating >= 3)
      recordCardResult(effectiveRating)

      setFillResult({
        isCorrect: evalRes.isCorrect,
        rating: effectiveRating,
        dsr: dsrData,
      })

      if (evalRes.isCorrect) {
        playCardAudio()
      }
    } catch (err) {
      console.error('Fill in blank submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUseHintPattern = () => {
    if (!showPattern) {
      setShowPattern(true)
      setHintsUsedCount((prev) => Math.max(prev, 1))
    }
  }

  const handleUseHintPhonetic = () => {
    if (!showPhonetic) {
      setShowPhonetic(true)
      setHintsUsedCount((prev) => Math.max(prev, 2))
    }
  }

  const handleKeyDownRef = useRef<((e: KeyboardEvent) => void) | undefined>(undefined)
  handleKeyDownRef.current = (e: KeyboardEvent) => {
    const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA'

    // Pre-start screen shortcut: Enter or Space starts batch
    if (!hasStartedBatch && !isBatchCompleted && currentCard) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        setHasStartedBatch(true)
        return
      }
    }

    // Audio shortcut: 'R' or 'r' (when not typing in input) or 'Alt+R' / 'F2' / 'A'
    if ((e.key === 'r' || e.key === 'R' || e.key === 'a' || e.key === 'A' || e.code === 'F2') && (!isInput || e.altKey)) {
      if (!e.ctrlKey) {
        e.preventDefault()
        playCardAudio()
        return
      }
    }

    if (activeMode === 'flashcard') {
      if (e.code === 'Space') {
        e.preventDefault()
        setRevealed((r) => !r)
      } else if (revealed && !submitting) {
        if (e.key === '1') handleGrade(1)
        if (e.key === '2') handleGrade(2)
        if (e.key === '3') handleGrade(3)
        if (e.key === '4') handleGrade(4)
      }
    } else if (activeMode === 'fill_in_blank') {
      // Tab key shortcut: focus input box so user can start typing
      if (e.key === 'Tab') {
        e.preventDefault()
        fillInputRef.current?.focus()
        return
      }

      // Hint shortcut: Press 'H' / 'h' 1st time for Hint 1 (Letter pattern), 2nd time for Hint 2 (IPA)
      if ((e.key === 'h' || e.key === 'H') && (!isInput || e.altKey)) {
        e.preventDefault()
        if (!showPattern) {
          handleUseHintPattern()
        } else if (!showPhonetic) {
          handleUseHintPhonetic()
        }
      } else if (e.altKey && e.key === '1') {
        e.preventDefault()
        handleUseHintPattern()
      } else if (e.altKey && e.key === '2') {
        e.preventDefault()
        handleUseHintPhonetic()
      } else if ((e.key === 'f' || e.key === 'F' || (e.altKey && (e.key === '3' || e.key === 'f' || e.key === 'F'))) && (!isInput || e.altKey)) {
        e.preventDefault()
        handleFillSubmit(true)
      } else if (e.key === 'Enter') {
        if (fillResult) {
          advanceToNextCard()
        }
      }
    }
  }

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      handleKeyDownRef.current?.(e)
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  if (loading) {
    return (
      <div className="page-content review-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  if (isBatchCompleted || !currentCard) {
    const isFinal = batchIndex >= batches.length - 1 || batches.length === 0
    const isEmptyQueue = fullQueue.length === 0

    if (isFinal) {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY)
      } catch {}
    }

    return (
      <div className="page-content review-page" style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '20px' }}>
        <div className="batch-complete-card">
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: isEmptyQueue ? '#e0e7ff' : isFinal ? '#fef3c7' : '#e0e7ff',
              color: isEmptyQueue ? '#4f46e5' : isFinal ? '#d97706' : '#4f46e5',
              display: 'grid',
              placeItems: 'center',
              fontSize: '32px',
              margin: '0 auto',
            }}
          >
            {isEmptyQueue ? '✨' : isFinal ? '🏆' : '🎉'}
          </div>

          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: '#6366f1', textTransform: 'uppercase' }}>
            {isEmptyQueue
              ? 'CHƯA CÓ TỪ CẦN ÔN HÔM NAY'
              : isFinal
              ? 'TẤT CẢ BÀI HỌC HOÀN THÀNH'
              : `ĐỢT HỌC ${batchIndex + 1} / ${batches.length} HOÀN THÀNH`}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isEmptyQueue
              ? 'Tuyệt vời! Bạn đã hoàn thành toàn bộ từ vựng đến hạn'
              : isFinal
              ? `Xuất sắc! Hoàn thành toàn bộ ${fullQueue.length} từ vựng`
              : `Hoàn thành Đợt ${batchIndex + 1} (${totalBatchUniqueCount}/${totalBatchUniqueCount} từ)!`}
          </h2>

          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, maxWidth: '460px', lineHeight: 1.5 }}>
            {isEmptyQueue
              ? 'Hiện tại không có từ vựng nào đến lịch cần ôn tập. Bạn có thể bấm "Ôn Luyện Tự Do Thêm" để ôn lại toàn bộ deck hoặc thêm từ vựng mới!'
              : isFinal
              ? 'Bạn đã làm chủ hoàn toàn các từ vựng trong lượt ôn tập này. Hãy tiếp tục duy trì thói quen học hàng ngày!'
              : `Bạn đã làm chủ ${totalBatchUniqueCount} từ vựng trong Đợt ${batchIndex + 1}. Bạn có muốn tiếp tục sang đợt tiếp theo?`}
          </p>

          <div className="batch-summary-box">
            <div>
              <small style={{ fontSize: '11px', display: 'block', fontWeight: 600, opacity: 0.8 }}>
                {isEmptyQueue ? 'TỪ CẦN ÔN HÔM NAY' : 'TỪ ĐÃ HỌC ĐỢT NÀY'}
              </small>
              <strong style={{ fontSize: '18px' }}>
                {isEmptyQueue ? '0 từ' : `${totalBatchUniqueCount} từ`}
              </strong>
            </div>
            <div className="batch-divider" />
            <div>
              <small style={{ fontSize: '11px', display: 'block', fontWeight: 600, opacity: 0.8 }}>
                {isEmptyQueue ? 'TRẠNG THÁI' : 'TỔNG SỐ ĐỢT HỌC'}
              </small>
              <strong style={{ fontSize: '18px', color: '#4f46e5' }} className="highlight-text">
                {isEmptyQueue ? 'Hoàn thành 100%' : batches.length > 0 ? `${batchIndex + 1} / ${batches.length}` : '1 / 1'}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', width: '100%', justifyContent: 'center' }}>
            <button
              type="button"
              className="secondary-button"
              style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 600, borderRadius: '10px' }}
              onClick={() => setView('Dashboard')}
            >
              Về Trang Dashboard
            </button>

            {!isFinal ? (
              <button
                type="button"
                className="hero-action"
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700, borderRadius: '10px', margin: 0 }}
                onClick={startNextBatch}
              >
                Bắt đầu Đợt {batchIndex + 2} ({batches[batchIndex + 1]?.length || 12} từ tiếp) <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="hero-action"
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700, borderRadius: '10px', margin: 0 }}
                onClick={() => fetchQueue(true)}
              >
                <RefreshCw size={14} /> Ôn Luyện Tự Do Thêm
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Format masked sentence for Fill-in-the-Blank
  const getMaskedSentence = () => {
    const term = (currentCard.term || '').trim()
    const sentence = (currentCard.exampleSentence || '').trim()

    if (!sentence) {
      return (
        <span>
          Điền từ tiếng Anh có nghĩa: <strong style={{ color: '#4f46e5' }}>&quot;{currentCard.vietnameseDefinition}&quot;</strong>
        </span>
      )
    }

    if (!term) {
      return <span>{sentence}</span>
    }

    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Find best regex pattern
    let pattern = `\\b${escapedTerm}\\b`
    if (!new RegExp(pattern, 'i').test(sentence)) {
      const stem = escapedTerm.replace(/(ing|ed|es|s|e)$/i, '')
      if (stem.length >= 3) {
        pattern = `\\b${stem}[a-z]*\\b`
      }
    }
    if (!new RegExp(pattern, 'i').test(sentence)) {
      pattern = escapedTerm
    }

    const splitReg = new RegExp(pattern, 'gi')
    if (new RegExp(pattern, 'i').test(sentence)) {
      const parts = sentence.split(splitReg)
      return (
        <span>
          {parts[0]}
          <span style={{ borderBottom: '2px solid #4f46e5', padding: '0 8px', color: '#4f46e5', fontWeight: 700 }}>
            [ _____ ]
          </span>
          {parts.slice(1).join('[ _____ ]')}
        </span>
      )
    }

    // Fallback: sentence exists but term pattern wasn't found in it
    return (
      <span>
        {sentence}{' '}
        <span style={{ borderBottom: '2px solid #4f46e5', padding: '0 8px', color: '#4f46e5', fontWeight: 700 }}>
          [ _____ ]
        </span>
      </span>
    )
  }

  const getRatingBadgeText = (rating: number) => {
    switch (rating) {
      case 4:
        return { label: '4: Easy', bg: '#e0e7ff', color: '#3730a3', desc: 'Instant recall (<5s, 0 hints)' }
      case 3:
        return { label: '3: Good', bg: '#dcfce7', color: '#166534', desc: 'Good recall (0-1 hints)' }
      case 2:
        return { label: '2: Hard', bg: '#fef3c7', color: '#92400e', desc: 'Recalled with 2 hints' }
      case 1:
      default:
        return { label: '1: Again', bg: '#fee2e2', color: '#991b1b', desc: 'Incorrect or gave up' }
    }
  }

  return (
    <div className="page-content review-page">
      <div className="review-top">
        <div>
          <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            VOCABULARY REVIEW · {currentCard.deckTitle}
            {batches.length > 1 && (
              <span
                style={{
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                Đợt {batchIndex + 1} / {batches.length}
              </span>
            )}
          </p>
          <h1>Daily review</h1>
          <p className="subhead">
            {batches.length > 1
              ? `Đợt ${batchIndex + 1}: Luyện tập ${totalBatchUniqueCount} từ vựng (Tổng ${fullQueue.length} từ)`
              : 'Luyện tập & ghi nhớ từ vựng hàng ngày'}
          </p>
        </div>
        <div className="review-count">
          <strong>{batchCompletedCardIds.size} / {totalBatchUniqueCount}</strong>
          <span>thành thạo đợt này</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mode-switcher-container">
        <button
          type="button"
          onClick={() => setModeFilter('mixed')}
          className={`mode-switcher-tab ${modeFilter === 'mixed' ? 'active' : ''}`}
        >
          <RefreshCw size={14} /> 🔀 Trộn lẫn (Mặc định)
        </button>
        <button
          type="button"
          onClick={() => setModeFilter('flashcard')}
          className={`mode-switcher-tab ${modeFilter === 'flashcard' ? 'active' : ''}`}
        >
          <Zap size={14} /> 🎴 Flashcards
        </button>
        <button
          type="button"
          onClick={() => setModeFilter('fill_in_blank')}
          className={`mode-switcher-tab ${modeFilter === 'fill_in_blank' ? 'active' : ''}`}
        >
          <Sparkles size={14} /> ✍️ Fill-in-the-Blank
        </button>
      </div>

      <div className="session-progress">
        <span style={{ width: `${totalBatchUniqueCount > 0 ? (batchCompletedCardIds.size / totalBatchUniqueCount) * 100 : 0}%` }} />
      </div>

      {/* MODE 1: FLASHCARD REVIEW */}
      {activeMode === 'flashcard' && (
        <>
          <div className="review-layout">
            <div className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(!revealed)}>
              <div className="card-label-row" style={{ position: 'absolute', top: '18px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-label">{revealed ? 'ENGLISH & PRONUNCIATION' : 'VIETNAMESE DEFINITION'}</div>
                {currentCard.cefrLevel && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    {currentCard.cefrLevel}
                  </span>
                )}
              </div>

              {revealed && (
                <div className="card-media">
                  {currentCard.imageUrl && !imageError ? (
                    <img
                      src={currentCard.imageUrl}
                      alt={currentCard.term}
                      loading="lazy"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="card-media-placeholder">
                      <ImageIcon size={22} />
                      <span>Hình minh hoạ pre-saved</span>
                    </div>
                  )}
                </div>
              )}

              <div className="card-word-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <div className={`card-word ${!revealed ? 'vietnamese-text' : ''}`}>{revealed ? currentCard.term : currentCard.vietnameseDefinition}</div>
                {revealed && (
                  <button
                    type="button"
                    className="audio-play-btn"
                    title="Nghe phát âm (Phím tắt: R / Alt + A)"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={playCardAudio}
                  >
                    <Volume2 size={18} />
                  </button>
                )}
              </div>

              <p>{revealed ? `${currentCard.phonetic || ''} • ${currentCard.partOfSpeech || ''}` : 'Tap card or press space to reveal answer'}</p>

              {revealed && currentCard.englishMeaning && (
                <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px', fontStyle: 'italic' }}>
                  &quot;{currentCard.englishMeaning}&quot;
                </div>
              )}

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
            <span>Phím tắt:</span>
            <kbd>Space</kbd>
            <small>lật thẻ</small>
            <kbd>1</kbd>
            <kbd>2</kbd>
            <kbd>3</kbd>
            <kbd>4</kbd>
            <small>đánh giá</small>
            <kbd>R</kbd>
            <small>phát âm</small>
          </div>
        </>
      )}

      {/* MODE 2: FILL-IN-THE-BLANK (DSR EVALUATION) */}
      {activeMode === 'fill_in_blank' && (
        <div className="review-layout" style={{ maxWidth: '640px' }}>
          <div className="fill-in-blank-card">
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#6366f1' }}>
                LUYỆN ĐIỀN TỪ
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => playCardAudio()}
                  title="Nghe phát âm (Phím tắt: R)"
                  className="icon-button-sm"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    color: '#4f46e5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    marginRight: '4px',
                  }}
                >
                  <Volume2 size={14} />
                </button>
                {currentCard.partOfSpeech && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--muted-bg, #f1f5f9)', color: 'var(--foreground, #475569)', fontWeight: 600 }}>
                    {currentCard.partOfSpeech}
                  </span>
                )}
                {currentCard.cefrLevel && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    {currentCard.cefrLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Vietnamese Meaning Prompt */}
            <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
              <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 500 }}>Nghĩa tiếng Việt</span>
              <h2 style={{ fontSize: '24px', fontWeight: 750, margin: '4px 0 0' }}>
                {currentCard.vietnameseDefinition}
              </h2>
            </div>

            {/* Sentence with Blank */}
            <div className="sentence-blank-box">
              {getMaskedSentence()}
            </div>

            {/* Progressive Hint Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleUseHintPattern}
                  disabled={fillResult !== null || showPattern}
                  title="Phím tắt: H (bấm 1 lần)"
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: showPattern ? '#eef2ff' : '#ffffff',
                    color: showPattern ? '#4f46e5' : '#475569',
                    cursor: showPattern || fillResult !== null ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  💡 Hint 1: Gợi ý chữ cái
                </button>

                <button
                  type="button"
                  onClick={handleUseHintPhonetic}
                  disabled={fillResult !== null || showPhonetic}
                  title="Phím tắt: H (bấm 2 lần)"
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: showPhonetic ? '#eef2ff' : '#ffffff',
                    color: showPhonetic ? '#4f46e5' : '#475569',
                    cursor: showPhonetic || fillResult !== null ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  🔊 Hint 2: Phiên âm IPA
                </button>
              </div>

              {/* Display active hint banners if unlocked */}
              {(showPattern || showPhonetic) && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#3730a3',
                  }}
                >
                  {showPattern && (
                    <span>
                      Pattern: <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{buildHintPattern(currentCard.term)}</strong>
                    </span>
                  )}
                  {showPhonetic && (
                    <span>
                      IPA: <strong>{currentCard.phonetic || 'N/A'}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Input Box & Submit Action */}
            {!fillResult ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleFillSubmit(false)
                }}
                style={{ display: 'flex', gap: '8px', marginTop: '8px' }}
              >
                <input
                  ref={fillInputRef}
                  type="text"
                  value={fillInput}
                  onChange={(e) => setFillInput(e.target.value)}
                  placeholder="Gõ từ tiếng Anh (ấn Tab để trỏ vào đây)..."
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '15px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
                <button
                  type="submit"
                  disabled={!fillInput.trim() || submitting}
                  style={{
                    padding: '0 20px',
                    background: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: fillInput.trim() && !submitting ? 'pointer' : 'not-allowed',
                    opacity: fillInput.trim() && !submitting ? 1 : 0.6,
                  }}
                >
                  Nộp bài
                </button>
                <button
                  type="button"
                  onClick={() => handleFillSubmit(true)}
                  disabled={submitting}
                  style={{
                    padding: '0 12px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Bỏ cuộc tính là 1: Again (Phím tắt: F)"
                >
                  <span>Bỏ cuộc</span>
                </button>
              </form>
            ) : (
              /* Evaluation Result Panel */
              <div
                style={{
                  marginTop: '12px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: fillResult.isCorrect ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${fillResult.isCorrect ? '#bbf7d0' : '#fecaca'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: fillResult.isCorrect ? '#16a34a' : '#dc2626',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {fillResult.isCorrect ? '✓' : '✕'}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 750, color: fillResult.isCorrect ? '#166534' : '#991b1b' }}>
                      {fillResult.isCorrect ? 'Chính xác!' : 'Chưa chính xác'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '14px', color: '#1e293b' }}>
                  Từ đúng: <strong style={{ color: '#4f46e5', fontSize: '16px' }}>{currentCard.term}</strong>
                  {currentCard.phonetic && <span style={{ marginLeft: '8px', color: '#64748b', fontSize: '13px' }}>{currentCard.phonetic}</span>}
                  <button
                    type="button"
                    onClick={() => playCardAudio()}
                    title="Nghe phát âm (Phím tắt: R hoặc Alt + A)"
                    style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5' }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={advanceToNextCard}
                  style={{
                    marginTop: '6px',
                    padding: '10px 16px',
                    background: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  Chuyển từ tiếp theo (Enter) <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="keyboard-tip" style={{ marginTop: '16px' }}>
            <Keyboard size={16} />
            <span>Phím tắt:</span>
            <kbd>R</kbd>
            <small>phát âm</small>
            <kbd>H</kbd>
            <small>gợi ý (1/2 lần)</small>
            <kbd>Tab</kbd>
            <small>vào ô nhập</small>
            <kbd>Enter</kbd>
            <small>nộp / từ tiếp</small>
            <kbd>F</kbd>
            <small>bỏ cuộc</small>
          </div>
        </div>
      )}
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
    level: 'C1',
    phonetic: '/əˈkʌm.plɪʃ/',
    vietnamese: 'Đạt được, hoàn thành mục tiêu',
    definition: 'To achieve or complete successfully a desired goal.',
    example: 'She accomplished all her objectives before the deadline.',
    grammarLabel: 'Transitive Verb (VT) / Past: -ed',
  },
  resilience: {
    level: 'C2',
    phonetic: '/rɪˈzɪl.jəns/',
    vietnamese: 'Khả năng phục hồi, sự kiên cường',
    definition: 'The capacity to recover quickly from difficulties; toughness.',
    example: 'Her resilience helped her overcome difficult times.',
    grammarLabel: 'Uncountable Noun [U]',
  },
  innovative: {
    level: 'C1',
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
  raid: {
    level: 'C2',
    phonetic: '/reɪd/',
    vietnamese: 'Cuộc đột kích / Tấn công bất ngờ',
    definition: 'A sudden, short and usually unexpected attack, or to make a raid on.',
    example: 'The police carried out a raid on the gambling den.',
    grammarLabel: 'Verb [Transitive] / Noun [C]',
  },
  perseverance: {
    level: 'C2',
    phonetic: '/ˌpɜː.sɪˈvɪə.rəns/',
    vietnamese: 'Tính kiên trì, sự bền bỉ',
    definition: 'Continued effort to do or achieve something, even when this is difficult.',
    example: 'It took a lot of patience and perseverance for all sides to reach an agreement.',
    grammarLabel: 'Uncountable Noun [U]',
  },
}

function autoGenerateWordDetails(term: string, type: string) {
  const cleanTerm = term.trim().toLowerCase()
  if (!cleanTerm) {
    return {
      level: '',
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
  const capitalized = cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1)

  return {
    level: inferredLevel,
    phonetic: `/${cleanTerm}/`,
    vietnamese: '',
    definition: '',
    example: '',
    grammarLabel: type ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : 'General Usage',
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
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false)
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
    { id: '4', term: '', partOfSpeech: '', level: '', phonetic: '', vietnameseDefinition: '', englishDefinition: '', exampleSentence: '' },
    { id: '5', term: '', partOfSpeech: '', level: '', phonetic: '', vietnameseDefinition: '', englishDefinition: '', exampleSentence: '' },
  ])

  // Warning Modal state for incomplete Excel rows
  const [showIncompleteWarningModal, setShowIncompleteWarningModal] = useState(false)
  const [validRowsToSave, setValidRowsToSave] = useState<any[]>([])
  const [skippedIncompleteCount, setSkippedIncompleteCount] = useState(0)

  const fetchLiveEnrichment = async (index: number, term: string, type: string) => {
    if (!term || !term.trim() || !type || !type.trim()) return

    setExcelRows((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { ...updated[index], isLoadingEnrichment: true }
      }
      return updated
    })

    try {
      const res = await fetch(`/api/enrich?word=${encodeURIComponent(term.trim())}&type=${encodeURIComponent(type.trim())}`)
      if (!res.ok) return
      const data = await res.json()
      setExcelRows((prev) => {
        const updated = [...prev]
        if (!updated[index]) return prev
        const current = { ...updated[index], isLoadingEnrichment: false }
        if (data.cefrLevel) current.level = data.cefrLevel
        if (data.phonetic) current.phonetic = data.phonetic
        if (data.partOfSpeech) current.partOfSpeech = data.partOfSpeech
        if (data.vietnameseMeaning) current.vietnameseDefinition = data.vietnameseMeaning
        if (data.englishMeaning) current.englishDefinition = data.englishMeaning
        if (data.example) current.exampleSentence = data.example
        updated[index] = current
        return updated
      })
    } catch {
      setExcelRows((prev) => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = { ...updated[index], isLoadingEnrichment: false }
        }
        return updated
      })
    }
  }

  const handleExcelCellChange = (index: number, field: string, value: string) => {
    setExcelRows((prev) => {
      const updated = [...prev]
      const current = { ...updated[index], [field]: value }
      updated[index] = current
      return updated
    })

    const targetTerm = field === 'term' ? value : (excelRows[index]?.term || '')
    const targetType = field === 'partOfSpeech' ? value : (excelRows[index]?.partOfSpeech || '')

    // Live fetch enrichment when word AND type are provided by user so fields preview live on screen
    if (targetTerm.trim().length >= 1 && targetType.trim().length >= 1) {
      fetchLiveEnrichment(index, targetTerm, targetType)
    }
  }

  const addExcelRow = (count = 1) => {
    setExcelRows((prev) => {
      const newRows = []
      for (let i = 0; i < count; i++) {
        newRows.push({
          id: String(Date.now() + Math.random()),
          term: '',
          partOfSpeech: '',
          level: '',
          phonetic: '',
          vietnameseDefinition: '',
          englishDefinition: '',
          exampleSentence: '',
        })
      }
      return [...prev, ...newRows]
    })
  }

  const resetExcelGrid = () => {
    const freshRows = []
    for (let i = 0; i < 5; i++) {
      freshRows.push({
        id: String(Date.now() + i + Math.random()),
        term: '',
        partOfSpeech: '',
        level: '',
        phonetic: '',
        vietnameseDefinition: '',
        englishDefinition: '',
        exampleSentence: '',
      })
    }
    setExcelRows(freshRows)
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

  const handleSaveExcelBatch = async (e?: React.FormEvent, forceSave = false) => {
    if (e) e.preventDefault()
    if (!selectedDeckId || isSubmitting) return

    const rowsWithWord = excelRows.filter((r) => r.term && r.term.trim().length > 0)
    if (rowsWithWord.length === 0) return

    const validRows = rowsWithWord.filter((r) => r.partOfSpeech && r.partOfSpeech.trim().length > 0)
    const incompleteRows = rowsWithWord.filter((r) => !r.partOfSpeech || !r.partOfSpeech.trim())

    // If there is at least 1 incomplete row AND not force-saving, show warning modal!
    if (incompleteRows.length > 0 && !forceSave) {
      setSkippedIncompleteCount(incompleteRows.length)
      setValidRowsToSave(validRows)
      setShowIncompleteWarningModal(true)
      return
    }

    const rowsToProcess = forceSave ? validRowsToSave : validRows
    if (rowsToProcess.length === 0) {
      setShowIncompleteWarningModal(false)
      return
    }

    setIsSubmitting(true)
    setShowIncompleteWarningModal(false)

    try {
      // Check ALL words at once when clicking Save!
      // If any word has missing columns (vietnamese, phonetic, example, etc.), enrich via Gemini 1.5 Flash
      const cardsToInsert = await Promise.all(
        rowsToProcess.map(async (r) => {
          let vietDef = r.vietnameseDefinition
          let phon = r.phonetic
          let pos = r.partOfSpeech
          let ex = r.exampleSentence
          let engDef = r.englishDefinition
          let lvl = r.level

          // Single batch check on Save: Enrich missing fields via Gemini 1.5 Flash + Dictionary pipeline
          if (!vietDef || !phon || !ex || !engDef || !lvl) {
            try {
              const res = await fetch(`/api/enrich?word=${encodeURIComponent(r.term.trim())}&type=${encodeURIComponent((pos || '').trim())}`)
              if (res.ok) {
                const data = await res.json()
                if (!vietDef && data.vietnameseMeaning) vietDef = data.vietnameseMeaning
                if (!phon && data.phonetic) phon = data.phonetic
                if (!ex && data.example) ex = data.example
                if (!engDef && data.englishMeaning) engDef = data.englishMeaning
                if (!lvl && data.cefrLevel) lvl = data.cefrLevel
              }
            } catch {}
          }

          return {
            term: r.term.trim(),
            vietnameseDefinition: vietDef || `Nghĩa của ${r.term.trim()}`,
            phonetic: phon || `/${r.term.trim()}/`,
            partOfSpeech: pos,
            exampleSentence: ex || '',
            collocations: {
              level: lvl || 'B1',
              englishDefinition: engDef || '',
              grammarLabel: r.grammarLabel || '',
            },
          }
        })
      )

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
      let vietDef = newVietDefinition
      let phon = newPhonetic
      let pos = newPartOfSpeech
      let ex = newExampleSentence
      let engDef = newDefinition
      let lvl = newLevel

      if (!vietDef || !phon || !ex || !pos || vietDef.startsWith('Nghĩa')) {
        try {
          const res = await fetch(`/api/enrich?word=${encodeURIComponent(newTerm.trim())}&type=${encodeURIComponent((pos || '').trim())}`)
          if (res.ok) {
            const data = await res.json()
            if ((!vietDef || vietDef.startsWith('Nghĩa')) && data.vietnameseMeaning) vietDef = data.vietnameseMeaning
            if (!phon && data.phonetic) phon = data.phonetic
            if (!pos && data.partOfSpeech) pos = data.partOfSpeech
            if (!ex && data.example) ex = data.example
            if (!engDef && data.englishMeaning) engDef = data.englishMeaning
            if (!lvl && data.cefrLevel) lvl = data.cefrLevel
          }
        } catch {}
      }

      const gen = autoGenerateWordDetails(newTerm, pos || 'noun')

      await fetch(`/api/decks/${selectedDeckId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: newTerm.trim(),
          vietnameseDefinition: vietDef || gen.vietnamese || `Nghĩa tiếng Việt của ${newTerm.trim()}`,
          phonetic: phon || gen.phonetic || `/${newTerm.trim()}/`,
          partOfSpeech: pos || 'noun',
          exampleSentence: ex || gen.example || '',
          collocations: {
            level: lvl || gen.level || 'B1',
            englishDefinition: engDef || gen.definition || '',
            grammarLabel: newGrammarLabel || gen.grammarLabel || '',
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
                    <span className="type-chip" style={getTypeStyle(c.partOfSpeech || 'noun')}>{c.partOfSpeech || 'noun'}</span>
                    <span className="level-chip" style={getLevelRedStyle(level)}>{level}</span>
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

                <button
                  type="button"
                  className="secondary-button"
                  style={{ padding: '4px 8px', fontSize: '11px', height: '30px', gap: '4px' }}
                  onClick={() => setShowResetConfirmModal(true)}
                  title="Xóa tất cả từ hiện tại và trả về danh sách trống mới"
                >
                  <RefreshCw size={13} /> Làm mới
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  style={{ padding: '4px 8px', fontSize: '11px', height: '30px', gap: '4px' }}
                  onClick={() => addExcelRow(5)}
                >
                  <Plus size={13} /> Thêm 5 hàng
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
                  <strong>Hướng dẫn:</strong> Bạn cần nhập đủ 2 thông tin là <strong>WORD *</strong> và <strong>TYPE *</strong>. Hệ thống sẽ tự động tra cứu và điền đầy đủ các cột còn lại (biểu tượng <strong>⚡</strong>)!
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
                        placeholder="Nhập từ (e.g. raid)"
                        value={row.term}
                        onChange={(e) => handleExcelCellChange(idx, 'term', e.target.value)}
                      />

                      {/* TYPE */}
                      <select
                        className="excel-select type-cell"
                        style={{
                          ...getTypeStyle(row.partOfSpeech),
                          ...(row.term && row.term.trim() && !row.partOfSpeech
                            ? { border: '1.5px solid #f97316', background: '#fff7ed', color: '#c2410c', fontWeight: 700 }
                            : {}),
                        }}
                        value={row.partOfSpeech}
                        onChange={(e) => handleExcelCellChange(idx, 'partOfSpeech', e.target.value)}
                      >
                        <option value="">-- Chọn Type * --</option>
                        <option value="noun">noun</option>
                        <option value="verb">verb</option>
                        <option value="adjective">adjective</option>
                        <option value="adverb">adverb</option>
                        <option value="idiom">idiom</option>
                        <option value="phrasal verb">phrasal verb</option>
                      </select>

                      {/* LEVEL (READ-ONLY WITH RED INTENSITY ACCORDING TO DIFFICULTY) */}
                      <div className="excel-level-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            letterSpacing: '0.5px',
                            textAlign: 'center',
                            width: '100%',
                            boxSizing: 'border-box',
                            cursor: 'not-allowed',
                            userSelect: 'none',
                            ...getLevelRedStyle(row.level || '')
                          }}
                          title="Cấp độ CEFR tự động"
                        >
                          {row.level || '—'}
                        </span>
                      </div>

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

      {/* CUSTOM CONFIRMATION MODAL FOR RESET GRID */}
      {showResetConfirmModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowResetConfirmModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '420px', padding: '24px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#fff7ed',
                border: '1px solid #ffedd5',
                color: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Xác nhận làm mới danh sách?
            </h3>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '20px' }}>
              Tất cả dữ liệu từ vựng đang nhập dở trong bảng sẽ bị xóa và quay về danh sách trống mới. Thao tác này không thể hoàn tác.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
              <button
                type="button"
                className="secondary-button"
                style={{
                  flex: 1,
                  height: '38px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  justifyContent: 'center',
                }}
                onClick={() => setShowResetConfirmModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="primary-button"
                style={{
                  flex: 1,
                  height: '38px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  background: '#ef4444',
                  borderColor: '#dc2626',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => {
                  resetExcelGrid()
                  setShowResetConfirmModal(false)
                }}
              >
                Xác nhận làm mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INCOMPLETE ROWS WARNING MODAL */}
      {showIncompleteWarningModal && (
        <div className="modal-overlay" style={{ zIndex: 1150 }} onClick={() => setShowIncompleteWarningModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '440px', padding: '24px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Phát hiện từ chưa chọn Type (Loại từ)!
            </h3>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '20px' }}>
              Có <strong style={{ color: '#dc2626' }}>{skippedIncompleteCount} hàng</strong> đã nhập Word nhưng chưa chọn Type.
              Các hàng này sẽ <strong style={{ color: '#dc2626' }}>BỊ BỎ QUA</strong> khi lưu.
              {validRowsToSave.length > 0 ? (
                <span> Bạn có muốn tiếp tục lưu <strong>{validRowsToSave.length} từ</strong> đã chọn Type hợp lệ không?</span>
              ) : (
                <span> Vui lòng chọn Type cho ít nhất 1 từ trước khi lưu.</span>
              )}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  height: '42px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setShowIncompleteWarningModal(false)}
              >
                Quay lại chọn Type
              </button>
              {validRowsToSave.length > 0 && (
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: '42px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => handleSaveExcelBatch(undefined, true)}
                >
                  <Sparkles size={15} />
                  <span>Bỏ qua & Lưu {validRowsToSave.length} từ</span>
                </button>
              )}
            </div>
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

  const learningCount = data?.memoryStatus?.learning ?? data?.cardHealth?.learning ?? 0
  const youngCount = data?.memoryStatus?.reviewing ?? data?.cardHealth?.young ?? 0
  const matureCount = data?.memoryStatus?.mastered ?? data?.cardHealth?.mature ?? 0
  const newCount = data?.memoryStatus?.new ?? 0
  const totalCards = data?.totalCards ?? (learningCount + youngCount + matureCount + newCount)

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">THỐNG KÊ & PHÂN TÍCH</p>
          <h1>Phân tích tiến độ học tập</h1>
          <p className="subhead">Theo dõi tỷ lệ ghi nhớ, trạng thái trí nhớ và lịch sử luyện tập hàng ngày.</p>
        </div>
      </div>

      <div className="analytics-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <MetricCard
          icon={TrendingUp}
          label="Tỷ lệ ghi nhớ"
          value={data?.retentionRate || '100.0%'}
          detail={`Tính trên tổng ${data?.totalSessions || 0} lượt luyện tập`}
          tone="mint"
        />
        <MetricCard
          icon={Target}
          label="Tổng thẻ theo dõi"
          value={String(totalCards)}
          detail={`${data?.cardsDue || 0} thẻ đến hạn ôn hôm nay`}
          tone="blue"
        />
        <MetricCard
          icon={Zap}
          label="Chuỗi ngày học"
          value={`${data?.streak?.current || 0} ngày`}
          detail={`Kỷ lục: ${data?.streak?.longest || 0} ngày liên tiếp`}
          tone="purple"
        />
        <MetricCard
          icon={BookOpen}
          label="Hôm nay đã học"
          value={`${data?.reviewedToday || 0} từ`}
          detail="Từ vựng độc lập trong ngày"
          tone="orange"
        />
      </div>

      <div className="analytics-grid">
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">ĐỘ BỀN TRÍ NHỚ</p>
              <h3>Xu hướng duy trì trí nhớ</h3>
            </div>
            <span className="chart-key">
              <i /> Thống kê tiến độ ghi nhớ
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
            <svg viewBox="0 0 700 200" preserveAspectRatio="none" aria-label="Biểu đồ độ bền trí nhớ">
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
              <span>Tuần 1</span>
              <span>Tuần 2</span>
              <span>Tuần 3</span>
              <span>Tuần 4</span>
              <span>Hôm nay</span>
            </div>
          </div>
        </section>

        <section className="panel distribution-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">PHÂN BỔ TRÍ NHỚ</p>
              <h3>Giai đoạn ghi nhớ</h3>
            </div>
          </div>
          {[
            ['Từ mới', newCount, 'gray', 'Chưa học'],
            ['Đang học', learningCount, 'blue', 'Khoảng cách < 2 ngày'],
            ['Đang củng cố', youngCount, 'purple', 'Khoảng cách 2 - 30 ngày'],
            ['Thành thạo', matureCount, 'green', 'Khoảng cách ≥ 30 ngày'],
          ].map(([stageName, countVal, tone, subtext]) => {
            const numVal = Number(countVal)
            const percent = totalCards > 0 ? Math.round((numVal / totalCards) * 100) : 0
            const toneColor = tone === 'green' ? '#10b981' : tone === 'purple' ? '#8b5cf6' : tone === 'blue' ? '#3b82f6' : '#94a3b8'
            return (
              <div className="bar-item" key={String(stageName)} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {stageName} <small style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '4px' }}>({subtext})</small>
                  </span>
                  <b style={{ color: toneColor }}>{numVal} thẻ ({percent}%)</b>
                </div>
                <div className="bar" style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <i style={{ width: `${percent}%`, background: toneColor, height: '100%', display: 'block', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )
          })}
        </section>
      </div>

      <section className="panel history-panel" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">NHẬT KÝ LUYỆN TẬP GẦN ĐÂY</p>
            <h3>Lịch sử dịch câu & kiểm tra</h3>
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
                {log.isCorrect ? 'Chính xác' : 'Cần ôn lại'}
              </strong>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', color: '#64748b', textAlign: 'center', fontSize: '13.5px' }}>
            Chưa có lịch sử câu dịch nào được ghi nhận trong cơ sở dữ liệu.
          </div>
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

  // Theme & Auth Modals
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login')

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
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (savedTheme) {
        setTheme(savedTheme)
        if (savedTheme === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
        document.documentElement.classList.add('dark')
      }
    } catch (e) {}

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

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    try {
      localStorage.setItem('theme', nextTheme)
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (e) {}
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setUserNameInput('')
      setShowProfileModal(false)
      window.location.href = '/login'
    } catch (e) {}
  }

  const userInitials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : '?'

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

        <div className="sidebar-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="nav-item" onClick={() => setShowHelpModal(true)}>
            <CircleHelp size={18} />
            <span>Help center</span>
          </button>
          <button className="nav-item" onClick={() => setShowSettingsModal(true)}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          {user ? (
            <div
              className="sidebar-user"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowProfileModal(true)}
              title="Xem hồ sơ cá nhân"
            >
              <span className="avatar">{userInitials}</span>
              <span>
                <b>{user.name}</b>
                <small>{user.email || 'Student'}</small>
              </span>
              <MoreHorizontal size={17} />
            </div>
          ) : (
            <button
              className="auth-primary-btn"
              style={{ marginTop: '6px' }}
              onClick={() => {
                setAuthInitialTab('login')
                setShowAuthModal(true)
              }}
            >
              <LogIn size={16} />
              <span>Đăng nhập / Đăng ký</span>
            </button>
          )}
        </div>
      </aside>

      <div className="mobile-header">
        <div className="brand">
          <AppLogo />
          <span>
            lingua<span>flow</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
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

            <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <button className="icon-button" title="Tìm kiếm từ vựng" onClick={() => setShowSearchModal(true)}>
                <Search size={18} />
              </button>

              {user ? (
                <span
                  className="avatar"
                  style={{ cursor: 'pointer' }}
                  title="Hồ sơ cá nhân"
                  onClick={() => setShowProfileModal(true)}
                >
                  {userInitials}
                </span>
              ) : (
                <button
                  className="secondary-button"
                  style={{ padding: '5px 12px', fontSize: '12px' }}
                  onClick={() => {
                    setAuthInitialTab('login')
                    setShowAuthModal(true)
                  }}
                >
                  Đăng nhập
                </button>
              )}
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
              <h3 style={{ margin: 0 }}>{user?.name || 'Alex Lee'}</h3>
              <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px' }}>
                Học viên chính thức • LinguaFlow Member
              </span>
              <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0' }}>
                Email: {user?.email || 'alex.lee@linguaflow.app'}
              </p>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                className="secondary-button"
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                onClick={handleLogout}
              >
                <LogOut size={15} /> Đăng xuất
              </button>
              <button type="button" className="hero-action" onClick={() => { setShowProfileModal(false); setShowSettingsModal(true); }}>
                Cài đặt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData) => {
          setUser(userData)
          setUserNameInput(userData.name || '')
        }}
        initialTab={authInitialTab}
      />
    </main>
  )
}
