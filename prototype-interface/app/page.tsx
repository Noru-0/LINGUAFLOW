'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  ExternalLink,
  Flame,
  Globe,
  GraduationCap,
  GripVertical,
  Headphones,
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
  Sun,
  Moon,
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
  UserPlus,
  Mic,
  Layers,
  Shield,
} from 'lucide-react'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AuthModal } from '@/components/auth/AuthModal'
import { TotoroMascot } from '@/components/ui/TotoroMascot'
import { evaluateFillInBlank, buildHintPattern, firstLetterOf } from '@/lib/srs/dsr'
import { CollocationMatcher } from '@/components/collocation/CollocationMatcher'
import { SpeakingPractice } from '@/components/speaking/SpeakingPractice'

type View = 'Dashboard' | 'Review' | 'Translate' | 'Decks' | 'Analytics' | 'Resources' | 'Collocations' | 'Speaking'

const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Review', icon: Zap },
  { label: 'Translate', icon: BookOpen },
  { label: 'Collocations', icon: Layers },
  { label: 'Speaking', icon: Mic },
  { label: 'Decks', icon: Library },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Resources', icon: Globe },
]

function isDarkModeActive(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

function getTypeStyle(type: string, isDark?: boolean) {
  const t = (type || '').toLowerCase().trim()
  const dark = isDark !== undefined ? isDark : isDarkModeActive()
  if (dark) {
    if (!t) return { background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.4)', fontWeight: 600 }
    if (t === 'noun') return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.4)', fontWeight: 600 }
    if (t === 'verb') return { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', fontWeight: 600 }
    if (t === 'adjective') return { background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.4)', fontWeight: 600 }
    if (t === 'adverb') return { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.4)', fontWeight: 600 }
    return { background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', border: '1px solid rgba(253, 164, 175, 0.4)', fontWeight: 600 }
  }
  if (!t) return { background: '#eef2ff', color: '#4338ca', border: '1px solid #818cf8', fontWeight: 600 }
  if (t === 'noun') return { background: '#e0f2fe', color: '#0284c7', border: '1px solid #7dd3fc', fontWeight: 650 }
  if (t === 'verb') return { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 600 }
  if (t === 'adjective') return { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', fontWeight: 600 }
  if (t === 'adverb') return { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', fontWeight: 600 }
  return { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', fontWeight: 600 }
}

function getLevelRedStyle(level: string, isDark?: boolean) {
  const lvl = (level || '').toUpperCase().trim()
  const dark = isDark !== undefined ? isDark : isDarkModeActive()
  if (dark) {
    if (!lvl) return { background: '#1e293b', color: '#94a3b8', border: '1px dashed #475569', fontWeight: 400 }
    if (lvl === 'A1') return { background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(251, 113, 133, 0.3)', fontWeight: 600 }
    if (lvl === 'A2') return { background: 'rgba(244, 63, 94, 0.25)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.4)', fontWeight: 600 }
    if (lvl === 'B1') return { background: 'rgba(225, 29, 72, 0.35)', color: '#fda4af', border: '1px solid rgba(253, 164, 175, 0.5)', fontWeight: 700 }
    if (lvl === 'B2') return { background: 'rgba(190, 18, 60, 0.45)', color: '#fecdd3', border: '1px solid rgba(254, 205, 211, 0.6)', fontWeight: 700 }
    if (lvl === 'C1') return { background: '#be123c', color: '#ffffff', border: '1px solid #e11d48', fontWeight: 800 }
    if (lvl === 'C2') return { background: '#9f1239', color: '#ffffff', border: '1px solid #be123c', fontWeight: 800 }
    return { background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(251, 113, 133, 0.3)', fontWeight: 600 }
  }
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
let cachedDashboardMetrics: any = null

function Dashboard({ setView, user }: { setView: (view: View) => void; user: any }) {
  const [metrics, setMetrics] = useState<any>(cachedDashboardMetrics)
  const [loading, setLoading] = useState(!cachedDashboardMetrics)
  const [activityPeriod, setActivityPeriod] = useState('12m')
  const [heatTooltip, setHeatTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((data) => {
        cachedDashboardMetrics = data
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
            <MetricCard
              icon={Layers}
              label="Collocations"
              value={loading ? '...' : `${metrics?.collocationsMastered ?? 12} cụm`}
              detail="Cụm từ học thuật C1/C2"
              tone="green"
            />
            <MetricCard
              icon={Mic}
              label="Speaking AI"
              value={loading ? '...' : `${metrics?.speakingPracticedCount ?? 4} bài`}
              detail="Luyện phản xạ & AI chấm điểm"
              tone="purple"
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
              {[0, 1, 2, 3, 4].map((n) => (
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
  const [showEndConfirmModal, setShowEndConfirmModal] = useState<boolean>(false)

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

  // Auto-save session progress on state change (debounced 500ms to avoid blocking card switching)
  useEffect(() => {
    if (loading || activeBatchQueue.length === 0) return
    const timer = setTimeout(() => {
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
    }, 500)
    return () => clearTimeout(timer)
  }, [batchIndex, activeBatchQueue, batchCompletedCardIds, gradedCardIds, currentIndex, fullQueue, batches, hasStartedBatch, loading])

  // Asset preloading for upcoming cards (images & audio)
  useEffect(() => {
    if (!activeBatchQueue || activeBatchQueue.length === 0) return
    const nextCards = activeBatchQueue.slice(currentIndex + 1, currentIndex + 4)
    nextCards.forEach((card) => {
      if (card?.imageUrl) {
        const img = new Image()
        img.src = card.imageUrl
      }
      if (card?.audioUrl) {
        const audio = new Audio()
        audio.src = card.audioUrl
      }
    })
  }, [currentIndex, activeBatchQueue])

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

  const handleEndReviewSession = (confirmPrompt = true) => {
    if (confirmPrompt) {
      setShowEndConfirmModal(true)
      return
    }
    executeEndReviewSession()
  }

  const executeEndReviewSession = () => {
    setShowEndConfirmModal(false)
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch {}
    fetchQueue(false, true)
  }

  const renderConfirmModal = () => {
    if (!showEndConfirmModal) return null
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}
        onClick={() => setShowEndConfirmModal(false)}
      >
        <div
          style={{
            background: isDarkModeActive() ? '#1e293b' : '#ffffff',
            color: isDarkModeActive() ? '#f8fafc' : '#0f172a',
            borderRadius: '16px',
            padding: '24px 28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            border: isDarkModeActive() ? '1px solid #334155' : '1px solid #e2e8f0',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'grid',
                placeItems: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              ⚠️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Kết thúc phiên ôn tập?</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: isDarkModeActive() ? '#94a3b8' : '#64748b', lineHeight: 1.4 }}>
                Tiến trình phiên ôn tập hiện tại sẽ được reset và hệ thống sẽ nạp lại lượt học mới.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="secondary-button"
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '8px' }}
              onClick={() => setShowEndConfirmModal(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '8px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
              }}
              onClick={executeEndReviewSession}
            >
              Xác nhận kết thúc
            </button>
          </div>
        </div>
      </div>
    )
  }

  const advanceToNextCard = () => {
    resetCardState()
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

  const handleGrade = (rating: number) => {
    if (!currentCard) return

    const cardId = currentCard.cardId
    const isFirstRatingInSession = !gradedCardIds.has(cardId)

    // Optimistic UI update: record result and advance IMMEDIATELY (0ms delay)
    recordCardResult(rating)
    advanceToNextCard()

    if (isFirstRatingInSession) {
      setGradedCardIds((prev) => {
        const next = new Set(prev)
        next.add(cardId)
        return next
      })

      // Non-blocking background database update
      fetch('/api/srs/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          rating,
        }),
      }).catch((err) => {
        console.error('Error grading card in background:', err)
      })
    }
  }

  const handleFillSubmit = (gaveUp = false) => {
    if (!currentCard || fillResult) return

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - cardStartTime) / 1000))
    const evalRes = evaluateFillInBlank({
      userInput: fillInput,
      targetWord: currentCard.term,
      hintsUsedCount: gaveUp ? 3 : hintsUsedCount,
      elapsedSeconds,
      gaveUp,
    })

    const effectiveRating = evalRes.isCorrect ? Math.max(3, evalRes.rating) : evalRes.rating
    const cardId = currentCard.cardId
    const isFirstRatingInSession = !gradedCardIds.has(cardId)

    // State 2: Intra-batch in-memory RAM queue update (+1 progress if effectiveRating >= 3)
    recordCardResult(effectiveRating)

    setFillResult({
      isCorrect: evalRes.isCorrect,
      rating: effectiveRating,
    })

    if (evalRes.isCorrect) {
      playCardAudio()
    }

    if (isFirstRatingInSession) {
      setGradedCardIds((prev) => {
        const next = new Set(prev)
        next.add(cardId)
        return next
      })

      fetch('/api/srs/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          rating: effectiveRating,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const dsrData = data.dsr || data.newState
          if (dsrData) {
            setFillResult((prev) => (prev ? { ...prev, dsr: dsrData } : prev))
          }
        })
        .catch((err) => {
          console.error('Fill in blank submission background error:', err)
        })
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
      } else if (revealed) {
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
        {renderConfirmModal()}
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

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="secondary-button"
              style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '10px' }}
              onClick={() => setView('Dashboard')}
            >
              Về Trang Dashboard
            </button>

            <button
              type="button"
              className="secondary-button"
              style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '10px', color: '#ef4444', borderColor: '#fca5a5' }}
              onClick={() => handleEndReviewSession(true)}
            >
              Kết thúc & Reset phiên ôn
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
      {renderConfirmModal()}
      <div className="review-top">
        <div>
          <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            VOCABULARY REVIEW · {currentCard.deckTitle}
            {batches.length > 1 && (
              <span
                style={{
                  background: isDarkModeActive() ? 'rgba(99, 102, 241, 0.25)' : '#e0e7ff',
                  color: isDarkModeActive() ? '#a5b4fc' : '#4f46e5',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="review-count">
            <strong>{batchCompletedCardIds.size} / {totalBatchUniqueCount}</strong>
            <span>thành thạo đợt này</span>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => handleEndReviewSession(true)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Dừng phiên ôn tập và reset lại lượt học"
          >
            <X size={14} /> Dừng / Reset phiên ôn
          </button>
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
                    disabled={!revealed}
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
                  <span
                    className="type-chip"
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      ...getTypeStyle(currentCard.partOfSpeech),
                    }}
                  >
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

const TOPICS_BY_LEVEL: Record<string, { code: string; label: string }[]> = {
  ALL: [
    { code: 'ALL', label: '🌐 Tất cả chủ đề' },
    { code: 'Daily', label: '🏠 Daily Life & Routines' },
    { code: 'Travel', label: '✈️ Travel & Tourism' },
    { code: 'Work', label: '💼 Work & Career' },
    { code: 'Education', label: '🎓 Education & Technology' },
    { code: 'AI', label: '🤖 AI, Ethics & Society' },
  ],
  A2: [
    { code: 'ALL', label: '🌐 Tất cả chủ đề (A2)' },
    { code: 'Daily', label: '🏠 Daily Life & Family' },
    { code: 'Food', label: '🍲 Food & Cooking' },
    { code: 'Sports', label: '⚽ Sports & Fitness' },
  ],
  B1: [
    { code: 'ALL', label: '🌐 Tất cả chủ đề (B1)' },
    { code: 'Travel', label: '✈️ Travel & Tourism' },
    { code: 'Hometown', label: '🏡 Hometown & Living' },
    { code: 'Transport', label: '🚌 Transport & Traffic' },
  ],
  B2: [
    { code: 'ALL', label: '🌐 Tất cả chủ đề (B2)' },
    { code: 'Work', label: '💼 Work & Career' },
    { code: 'Education', label: '🎓 Education & Schooling' },
    { code: 'Environment', label: '🌿 Environment & Green Living' },
    { code: 'Technology', label: '📱 Modern Technology' },
  ],
  C1: [
    { code: 'ALL', label: '🌐 Tất cả chủ đề (C1)' },
    { code: 'Education', label: '🎓 AI & Higher Education' },
    { code: 'Economy', label: '📈 Global Economy & Trade' },
    { code: 'Crime', label: '⚖️ Crime & Law Enforcement' },
  ],
  C2: [
    { code: 'ALL', label: '🌐 Tất cả chủ đề (C2)' },
    { code: 'AI', label: '🤖 Automation & Ethics' },
    { code: 'Philosophy', label: '🧠 Philosophy & Society' },
    { code: 'Science', label: '🚀 Space & Science' },
  ],
}

const SENTENCE_PATTERNS = [
  { code: 'ALL', label: '🌐 Tất cả dạng câu', color: '#64748b' },
  { code: 'Core', label: '1. Khung 5 cấu trúc cơ bản', color: '#16a34a' },
  { code: 'Passive', label: '2. Bị động & Bị động khách quan', color: '#2563eb' },
  { code: 'Causative', label: '3. Thể nhờ vả & Thể tồn tại', color: '#0891b2' },
  { code: 'Gerund', label: '4. Danh động từ & V-ing', color: '#7c3aed' },
  { code: 'Participle', label: '5. Cụm phân từ rút gọn', color: '#d97706' },
  { code: 'Cleft', label: '6. Câu chẻ & Đảo ngữ', color: '#dc2626' },
  { code: 'Conditionals', label: '7. Câu điều kiện & Giả định', color: '#e11d48' },
  { code: 'Reported', label: '8. Câu gián tiếp / Tường thuật', color: '#4f46e5' },
  { code: 'Relative', label: '9. Mệnh đề quan hệ', color: '#059669' },
  { code: 'Adverbial', label: '10. Mệnh đề trạng ngữ logic', color: '#b45309' },
]

// ----------------------------------------------------
// Translate View (Bilingual Drills & IELTS Paragraph Translation)
// ----------------------------------------------------
function Translate({ setView }: { setView: (view: View) => void }) {
  const [activeTab, setActiveTab] = useState<'sentence' | 'paragraph'>('paragraph')
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('ALL')
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL')
  const [selectedPattern, setSelectedPattern] = useState<string>('ALL')
  const [showCollocations, setShowCollocations] = useState<boolean>(false)
  const [streakCount, setStreakCount] = useState(0)

  // Split-pane layout resizer state
  const [leftPanePercent, setLeftPanePercent] = useState<number>(50)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const layoutRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !layoutRef.current) return
      const rect = layoutRef.current.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const percent = (offsetX / rect.width) * 100
      const clamped = Math.min(Math.max(percent, 25), 75)
      setLeftPanePercent(clamped)
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Sentence Mode State
  const [prompts, setPrompts] = useState<any[]>([])
  const [completedPromptIds, setCompletedPromptIds] = useState<Set<string>>(new Set())
  const [activePromptId, setActivePromptId] = useState<string | null>(null)
  const [promptIndex, setPromptIndex] = useState(0)
  const [userSubmission, setUserSubmission] = useState('')
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loadingSentence, setLoadingSentence] = useState(true)
  const [submittingSentence, setSubmittingSentence] = useState(false)
  const [sentenceSubmitError, setSentenceSubmitError] = useState<string | null>(null)
  const [sentenceRetryCount, setSentenceRetryCount] = useState<number>(0)

  // Paragraph Mode State
  const [paragraphPrompts, setParagraphPrompts] = useState<any[]>([])
  const [completedParagraphIds, setCompletedParagraphIds] = useState<Set<string>>(new Set())
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null)
  const [paragraphIndex, setParagraphIndex] = useState(0)
  const [userParagraphSubmission, setUserParagraphSubmission] = useState('')
  const [paragraphEvaluation, setParagraphEvaluation] = useState<any>(null)
  const [modelParagraph, setModelParagraph] = useState<any>(null)
  const [loadingParagraph, setLoadingParagraph] = useState(true)
  const [submittingParagraph, setSubmittingParagraph] = useState(false)
  const [paragraphSubmitError, setParagraphSubmitError] = useState<string | null>(null)
  const [paragraphRetryCount, setParagraphRetryCount] = useState<number>(0)
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false)
  const [isGeneratingWeeklySentence, setIsGeneratingWeeklySentence] = useState(false)
  const [weeklyIngestMsg, setWeeklyIngestMsg] = useState<string | null>(null)

  useEffect(() => {
    // Fetch sentence prompts
    fetch('/api/translate/prompt')
      .then((res) => res.json())
      .then((data) => {
        const fetchedPrompts = data.prompts || []
        setPrompts(fetchedPrompts)
        const done = new Set<string>(data.completedPromptIds || [])
        setCompletedPromptIds(done)
        const firstUncompleted = fetchedPrompts.find((p: any) => !done.has(p.id))
        if (firstUncompleted) {
          setActivePromptId(firstUncompleted.id)
        } else if (fetchedPrompts[0]) {
          setActivePromptId(fetchedPrompts[0].id)
        }
        setLoadingSentence(false)
      })
      .catch(() => setLoadingSentence(false))

    // Fetch paragraph prompts
    fetch('/api/translate/paragraph/prompt')
      .then((res) => res.json())
      .then((data) => {
        const fetchedParagraphs = data.paragraphs || []
        setParagraphPrompts(fetchedParagraphs)
        const done = new Set<string>(data.completedParagraphIds || [])
        setCompletedParagraphIds(done)
        const firstUncompleted = fetchedParagraphs.find((p: any) => !done.has(p.id))
        if (firstUncompleted) {
          setActiveParagraphId(firstUncompleted.id)
        } else if (fetchedParagraphs[0]) {
          setActiveParagraphId(fetchedParagraphs[0].id)
        }
        setLoadingParagraph(false)
      })
      .catch(() => setLoadingParagraph(false))

    // Fetch streak analytics
    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((data) => setStreakCount(data?.streak?.current || 0))
      .catch(() => {})
  }, [])

  // Filter queues by selected level and topic / pattern (retaining active prompt while viewing)
  const filteredPrompts = prompts.filter((p) => {
    const matchLevel =
      selectedLevel === 'ALL' ||
      (p.difficulty || '').toUpperCase() === selectedLevel.toUpperCase()
    const matchPattern =
      selectedPattern === 'ALL' ||
      (p.grammarCategory || '').toLowerCase().includes(selectedPattern.toLowerCase()) ||
      (p.grammarNotes || '').toLowerCase().includes(selectedPattern.toLowerCase())
    const isUncompletedOrActive = !completedPromptIds.has(p.id) || p.id === activePromptId
    return matchLevel && matchPattern && isUncompletedOrActive
  })

  const filteredParagraphs = paragraphPrompts.filter((p) => {
    const matchLevel = selectedLevel === 'ALL' || (p.targetBand || '').toUpperCase() === selectedLevel
    const matchTopic =
      selectedTopic === 'ALL' ||
      (p.themeCategory || '').toLowerCase().includes(selectedTopic.toLowerCase()) ||
      (p.subTopic || '').toLowerCase().includes(selectedTopic.toLowerCase())
    const isUncompletedOrActive = !completedParagraphIds.has(p.id) || p.id === activeParagraphId
    return matchLevel && matchTopic && isUncompletedOrActive
  })

  const currentPrompt =
    (activePromptId ? filteredPrompts.find((p) => p.id === activePromptId) : null) ||
    filteredPrompts.find((p) => !completedPromptIds.has(p.id)) ||
    filteredPrompts[0] ||
    null

  const currentParagraph =
    (activeParagraphId ? filteredParagraphs.find((p) => p.id === activeParagraphId) : null) ||
    filteredParagraphs.find((p) => !completedParagraphIds.has(p.id)) ||
    filteredParagraphs[0] ||
    null

  // Sync active IDs on load or filter change
  useEffect(() => {
    if (!activePromptId && currentPrompt?.id) {
      setActivePromptId(currentPrompt.id)
    }
  }, [currentPrompt, activePromptId])

  useEffect(() => {
    if (!activeParagraphId && currentParagraph?.id) {
      setActiveParagraphId(currentParagraph.id)
    }
  }, [currentParagraph, activeParagraphId])

  // Sentence Submit
  const handleSentenceSubmit = async () => {
    if (!currentPrompt || !userSubmission.trim() || submittingSentence) return
    if (sentenceSubmitError && sentenceRetryCount >= 1) return

    setSubmittingSentence(true)
    const isRetry = sentenceSubmitError !== null

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

      if (!res.ok || data.error || !data.evaluation) {
        throw new Error(data.error || 'LLM AI chưa phản hồi hoặc phản hồi lỗi.')
      }

      setEvaluation(data.evaluation)
      setSentenceSubmitError(null)
      setSentenceRetryCount(0)
      if (currentPrompt?.id) {
        setActivePromptId(currentPrompt.id)
        setCompletedPromptIds((prev) => new Set([...Array.from(prev), currentPrompt.id]))
      }
    } catch (err: any) {
      console.error('Translation sentence error:', err)
      setSentenceSubmitError(err?.message || 'Có lỗi xảy ra khi chấm AI.')
      if (isRetry) {
        setSentenceRetryCount(1)
      }
    } finally {
      setSubmittingSentence(false)
    }
  }

  const handleNextSentence = () => {
    setEvaluation(null)
    setUserSubmission('')
    setSentenceSubmitError(null)
    setSentenceRetryCount(0)
    const uncompletedList = filteredPrompts.filter((p) => !completedPromptIds.has(p.id))
    if (uncompletedList.length > 0) {
      const currIdx = uncompletedList.findIndex((p) => p.id === activePromptId)
      const nextIdx = currIdx >= 0 && currIdx + 1 < uncompletedList.length ? currIdx + 1 : 0
      setActivePromptId(uncompletedList[nextIdx].id)
    } else {
      const currIdx = filteredPrompts.findIndex((p) => p.id === activePromptId)
      const nextIdx = currIdx >= 0 && currIdx + 1 < filteredPrompts.length ? currIdx + 1 : 0
      if (filteredPrompts[nextIdx]) {
        setActivePromptId(filteredPrompts[nextIdx].id)
      }
    }
  }

  // Paragraph Submit
  const handleParagraphSubmit = async () => {
    if (!currentParagraph || !userParagraphSubmission.trim() || submittingParagraph) return
    if (paragraphSubmitError && paragraphRetryCount >= 1) return

    setSubmittingParagraph(true)
    const isRetry = paragraphSubmitError !== null

    try {
      const res = await fetch('/api/translate/paragraph/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paragraphId: currentParagraph.id,
          userTranslation: userParagraphSubmission,
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error || !data.evaluation) {
        throw new Error(data.error || 'LLM AI chưa phản hồi hoặc phản hồi lỗi.')
      }

      setParagraphEvaluation(data.evaluation)
      setModelParagraph(data.modelParagraph)
      setParagraphSubmitError(null)
      setParagraphRetryCount(0)
      if (currentParagraph?.id) {
        setActiveParagraphId(currentParagraph.id)
        setCompletedParagraphIds((prev) => new Set([...Array.from(prev), currentParagraph.id]))
      }
    } catch (err: any) {
      console.error('Paragraph translation error:', err)
      setParagraphSubmitError(err?.message || 'Có lỗi xảy ra khi chấm AI.')
      if (isRetry) {
        setParagraphRetryCount(1)
      }
    } finally {
      setSubmittingParagraph(false)
    }
  }

  const handleNextParagraph = () => {
    setParagraphEvaluation(null)
    setModelParagraph(null)
    setUserParagraphSubmission('')
    setParagraphSubmitError(null)
    setParagraphRetryCount(0)
    const uncompletedList = filteredParagraphs.filter((p) => !completedParagraphIds.has(p.id))
    if (uncompletedList.length > 0) {
      const currIdx = uncompletedList.findIndex((p) => p.id === activeParagraphId)
      const nextIdx = currIdx >= 0 && currIdx + 1 < uncompletedList.length ? currIdx + 1 : 0
      setActiveParagraphId(uncompletedList[nextIdx].id)
    } else {
      const currIdx = filteredParagraphs.findIndex((p) => p.id === activeParagraphId)
      const nextIdx = currIdx >= 0 && currIdx + 1 < filteredParagraphs.length ? currIdx + 1 : 0
      if (filteredParagraphs[nextIdx]) {
        setActiveParagraphId(filteredParagraphs[nextIdx].id)
      }
    }
  }

  // Weekly Ingestion Handler
  const handleGenerateWeeklyBatch = async () => {
    if (isGeneratingWeekly) return
    setIsGeneratingWeekly(true)
    setWeeklyIngestMsg(null)

    try {
      const res = await fetch('/api/translate/paragraph/generate-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 25 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tự động tạo bài mới')

      setWeeklyIngestMsg(data.message)

      // Refetch paragraphs
      const promptRes = await fetch('/api/translate/paragraph/prompt')
      const promptData = await promptRes.json()
      if (promptData.paragraphs) {
        setParagraphPrompts(promptData.paragraphs)
      }
    } catch (err: any) {
      setWeeklyIngestMsg(`⚠️ ${err?.message || 'Không thể tạo bài mới.'}`)
    } finally {
      setIsGeneratingWeekly(false)
    }
  }

  // Weekly Sentence Ingestion Handler
  const handleGenerateWeeklySentenceBatch = async () => {
    if (isGeneratingWeeklySentence) return
    setIsGeneratingWeeklySentence(true)
    setWeeklyIngestMsg(null)

    try {
      const res = await fetch('/api/translate/sentence/generate-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 30 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tự động tạo câu mới')

      setWeeklyIngestMsg(data.message)

      // Refetch sentence prompts
      const promptRes = await fetch('/api/translate/prompt')
      const promptData = await promptRes.json()
      if (promptData.prompts) {
        setPrompts(promptData.prompts)
      }
    } catch (err: any) {
      setWeeklyIngestMsg(`⚠️ ${err?.message || 'Không thể tạo câu mới.'}`)
    } finally {
      setIsGeneratingWeeklySentence(false)
    }
  }

  const getLevelBadge = (lvl?: string) => {
    const code = (lvl || 'B2').toUpperCase()
    if (code === 'A2') return { label: 'A2 · Elementary', class: 'green-tag' }
    if (code === 'B1') return { label: 'B1 · Intermediate', class: 'blue-tag' }
    if (code === 'B2') return { label: 'B2 · Vantage', class: 'purple-tag' }
    if (code === 'C1') return { label: 'C1 · Effective', class: 'rose-tag' }
    if (code === 'C2') return { label: 'C2 · Mastery', class: 'gold-tag' }
    return { label: code, class: 'purple-tag' }
  }

  const isLoading = activeTab === 'sentence' ? loadingSentence : loadingParagraph

  if (isLoading) {
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
          <p className="eyebrow">GRAMMAR & WRITING WORKOUT</p>
          <h1>Luyện Dịch & Chấm Điểm AI</h1>
          <p className="subhead">
            {activeTab === 'paragraph'
              ? 'Lựa chọn bài tập đoạn văn theo trình độ cá nhân từ A2 đến C2.'
              : 'Lựa chọn bài tập câu đơn kết hợp giữa trình độ (A2 - C2) và dạng cấu trúc ngữ pháp.'}
          </p>
        </div>
        <div className="streak-chip">
          <Flame size={17} /> {streakCount} day streak
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mode-switcher-container" style={{ marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => {
            setActiveTab('paragraph')
            setParagraphIndex(0)
            setParagraphEvaluation(null)
          }}
          className={`mode-switcher-tab ${activeTab === 'paragraph' ? 'active' : ''}`}
        >
          <BookOpen size={15} /> 📝 Đoạn văn IELTS (AI Evaluator)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('sentence')
            setPromptIndex(0)
            setEvaluation(null)
          }}
          className={`mode-switcher-tab ${activeTab === 'sentence' ? 'active' : ''}`}
        >
          <Zap size={15} /> ⚡ Câu đơn (Sentence Drills)
        </button>
      </div>

      {/* Level / Pattern Filter Bar */}
      <div className="level-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        {activeTab === 'paragraph' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
              <span className="level-filter-label">Trình độ cá nhân:</span>
              {[
                { code: 'ALL', label: 'Tất cả (All Levels)', color: '#64748b' },
                { code: 'A2', label: 'A2 · Cơ bản', color: '#16a34a' },
                { code: 'B1', label: 'B1 · Trung cấp', color: '#2563eb' },
                { code: 'B2', label: 'B2 · IELTS 6.0', color: '#7c3aed' },
                { code: 'C1', label: 'C1 · IELTS 7.5', color: '#e11d48' },
                { code: 'C2', label: 'C2 · Thành thạo', color: '#d97706' },
              ].map((lvl) => (
                <button
                  key={lvl.code}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(lvl.code as any)
                    setSelectedTopic('ALL')
                    setActiveParagraphId(null)
                    setParagraphIndex(0)
                    setParagraphEvaluation(null)
                    setModelParagraph(null)
                    setUserParagraphSubmission('')
                    setParagraphSubmitError(null)
                    setParagraphRetryCount(0)
                  }}
                  className={`level-pill-btn ${selectedLevel === lvl.code ? 'active' : ''}`}
                  style={{
                    borderColor: selectedLevel === lvl.code ? lvl.color : '#e2e8f0',
                    color: selectedLevel === lvl.code ? lvl.color : '#64748b',
                    backgroundColor: selectedLevel === lvl.code ? `${lvl.color}15` : '#ffffff',
                    fontWeight: selectedLevel === lvl.code ? 700 : 500,
                  }}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* Topic Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="level-filter-label">Chủ đề:</span>
              <select
                className="topic-dropdown-select"
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value)
                  setActiveParagraphId(null)
                  setParagraphIndex(0)
                  setParagraphEvaluation(null)
                  setModelParagraph(null)
                  setUserParagraphSubmission('')
                  setParagraphSubmitError(null)
                  setParagraphRetryCount(0)
                }}
              >
                {(TOPICS_BY_LEVEL[selectedLevel] || TOPICS_BY_LEVEL['ALL']).map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Level Filter Pills for Sentence Mode */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                <span className="level-filter-label">Trình độ:</span>
                {[
                  { code: 'ALL', label: 'Tất cả trình độ', color: '#64748b' },
                  { code: 'A2', label: 'A2 · Cơ bản', color: '#16a34a' },
                  { code: 'B1', label: 'B1 · Trung cấp', color: '#2563eb' },
                  { code: 'B2', label: 'B2 · IELTS 6.0', color: '#7c3aed' },
                  { code: 'C1', label: 'C1 · IELTS 7.5', color: '#e11d48' },
                  { code: 'C2', label: 'C2 · Thành thạo', color: '#d97706' },
                ].map((lvl) => (
                  <button
                    key={lvl.code}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(lvl.code as any)
                      setActivePromptId(null)
                      setPromptIndex(0)
                      setEvaluation(null)
                      setUserSubmission('')
                      setSentenceSubmitError(null)
                      setSentenceRetryCount(0)
                    }}
                    className={`level-pill-btn ${selectedLevel === lvl.code ? 'active' : ''}`}
                    style={{
                      borderColor: selectedLevel === lvl.code ? lvl.color : '#e2e8f0',
                      color: selectedLevel === lvl.code ? lvl.color : '#64748b',
                      backgroundColor: selectedLevel === lvl.code ? `${lvl.color}15` : '#ffffff',
                      fontWeight: selectedLevel === lvl.code ? 700 : 500,
                    }}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              {/* Pattern Selector Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="level-filter-label">Cấu trúc:</span>
                <select
                  className="topic-dropdown-select"
                  value={selectedPattern}
                  onChange={(e) => {
                    setSelectedPattern(e.target.value)
                    setActivePromptId(null)
                    setPromptIndex(0)
                    setEvaluation(null)
                    setUserSubmission('')
                    setSentenceSubmitError(null)
                    setSentenceRetryCount(0)
                  }}
                >
                  {SENTENCE_PATTERNS.map((pat) => (
                    <option key={pat.code} value={pat.code}>
                      {pat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pattern Quick Pills Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span className="level-filter-label" style={{ fontSize: '11px', opacity: 0.8 }}>Dạng cấu trúc:</span>
              {SENTENCE_PATTERNS.map((pat) => (
                <button
                  key={pat.code}
                  type="button"
                  onClick={() => {
                    setSelectedPattern(pat.code)
                    setActivePromptId(null)
                    setPromptIndex(0)
                    setEvaluation(null)
                    setUserSubmission('')
                    setSentenceSubmitError(null)
                    setSentenceRetryCount(0)
                  }}
                  className={`level-pill-btn ${selectedPattern === pat.code ? 'active' : ''}`}
                  style={{
                    fontSize: '11px',
                    padding: '3px 9px',
                    borderColor: selectedPattern === pat.code ? pat.color : '#e2e8f0',
                    color: selectedPattern === pat.code ? pat.color : '#64748b',
                    backgroundColor: selectedPattern === pat.code ? `${pat.color}15` : '#ffffff',
                    fontWeight: selectedPattern === pat.code ? 700 : 500,
                  }}
                >
                  {pat.label}
                </button>
              ))}
            </div>
          </div>
        )}


      </div>

      {weeklyIngestMsg && (
        <div
          style={{
            margin: '0 0 16px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#059669',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>✨ {weeklyIngestMsg}</span>
          <button
            onClick={() => setWeeklyIngestMsg(null)}
            style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* MODE 1: IELTS PARAGRAPH TRANSLATION */}
      {activeTab === 'paragraph' && (
        <div
          ref={layoutRef}
          className="translate-paragraph-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: `calc(${leftPanePercent}% - 8px) 16px calc(${100 - leftPanePercent}% - 8px)`,
            gap: '0',
            alignItems: 'start',
          }}
        >
          {filteredParagraphs.length > 0 && currentParagraph ? (
            <section className="prompt-card paragraph-prompt-card">
              <div className="prompt-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="tag purple-tag">{currentParagraph?.themeCategory || 'IELTS ACADEMIC'}</span>
                  <span className={`tag ${getLevelBadge(currentParagraph?.targetBand).class}`}>
                    {getLevelBadge(currentParagraph?.targetBand).label}
                  </span>
                  <span className="prompt-number">
                    Đề {paragraphIndex + 1} / {filteredParagraphs.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextParagraph}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    fontSize: '12.5px',
                    fontWeight: 650,
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    color: '#4f46e5',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Chuyển sang đề/đoạn văn khác"
                >
                  <RefreshCw size={13} /> Đổi bài
                </button>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '12px 0 6px', color: '#4f46e5' }}>
                {currentParagraph?.subTopic || 'IELTS Writing Topic'}
              </h2>

              <p className="eyebrow" style={{ marginTop: '8px' }}>ĐOẠN VĂN TIẾNG VIỆT GỐC (3–5 CÂU)</p>
              <div className="paragraph-vietnamese-box">
                <p>{currentParagraph?.vietnameseParagraph || 'Đang tải đề bài...'}</p>
              </div>

              {/* Target IELTS Collocations Hints (Collapsible, default collapsed) */}
              {currentParagraph?.targetCollocations && currentParagraph.targetCollocations.length > 0 && (
                <div className="collocations-hint-box">
                  <button
                    type="button"
                    className="collocations-toggle-btn"
                    onClick={() => setShowCollocations(!showCollocations)}
                  >
                    <span>
                      💡 IELTS Collocations gợi ý ({currentParagraph.targetCollocations.length} cụm từ)
                    </span>
                    {showCollocations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showCollocations && (
                    <div className="collocation-chips" style={{ marginTop: '8px' }}>
                      {currentParagraph.targetCollocations.map((c: any, idx: number) => (
                        <span key={idx} className="collocation-chip" title={c.meaning}>
                          <b>{c.term}</b> ({c.meaning})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="answer-area" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="paragraphTranslation" style={{ fontWeight: 700, fontSize: '14px' }}>Bản dịch tiếng Anh của bạn</label>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    {userParagraphSubmission.trim().split(/\s+/).filter(Boolean).length} từ · {userParagraphSubmission.length} ký tự
                  </span>
                </div>
                <textarea
                  id="paragraphTranslation"
                  rows={6}
                  placeholder="Nhập bản dịch tiếng Anh của bạn tại đây (sử dụng câu phức, liên từ nối và collocations gợi ý)..."
                  value={userParagraphSubmission}
                  onChange={(e) => setUserParagraphSubmission(e.target.value)}
                />
                {paragraphSubmitError && (
                  <div
                    className="submit-error-banner"
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#ef4444',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>
                      {paragraphRetryCount >= 1
                        ? '⚠️ Đã thử chấm lại 1 lần cho bài này nhưng hệ thống AI vẫn không phản hồi. Vui lòng chuyển bài tiếp theo hoặc thử lại sau.'
                        : `⚠️ Hệ thống AI phản hồi lỗi: ${paragraphSubmitError}. Bạn có thể bấm "Chấm lại AI" bên dưới (cho phép tối đa 1 lượt).`}
                    </span>
                  </div>
                )}
                <div className="answer-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} /> Phân tích bằng DeepSeek v4 Flash
                  </span>
                  <button
                    className="hero-action"
                    disabled={
                      submittingParagraph ||
                      !userParagraphSubmission.trim() ||
                      paragraphEvaluation !== null ||
                      (paragraphSubmitError !== null && paragraphRetryCount >= 1)
                    }
                    onClick={handleParagraphSubmit}
                    style={
                      paragraphEvaluation !== null
                        ? {
                            backgroundColor: '#94a3b8',
                            borderColor: '#cbd5e1',
                            cursor: 'not-allowed',
                          }
                        : paragraphSubmitError
                        ? {
                            backgroundColor: paragraphRetryCount >= 1 ? '#94a3b8' : '#f59e0b',
                            borderColor: paragraphRetryCount >= 1 ? '#cbd5e1' : '#d97706',
                          }
                        : undefined
                    }
                  >
                    {submittingParagraph ? (
                      <>
                        <Loader2 className="animate-spin" size={16} /> {paragraphSubmitError ? 'Đang chấm lại AI...' : 'Đang chấm điểm...'}
                      </>
                    ) : paragraphSubmitError ? (
                      paragraphRetryCount >= 1 ? (
                        <>
                          Đã thử chấm lại (1/1) <RefreshCw size={16} />
                        </>
                      ) : (
                        <>
                          Chấm lại AI (Còn 1 lượt) <RefreshCw size={16} />
                        </>
                      )
                    ) : (
                      <>
                        Nộp bài & Chấm điểm <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <div className="prompt-card paragraph-prompt-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CircleHelp size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3>Chưa có bài tập cho trình độ {selectedLevel} {selectedTopic !== 'ALL' ? `· Chủ đề ${selectedTopic}` : ''}</h3>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0 16px' }}>
                Bạn có thể chọn trình độ hoặc chủ đề khác, hoặc nhấn xem tất cả đề bài.
              </p>
              <button
                className="hero-action"
                onClick={() => {
                  setSelectedLevel('ALL')
                  setSelectedTopic('ALL')
                }}
                style={{ margin: '0 auto' }}
              >
                Xem tất cả bài tập
              </button>
            </div>
          )}

          {/* Draggable Split Resizer Bar */}
          <div
            className={`split-resizer ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            title="Kéo sang trái hoặc phải để điều chỉnh kích thước khung"
          >
            <div className="resizer-handle-pill">
              <GripVertical size={14} />
            </div>
          </div>

          {/* AI EVALUATION & FEEDBACK PANEL */}
          <aside className={`feedback-card paragraph-feedback-card ${paragraphEvaluation ? 'visible' : ''}`}>
            {paragraphEvaluation ? (
              <div className="paragraph-feedback-content">
                {/* Overall Feedback Header */}
                <div className="feedback-header-box">
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 750, margin: 0 }}>Đánh Giá Tổng Quan</h3>
                    <p style={{ fontSize: '13.5px', marginTop: '4px', opacity: 0.9 }}>
                      {paragraphEvaluation.overallFeedback}
                    </p>
                  </div>
                </div>

                {/* 1. Grammar Errors Table */}
                {paragraphEvaluation.grammarErrors && paragraphEvaluation.grammarErrors.length > 0 && (
                  <div className="evaluation-section">
                    <h4>⚠️ Bảng Sửa Lỗi Ngữ Pháp & Dùng Từ ({paragraphEvaluation.grammarErrors.length})</h4>
                    <div className="errors-table-container">
                      <table className="eval-table">
                        <thead>
                          <tr>
                            <th>Đoạn bị lỗi</th>
                            <th>Gợi ý sửa</th>
                            <th>Giải thích ngữ pháp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paragraphEvaluation.grammarErrors.map((err: any, idx: number) => (
                            <tr key={idx}>
                              <td className="orig-cell">{err.originalSegment}</td>
                              <td className="corr-cell">{err.correction}</td>
                              <td className="expl-cell">{err.ruleExplanation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. Actionable Grammar Improvement Suggestions */}
                {paragraphEvaluation.grammarSuggestions && paragraphEvaluation.grammarSuggestions.length > 0 && (
                  <div className="evaluation-section">
                    <h4>💡 Gợi Ý Cải Thiện Cấu Trúc Ngữ Pháp (Nâng Band Score)</h4>
                    <div className="suggestions-list">
                      {paragraphEvaluation.grammarSuggestions.map((sug: any, idx: number) => (
                        <div key={idx} className="suggestion-card">
                          <div className="sug-header">
                            <span className="sug-point">📌 {sug.point}</span>
                          </div>
                          <p className="sug-text">{sug.suggestion}</p>
                          {sug.example && (
                            <div className="sug-example">
                              <b>Ví dụ áp dụng:</b> <code>{sug.example}</code>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Academic Upgrades */}
                {paragraphEvaluation.betterAlternatives && paragraphEvaluation.betterAlternatives.length > 0 && (
                  <div className="evaluation-section">
                    <h4>🚀 Gợi Ý Nâng Cấp Từ Vựng IELTS</h4>
                    <div className="upgrades-list">
                      {paragraphEvaluation.betterAlternatives.map((upg: any, idx: number) => (
                        <div key={idx} className="upgrade-card">
                          <div className="upg-terms">
                            <span className="orig-term">{upg.original}</span>
                            <ArrowRight size={14} />
                            <span className="upg-term">{upg.academicUpgrade}</span>
                          </div>
                          <p className="upg-reason">{upg.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Model Paragraph Band 8.0+ */}
                {modelParagraph && (
                  <div className="evaluation-section model-section">
                    <h4>✨ Bài Dịch Mẫu Tham Khảo (Band 8.0+)</h4>
                    <div className="model-paragraph-box">
                      <p>{modelParagraph.text}</p>
                    </div>
                    {modelParagraph.grammarBreakdown && (
                      <div className="breakdown-box">
                        <b>Cấu trúc ngữ pháp đắt giá trong bài mẫu:</b>
                        <pre>{modelParagraph.grammarBreakdown}</pre>
                      </div>
                    )}
                  </div>
                )}

                <button className="next-button" onClick={handleNextParagraph} style={{ marginTop: '16px', width: '100%' }}>
                  Chuyển sang đoạn văn tiếp theo <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="paragraph-feedback-placeholder">
                <div className="placeholder-icon">
                  <Sparkles size={32} style={{ color: '#4f46e5' }} />
                </div>
                <h3>Khung Kết Quả Chấm AI</h3>
                <p>
                  Nhập bản dịch tiếng Anh của bạn ở khung bài tập bên trái và bấm <strong>"Nộp bài & Chấm điểm"</strong> để DeepSeek v4 Flash AI đánh giá band điểm, phát hiện lỗi sai và nhận bài mẫu Band 8.0+.
                </p>
                <div className="placeholder-features">
                  <div className="placeholder-chip">✨ Đánh giá Band CEFR (A2–C2)</div>
                  <div className="placeholder-chip">⚠️ Sửa lỗi ngữ pháp & từ vựng</div>
                  <div className="placeholder-chip">🚀 Gợi ý nâng cấp từ vựng Academic</div>
                  <div className="placeholder-chip">🏆 Đoạn văn mẫu IELTS Band 8.0+</div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* MODE 2: SINGLE SENTENCE DRILLS */}
      {activeTab === 'sentence' && (
        <div
          ref={layoutRef}
          className="translate-sentence-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: `calc(${leftPanePercent}% - 8px) 16px calc(${100 - leftPanePercent}% - 8px)`,
            gap: '0',
            alignItems: 'start',
          }}
        >
          {filteredPrompts.length > 0 && currentPrompt ? (
            <section className="prompt-card sentence-prompt-card">
              <div className="prompt-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="tag purple-tag">{currentPrompt?.grammarCategory || 'GRAMMAR'}</span>
                  <span className={`tag ${getLevelBadge(currentPrompt?.difficulty).class}`}>
                    {getLevelBadge(currentPrompt?.difficulty).label}
                  </span>
                  <span className="prompt-number">
                    Câu {promptIndex + 1} / {filteredPrompts.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextSentence}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    fontSize: '12.5px',
                    fontWeight: 650,
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    color: '#4f46e5',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Chuyển sang câu khác"
                >
                  <RefreshCw size={13} /> Đổi câu
                </button>
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
                      handleSentenceSubmit()
                    }
                  }}
                />
                {sentenceSubmitError && (
                  <div
                    className="submit-error-banner"
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#ef4444',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>
                      {sentenceRetryCount >= 1
                        ? '⚠️ Đã thử chấm lại 1 lần cho câu này. Vui lòng chuyển bài tiếp theo hoặc thử lại sau.'
                        : `⚠️ Hệ thống AI phản hồi lỗi: ${sentenceSubmitError}. Bấm "Chấm lại AI" (cho phép 1 lượt).`}
                    </span>
                  </div>
                )}
                <div className="answer-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Keyboard size={14} /> Press Enter to submit
                  </span>
                  <button
                    className="hero-action"
                    disabled={
                      submittingSentence ||
                      !userSubmission.trim() ||
                      evaluation !== null ||
                      (sentenceSubmitError !== null && sentenceRetryCount >= 1)
                    }
                    onClick={handleSentenceSubmit}
                    style={
                      evaluation !== null
                        ? {
                            backgroundColor: '#94a3b8',
                            borderColor: '#cbd5e1',
                            cursor: 'not-allowed',
                          }
                        : sentenceSubmitError
                        ? {
                            backgroundColor: sentenceRetryCount >= 1 ? '#94a3b8' : '#f59e0b',
                            borderColor: sentenceRetryCount >= 1 ? '#cbd5e1' : '#d97706',
                          }
                        : undefined
                    }
                  >
                    {submittingSentence ? (
                      <>
                        <Loader2 className="animate-spin" size={16} /> {sentenceSubmitError ? 'Đang chấm lại AI...' : 'Evaluating...'}
                      </>
                    ) : evaluation !== null ? (
                      <>
                        Đã nộp bài <Check size={16} />
                      </>
                    ) : sentenceSubmitError ? (
                      sentenceRetryCount >= 1 ? (
                        <>
                          Đã thử chấm lại (1/1) <RefreshCw size={16} />
                        </>
                      ) : (
                        <>
                          Chấm lại AI (Còn 1 lượt) <RefreshCw size={16} />
                        </>
                      )
                    ) : (
                      <>
                        Submit translation <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <div className="prompt-card sentence-prompt-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CircleHelp size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3>Chưa có câu đơn cho trình độ {selectedLevel} {selectedPattern !== 'ALL' ? `· Dạng cấu trúc ${selectedPattern}` : ''}</h3>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0 16px' }}>
                Bạn có thể chọn trình độ hoặc dạng cấu trúc ngữ pháp khác, hoặc nhấn xem tất cả bài tập.
              </p>
              <button
                className="hero-action"
                onClick={() => {
                  setSelectedLevel('ALL')
                  setSelectedPattern('ALL')
                }}
                style={{ margin: '0 auto' }}
              >
                Xem tất cả bài tập
              </button>
            </div>
          )}

          {/* Draggable Split Resizer Bar */}
          <div
            className={`split-resizer ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            title="Kéo sang trái hoặc phải để điều chỉnh kích thước khung"
          >
            <div className="resizer-handle-pill">
              <GripVertical size={14} />
            </div>
          </div>

          <aside className={`feedback-card ${evaluation ? 'visible' : ''}`}>
            {evaluation ? (
              <>
                <div className="feedback-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={evaluation.isCorrect ? 'success-icon' : 'error-icon'}>
                      {evaluation.isCorrect ? <Check size={18} /> : <X size={18} />}
                    </span>
                    <div>
                      <p className="eyebrow">{evaluation.isCorrect ? 'EXCELLENT TRANSLATION' : 'NEEDS REVISION'}</p>
                      <h3>{evaluation.isCorrect ? "Hoàn thành xuất sắc!" : 'Cần điều chỉnh bài dịch'}</h3>
                    </div>
                  </div>
                  {evaluation.score !== undefined && (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 700,
                        backgroundColor: evaluation.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: evaluation.isCorrect ? '#10b981' : '#f59e0b',
                        border: evaluation.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      Score: {evaluation.score}/100
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: '10px 0 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                  }}
                >
                  <Sparkles size={14} /> Phân tích chuyên sâu bằng AI (DeepSeek v4 Flash)
                </div>

                {/* Overall Analysis */}
                {evaluation.overallAnalysis && (
                  <div className="sentence-feedback-box">
                    <b style={{ color: '#4f46e5', display: 'block', marginBottom: '2px' }}>💡 Nhận xét của AI:</b>
                    <span>{evaluation.overallAnalysis}</span>
                  </div>
                )}

                <div className="comparison">
                  <span>Bài dịch của bạn</span>
                  <p style={{ fontWeight: 500 }}>{userSubmission}</p>
                  <span>Đáp án mẫu gợi ý</span>
                  <p style={{ fontWeight: 600, color: '#10b981' }}>{evaluation.suggestedAnswer}</p>
                </div>

                {/* Detailed Feedback Breakdown */}
                {evaluation.detailedFeedback && (
                  <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                    <div className="sentence-breakdown-card">
                      <strong className="breakdown-title-accuracy" style={{ color: '#0284c7' }}>🎯 Độ chính xác ngữ nghĩa:</strong>{' '}
                      <span>{evaluation.detailedFeedback.accuracy}</span>
                    </div>
                    <div className="sentence-breakdown-card">
                      <strong className="breakdown-title-grammar" style={{ color: '#7c3aed' }}>📐 Ngữ pháp & Cấu trúc:</strong>{' '}
                      <span>{evaluation.detailedFeedback.grammarAndStructure}</span>
                    </div>
                    <div className="sentence-breakdown-card">
                      <strong className="breakdown-title-word" style={{ color: '#059669' }}>✍️ Cách dùng từ:</strong>{' '}
                      <span>{evaluation.detailedFeedback.wordChoice}</span>
                    </div>
                  </div>
                )}

                {/* Improvement Suggestions */}
                {evaluation.improvementSuggestions && evaluation.improvementSuggestions.length > 0 && (
                  <div style={{ margin: '14px 0' }}>
                    <b style={{ fontSize: '13px', color: '#4f46e5', display: 'block', marginBottom: '8px' }}>🚀 Gợi ý nâng cấp & sửa lỗi:</b>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {evaluation.improvementSuggestions.map((sug: any, idx: number) => (
                        <div key={idx} className="sentence-suggestion-card">
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#6366f1', color: '#ffffff', textTransform: 'uppercase', marginRight: '6px' }}>
                            {sug.type || 'Gợi ý'}
                          </span>
                          <span className="sug-orig-text" style={{ textDecoration: 'line-through', opacity: 0.7, marginRight: '6px' }}>{sug.original}</span>
                          <span style={{ fontWeight: 700, color: '#10b981', marginRight: '6px' }}>➔ {sug.suggested}</span>
                          <p className="sug-reason-text" style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>{sug.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rule-box">
                  <b>📚 Trọng tâm ngữ pháp bài học</b>
                  <p>{evaluation.grammarNotes}</p>
                </div>

                <button className="next-button" onClick={handleNextSentence} style={{ marginTop: '16px' }}>
                  Next sentence <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <div className="empty-feedback">
                <Sparkles size={25} />
                <h3>Your feedback will appear here</h3>
                <p>Submit your translation to see automated DeepSeek AI analysis, score breakdown, and vocabulary suggestions.</p>
              </div>
            )}
          </aside>
        </div>
      )}
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

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
    setCurrentPage(1)
  }, [selectedDeckId])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

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

  const filteredCards = cardsList.filter((c) =>
    `${c.term} ${c.vietnameseDefinition} ${c.partOfSpeech}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const totalFiltered = filteredCards.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedCards = filteredCards.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  )

  const startRecord = totalFiltered > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0
  const endRecord = Math.min(safeCurrentPage * pageSize, totalFiltered)

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
        <div className="table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={17} />
            <input
              placeholder="Search Word, Type, Vietnamese, Level..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--muted, #64748b)' }}>
            <span style={{ fontWeight: 500 }}>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--card, #ffffff)',
                color: 'var(--foreground, #0f172a)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value={10}>10 từ / trang</option>
              <option value={20}>20 từ / trang</option>
              <option value={50}>50 từ / trang</option>
              <option value={100}>100 từ / trang</option>
            </select>
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
          ) : totalFiltered === 0 ? (
            <div style={{ padding: '32px', color: 'var(--muted, #64748b)', textAlign: 'center' }}>
              {cardsList.length === 0 ? (
                <>No vocabulary words in this deck. Click <strong>Thêm list từ vựng</strong> to generate your first word list!</>
              ) : (
                <>Không tìm thấy từ vựng nào khớp với từ khóa tìm kiếm.</>
              )}
            </div>
          ) : (
            paginatedCards.map((c) => {
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

        {/* PAGINATION BAR */}
        {totalFiltered > 0 && (
          <div
            className="table-pagination"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderTop: '1px solid var(--border, #e2e8f0)',
              background: 'var(--bg-card-secondary, #f8fafc)',
              borderRadius: '0 0 12px 12px',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12.5px',
            }}
          >
            <div style={{ color: 'var(--muted, #64748b)', fontWeight: 500 }}>
              Hiển thị <b style={{ color: 'var(--foreground, #0f172a)' }}>{startRecord} - {endRecord}</b> trong tổng số <b style={{ color: 'var(--foreground, #0f172a)' }}>{totalFiltered}</b> từ vựng
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #e2e8f0)',
                  background: safeCurrentPage <= 1 ? 'transparent' : 'var(--card, #ffffff)',
                  color: 'var(--foreground, #0f172a)',
                  opacity: safeCurrentPage <= 1 ? 0.4 : 1,
                  cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <ChevronLeft size={15} /> Trang trước
              </button>

              <span style={{ padding: '0 8px', fontWeight: 700, color: 'var(--foreground, #0f172a)' }}>
                Trang {safeCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #e2e8f0)',
                  background: safeCurrentPage >= totalPages ? 'transparent' : 'var(--card, #ffffff)',
                  color: 'var(--foreground, #0f172a)',
                  opacity: safeCurrentPage >= totalPages ? 0.4 : 1,
                  cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                Trang sau <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CARD ACTION DETAILS & DELETE MODAL */}
      {selectedCardAction && (
        <div className="modal-overlay" onClick={() => setSelectedCardAction(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="word-detail-title" style={{ margin: 0 }}>{selectedCardAction.term}</h3>
                <span className="type-chip" style={getTypeStyle(selectedCardAction.partOfSpeech || 'noun')}>
                  {selectedCardAction.partOfSpeech || 'noun'}
                </span>
              </div>
              <button className="modal-close" onClick={() => setSelectedCardAction(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="word-detail-content">
              <div>
                <span className="word-detail-label">PHÁT ÂM</span>
                <span className="word-detail-phonetic">{selectedCardAction.phonetic || '—'}</span>
              </div>
              <div>
                <span className="word-detail-label">NGHĨA TIẾNG VIỆT</span>
                <strong className="word-detail-vietnamese">{selectedCardAction.vietnameseDefinition}</strong>
              </div>
              <div>
                <span className="word-detail-label">ĐỊNH NGHĨA TIẾNG ANH</span>
                <p className="word-detail-english">
                  {typeof selectedCardAction.collocations === 'object' && selectedCardAction.collocations?.englishDefinition
                    ? selectedCardAction.collocations.englishDefinition
                    : 'A key vocabulary term recorded in your database deck.'}
                </p>
              </div>
              <div>
                <span className="word-detail-label">CÂU VÍ DỤ</span>
                <p className="word-detail-example">
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
let cachedAnalyticsData: any = null

function Analytics() {
  const [data, setData] = useState<any>(cachedAnalyticsData)
  const [loading, setLoading] = useState(!cachedAnalyticsData)
  const [historyTab, setHistoryTab] = useState<'sentences' | 'paragraphs'>('sentences')
  const [expandedParaId, setExpandedParaId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((resData) => {
        cachedAnalyticsData = resData
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

  const analytics = data?.translationAnalytics || {}
  const totals = analytics.totals || { sentenceCount: 0, paragraphCount: 0, totalPracticed: 0, sentenceCorrectCount: 0 }
  const byPattern: any[] = analytics.byPattern || []
  const byTopic: any[] = analytics.byTopic || []
  const byLevel: any[] = analytics.byLevel || []
  const sentenceLogs: any[] = analytics.sentenceLogs || []
  const paragraphLogs: any[] = analytics.paragraphLogs || []

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">THỐNG KÊ & PHÂN TÍCH TIẾN ĐỘ</p>
          <h1>Phân tích tiến độ học tập</h1>
          <p className="subhead">Tổng hợp chi tiết số lượng bài tập theo dạng bài, chủ đề, trình độ và nhật ký luyện tập.</p>
        </div>
      </div>

      {/* 1. Metric Cards Top Row */}
      <div className="analytics-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <MetricCard
          icon={TrendingUp}
          label="Tỷ lệ ghi nhớ & Chính xác"
          value={data?.retentionRate || '100.0%'}
          detail={`Tính trên ${data?.totalSessions || 0} lượt hoàn thành`}
          tone="mint"
        />
        <MetricCard
          icon={Zap}
          label="Dịch Câu Đơn đã làm"
          value={`${totals.sentenceCount} câu`}
          detail={`Đã đúng ${totals.sentenceCorrectCount}/${totals.sentenceCount} câu`}
          tone="blue"
        />
        <MetricCard
          icon={BookOpen}
          label="Dịch Đoạn Văn đã làm"
          value={`${totals.paragraphCount} đoạn`}
          detail="Bài viết IELTS / Đoạn văn đã chấm AI"
          tone="purple"
        />
        <MetricCard
          icon={Target}
          label="Chuỗi ngày học"
          value={`${data?.streak?.current || 0} ngày`}
          detail={`Kỷ lục: ${data?.streak?.longest || 0} ngày liên tiếp`}
          tone="orange"
        />
      </div>

      {/* 2. Memory Breakdown & Trend Line Section (First section after metric cards) */}
      <div className="analytics-grid" style={{ marginBottom: '14px', alignItems: 'start' }}>
        <section className="panel chart-panel" style={{ height: 'auto', justifyContent: 'flex-start' }}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">ĐỘ BỀN TRÍ NHỚ TỪ VỰNG</p>
              <h3>Xu hướng duy trì trí nhớ</h3>
            </div>
            <span className="chart-key">
              <i /> Thống kê tiến độ ghi nhớ
            </span>
          </div>
          <div className="line-chart" style={{ marginTop: '12px' }}>
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
              <path
                d="M0 150 C55 135 70 105 130 123 S205 62 260 92 S325 130 365 72 S440 85 480 52 S550 75 600 30 S665 46 700 18 L700 200 L0 200 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M0 150 C55 135 70 105 130 123 S205 62 260 92 S325 130 365 72 S440 85 480 52 S550 75 600 30 S665 46 700 18"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
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

        <section className="panel distribution-panel" style={{ height: 'auto', justifyContent: 'flex-start' }}>
          <div className="panel-header" style={{ marginBottom: '16px' }}>
            <div>
              <p className="eyebrow">PHÂN BỔ TRÍ NHỚ</p>
              <h3>Giai đoạn ghi nhớ từ vựng</h3>
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
              <div className="bar-item" key={String(stageName)} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {stageName} <small style={{ opacity: 0.7, fontWeight: 400, marginLeft: '4px' }}>({subtext})</small>
                  </span>
                  <b style={{ color: toneColor }}>{numVal} thẻ ({percent}%)</b>
                </div>
                <div className="bar" style={{ height: '7px', background: 'var(--bg-card-secondary, #f1f5f9)', borderRadius: '4px', overflow: 'hidden' }}>
                  <i style={{ width: `${percent}%`, background: toneColor, height: '100%', display: 'block', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )
          })}
        </section>
      </div>

      {/* 3. Main Aggregations Section (Placed below vocabulary memory section) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '14px', alignItems: 'stretch' }}>
        {/* Aggregation by Mode & CEFR Level */}
        <section className="panel" style={{ padding: '18px 20px', borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div className="panel-header" style={{ marginBottom: '14px' }}>
            <div>
              <p className="eyebrow">TỔNG HỢP THEO TRÌNH ĐỘ</p>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Trình độ / Mức độ đã thực hiện</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {byLevel.map((lvl) => {
              const totalAll = totals.totalPracticed || 1
              const pct = Math.round((lvl.totalCount / totalAll) * 100)
              const levelColors: Record<string, string> = {
                A2: '#10b981',
                B1: '#3b82f6',
                B2: '#8b5cf6',
                C1: '#f59e0b',
                C2: '#ef4444',
              }
              const color = levelColors[lvl.level] || '#6366f1'

              return (
                <div key={lvl.level}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '12.5px' }}>
                    <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: color, color: '#fff', fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        {lvl.level}
                      </span>
                      <span>Trình độ {lvl.level}</span>
                    </span>
                    <span style={{ fontSize: '12px', opacity: 0.85 }}>
                      <b>{lvl.totalCount} bài</b> ({lvl.sentenceCount} câu, {lvl.paragraphCount} đoạn)
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--bg-card-secondary, #f1f5f9)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '4px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Aggregation by Sentence Pattern */}
        <section className="panel" style={{ padding: '18px 20px', borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div className="panel-header" style={{ marginBottom: '14px' }}>
            <div>
              <p className="eyebrow">TỔNG HỢP CÂU ĐƠN</p>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>10 Dạng cấu trúc đã thực hiện</h3>
            </div>
          </div>

          {byPattern.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
              {byPattern.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-secondary, #f8fafc)',
                    border: '1px solid var(--border, #e2e8f0)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 650, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                      Chính xác: {p.correctCount}/{p.count} câu ({p.accuracy}%)
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary, #4f46e5)', padding: '3px 8px', borderRadius: '6px' }}>
                    {p.count} câu
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', opacity: 0.7, fontSize: '13px' }}>
              Chưa có dữ liệu bài làm câu đơn theo dạng.
            </div>
          )}
        </section>

        {/* Aggregation by IELTS Paragraph Topics */}
        <section className="panel" style={{ padding: '18px 20px', borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div className="panel-header" style={{ marginBottom: '14px' }}>
            <div>
              <p className="eyebrow">TỔNG HỢP ĐOẠN VĂN</p>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Chủ đề đoạn văn IELTS đã thực hiện</h3>
            </div>
          </div>

          {byTopic.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
              {byTopic.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-secondary, #f8fafc)',
                    border: '1px solid var(--border, #e2e8f0)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '12.5px', fontWeight: 650, color: 'var(--text-primary)' }}>
                    📌 {t.name}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, background: 'rgba(126, 34, 206, 0.15)', color: '#a855f7', padding: '3px 8px', borderRadius: '6px' }}>
                    {t.count} đoạn
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', opacity: 0.7, fontSize: '13px' }}>
              Chưa có dữ liệu bài làm đoạn văn theo chủ đề.
            </div>
          )}
        </section>
      </div>

      {/* 4. 2-Mode Practice Log / History Section (Concise Single-Line Rows Layout) */}
      <section className="panel history-panel" style={{ marginTop: '14px', padding: '18px 20px', borderRadius: '16px', height: 'auto', justifyContent: 'flex-start' }}>
        <div className="panel-header" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="eyebrow">NHẬT KÝ LUYỆN TẬP BÀI LÀM</p>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Lịch sử & Nhật ký dịch bài (Hiển thị 1 dòng)</h3>
          </div>

          {/* Tab buttons for 2 modes */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card-secondary, #f1f5f9)', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setHistoryTab('sentences')}
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: historyTab === 'sentences' ? '#4f46e5' : 'transparent',
                color: historyTab === 'sentences' ? '#ffffff' : 'var(--text-primary)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>⚡ Dịch Câu Đơn</span>
              <span style={{ fontSize: '11px', opacity: 0.8, background: historyTab === 'sentences' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)', padding: '1px 6px', borderRadius: '10px' }}>
                {sentenceLogs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryTab('paragraphs')}
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: historyTab === 'paragraphs' ? '#7e22ce' : 'transparent',
                color: historyTab === 'paragraphs' ? '#ffffff' : 'var(--text-primary)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>📑 Dịch Đoạn Văn IELTS</span>
              <span style={{ fontSize: '11px', opacity: 0.8, background: historyTab === 'paragraphs' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)', padding: '1px 6px', borderRadius: '10px' }}>
                {paragraphLogs.length}
              </span>
            </button>
          </div>
        </div>

        {/* Mode 1: Single Sentences Log (Concise Single-Line Rows) */}
        {historyTab === 'sentences' && (
          <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
            {sentenceLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sentenceLogs.map((log: any) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-card-secondary, #f8fafc)',
                      border: '1px solid var(--border, #e2e8f0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      {log.isCorrect && (
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#16a34a',
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          <Check size={13} />
                        </span>
                      )}
                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                        <b style={{ color: 'var(--text-primary)' }}>{log.userSubmission}</b>
                        <span style={{ opacity: 0.65, marginLeft: '8px', fontSize: '12px' }}>
                          • {log.vietnameseText}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11.5px', opacity: 0.8, background: 'var(--card, #ffffff)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border, #e2e8f0)' }}>
                        {log.grammarCategory}
                      </span>
                      {log.difficulty && (
                        <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px' }}>
                          {log.difficulty}
                        </span>
                      )}
                      <span style={{ fontSize: '11px', opacity: 0.55 }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', color: 'var(--text-secondary, #64748b)', textAlign: 'center', fontSize: '13.5px' }}>
                Chưa có nhật ký bài tập dịch câu đơn nào.
              </div>
            )}
          </div>
        )}

        {/* Mode 2: IELTS Paragraphs Log (Concise Single-Line Rows with Dropdown Expand) */}
        {historyTab === 'paragraphs' && (
          <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
            {paragraphLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {paragraphLogs.map((log: any) => {
                  const isExpanded = expandedParaId === log.id

                  return (
                    <div
                      key={log.id}
                      style={{
                        borderRadius: '10px',
                        background: 'var(--bg-card-secondary, #f8fafc)',
                        border: '1px solid var(--border, #e2e8f0)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                        onClick={() => setExpandedParaId(isExpanded ? null : log.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 800, background: 'rgba(126, 34, 206, 0.15)', color: '#c084fc', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                            {log.themeCategory}
                          </span>
                          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <b style={{ color: 'var(--text-primary)' }}>{log.subTopic}</b>
                            <span style={{ opacity: 0.65, marginLeft: '8px', fontSize: '12px' }}>
                              • {log.userTranslation}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px' }}>
                            Band {log.targetBand}
                          </span>
                          {log.estimatedCefr && (
                            <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(22, 163, 74, 0.15)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px' }}>
                              {log.estimatedCefr}
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {isExpanded ? '▲ Thu gọn' : '▼ Chi tiết'}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '12px 14px', background: 'var(--card, #131b2e)', borderTop: '1px solid var(--border, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                          <div><b>Đoạn gốc:</b> {log.vietnameseParagraph}</div>
                          <div><b>Bản dịch của bạn:</b> {log.userTranslation}</div>
                          {log.overallFeedback && <div><b style={{ color: '#818cf8' }}>Nhận xét AI:</b> {log.overallFeedback}</div>}
                          <div><b style={{ color: '#4ade80' }}>Bản dịch mẫu:</b> <i style={{ color: 'var(--text-primary)' }}>{log.modelTranslation}</i></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '24px', color: 'var(--text-secondary, #64748b)', textAlign: 'center', fontSize: '13.5px' }}>
                Chưa có nhật ký bài tập dịch đoạn văn IELTS nào.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

// ----------------------------------------------------
// Resources View (External Learning Resources & Links)
// ----------------------------------------------------
function Resources() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const resourceCategories = [
    {
      title: '🎯 Luyện Đề & Thi Thử IELTS',
      description: 'Các nền tảng làm đề thi thử IELTS Listening, Reading, Writing & Speaking chuẩn cấu trúc thực tế.',
      color: '#4f46e5',
      bgGrad: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(99, 102, 241, 0.04) 100%)',
      borderColor: 'rgba(99, 102, 241, 0.25)',
      items: [
        {
          name: 'YouPass (youpass.vn)',
          url: 'https://youpass.vn/',
          tag: 'Luyện đề & Chấm bài',
          description: 'Nền tảng luyện đề thi thử IELTS chất lượng cao với ngân hàng đề phong phú, chấm sửa và đánh giá năng lực chi tiết.',
          iconColor: '#6366f1',
        },
        {
          name: 'IELTS Mate (ieltsmate.vn)',
          url: 'https://www.ieltsmate.vn/',
          tag: 'Kho đề & Thi thử',
          description: 'Trang web tổng hợp kho đề thi IELTS miễn phí, hỗ trợ luyện tập Listening/Reading trực quan cùng đáp án giải thích.',
          iconColor: '#8b5cf6',
        },
      ],
    },
    {
      title: '🎧 Luyện Nghe & Chép Chính Tả',
      description: 'Công cụ và phương pháp Dictation giúp cải thiện khả năng phản xạ âm thanh, vốn từ vựng và ngữ pháp nghe.',
      color: '#059669',
      bgGrad: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.04) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      items: [
        {
          name: 'Daily Dictation (dailydictation.com)',
          url: 'https://dailydictation.com/',
          tag: 'Listening & Dictation',
          description: 'Trang web hàng đầu về luyện nghe chép chính tả tiếng Anh phân theo từng cấp độ, chủ đề ngắn gọn và phản xạ nghe chính xác.',
          iconColor: '#10b981',
        },
      ],
    },
  ]

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">TÀI NGUYÊN MỞ RỘNG & TRANG LIÊN KẾT</p>
          <h1>Tài nguyên học tập</h1>
          <p className="subhead">Tổng hợp các nền tảng luyện thi IELTS, luyện đề và chép chính tả hàng đầu.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {resourceCategories.map((cat, idx) => (
          <section
            key={idx}
            className="panel"
            style={{
              padding: '20px 22px',
              borderRadius: '16px',
              background: cat.bgGrad,
              border: `1px solid ${cat.borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--foreground, #0f172a)', margin: 0 }}>
                {cat.title}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted, #64748b)', marginTop: '3px', margin: 0 }}>
                {cat.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {cat.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    background: 'var(--card, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: `${item.iconColor}18`,
                          color: item.iconColor,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                        }}
                      >
                        {item.tag}
                      </span>
                      <Globe size={18} style={{ color: item.iconColor, opacity: 0.8 }} />
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 750, color: 'var(--foreground, #0f172a)', margin: '0 0 6px 0' }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--muted, #64748b)', lineHeight: '1.5', margin: 0 }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-access-btn"
                      style={{ flex: 1 }}
                    >
                      <span>Truy cập trang</span>
                      <ExternalLink size={14} />
                    </a>

                    <button
                      type="button"
                      className="resource-copy-btn"
                      onClick={() => handleCopyLink(item.url)}
                      title="Sao chép đường dẫn"
                    >
                      {copiedUrl === item.url ? 'Đã chép ✓' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

// ----------------------------------------------------
// Main App Component
// ----------------------------------------------------
export default function Page() {
  const router = useRouter()
  const [view, setView] = useState<View>('Dashboard')
  const [user, setUser] = useState<any>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Theme & Auth Modals
  const [theme, setTheme] = useState<'light' | 'dark' | 'pink'>('light')
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
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'pink' | null
      if (savedTheme && ['light', 'dark', 'pink'].includes(savedTheme)) {
        setTheme(savedTheme)
        document.documentElement.classList.remove('dark', 'pink')
        if (savedTheme === 'dark') document.documentElement.classList.add('dark')
        else if (savedTheme === 'pink') document.documentElement.classList.add('pink')
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
    const themes: ('light' | 'dark' | 'pink')[] = ['light', 'dark', 'pink']
    const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length]
    setTheme(nextTheme)
    try {
      localStorage.setItem('theme', nextTheme)
      document.documentElement.classList.remove('dark', 'pink')
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (nextTheme === 'pink') {
        document.documentElement.classList.add('pink')
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
          <button className="nav-item" onClick={() => router.push('/admin')}>
            <Shield size={18} className="text-indigo-500" />
            <span>Admin Panel</span>
          </button>
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
        <div style={{ display: view === 'Translate' ? 'block' : 'none' }}>
          <Translate setView={setView} />
        </div>
        {view === 'Collocations' && <CollocationMatcher />}
        {view === 'Speaking' && <SpeakingPractice />}
        {view === 'Decks' && <Decks />}
        {view === 'Analytics' && <Analytics />}
        {view === 'Resources' && <Resources />}
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
                <label>Giao diện ứng dụng (Theme)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className={`theme-select-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => {
                      setTheme('light')
                      localStorage.setItem('theme', 'light')
                      document.documentElement.classList.remove('dark', 'pink')
                    }}
                  >
                    <Sun size={15} className="text-amber-500" />
                    <span>Sáng</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-select-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => {
                      setTheme('dark')
                      localStorage.setItem('theme', 'dark')
                      document.documentElement.classList.remove('pink')
                      document.documentElement.classList.add('dark')
                    }}
                  >
                    <Moon size={15} className="text-indigo-400" />
                    <span>Tối</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-select-option ${theme === 'pink' ? 'active' : ''}`}
                    onClick={() => {
                      setTheme('pink')
                      localStorage.setItem('theme', 'pink')
                      document.documentElement.classList.remove('dark')
                      document.documentElement.classList.add('pink')
                    }}
                  >
                    <Sparkles size={15} className="text-pink-400" />
                    <span>Hồng</span>
                  </button>
                </div>
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
                      <span className="type-chip" style={{ marginLeft: '8px', ...getTypeStyle(item.partOfSpeech || 'noun') }}>{item.partOfSpeech || 'noun'}</span>
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

      {/* TOTORO COMPANION MASCOT */}
      <TotoroMascot />
    </main>
  )
}
