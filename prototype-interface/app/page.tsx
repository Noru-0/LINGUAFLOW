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
  detail: string
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
        <small>{detail}</small>
      </div>
      <MoreHorizontal size={17} className="more" />
    </div>
  )
}

// ----------------------------------------------------
// Dashboard View
// ----------------------------------------------------
function Dashboard({ setView, user }: { setView: (view: View) => void; user: any }) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const activityData: number[] = metrics?.activityMap || new Array(112).fill(0)
  const cardsDueCount = metrics?.cardsDue ?? 0
  const totalCardsCount = metrics?.totalCards ?? 0
  const progressPercent = totalCardsCount > 0 ? Math.min(100, Math.round(((totalCardsCount - cardsDueCount) / totalCardsCount) * 100)) : 100

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
        <button className="profile-button">
          <span className="avatar">{user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AL'}</span>
          <span>{user?.name || 'Alex Lee'}</span>
          <ChevronDown size={15} />
        </button>
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

      <div className="metrics-grid">
        <MetricCard
          icon={Target}
          label="Due today"
          value={loading ? '...' : String(cardsDueCount)}
          detail="SRS algorithm scheduled"
          tone="blue"
        />
        <MetricCard
          icon={TrendingUp}
          label="Mastery rate"
          value={loading ? '...' : metrics?.retentionRate ?? '100.0%'}
          detail="Calculated from database logs"
          tone="mint"
        />
        <MetricCard
          icon={Flame}
          label="Day streak"
          value={loading ? '...' : `${metrics?.streak?.current ?? 0} days`}
          detail={`Personal best: ${metrics?.streak?.longest ?? 0} days`}
          tone="orange"
        />
      </div>

      <div className="content-grid">
        <section className="panel activity-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">CONSISTENCY</p>
              <h3>Learning activity</h3>
            </div>
            <button className="select-button">
              Last 16 weeks <ChevronDown size={14} />
            </button>
          </div>
          <div className="activity-top">
            <strong>
              {loading ? '...' : metrics?.totalSessions ?? 0} <span>sessions completed</span>
            </strong>
            <span className="positive">
              Live Database <small>sync</small>
            </span>
          </div>
          <div className="heatmap-wrap">
            <div className="months">
              <span>Past</span>
              <span>Recent</span>
              <span>This Month</span>
              <span>Today</span>
            </div>
            <div className="heatmap">
              <div className="weekdays">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
              <div className="squares">
                {activityData.map((v, i) => (
                  <span key={i} className={`level-${v === 0 ? 0 : Math.min(4, v)}`} title={`${v} activities`} />
                ))}
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

        <section className="panel actions-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">JUMP BACK IN</p>
              <h3>Quick actions</h3>
            </div>
          </div>
          <button className="action-row primary-action" onClick={() => setView('Review')}>
            <span className="action-icon blue">
              <Zap size={18} />
            </span>
            <span>
              <b>Review vocabulary</b>
              <small>{cardsDueCount} cards waiting for you</small>
            </span>
            <ArrowRight size={17} />
          </button>
          <button className="action-row" onClick={() => setView('Translate')}>
            <span className="action-icon purple">
              <BookOpen size={18} />
            </span>
            <span>
              <b>Practice translation</b>
              <small>Grammar sentence drills</small>
            </span>
            <ArrowRight size={17} />
          </button>
          <button className="action-row" onClick={() => setView('Decks')}>
            <span className="action-icon green">
              <Library size={18} />
            </span>
            <span>
              <b>Browse your decks</b>
              <small>{metrics?.totalDecks ?? 0} active decks in library</small>
            </span>
            <ArrowRight size={17} />
          </button>
        </section>
      </div>
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
          <div className="card-word">{revealed ? currentCard.term : currentCard.vietnameseDefinition}</div>
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

  // Form inputs
  const [newDeckTitle, setNewDeckTitle] = useState('')
  const [newDeckDesc, setNewDeckDesc] = useState('')

  const [newTerm, setNewTerm] = useState('')
  const [newVietDefinition, setNewVietDefinition] = useState('')
  const [newPhonetic, setNewPhonetic] = useState('')
  const [newPartOfSpeech, setNewPartOfSpeech] = useState('noun')
  const [newExampleSentence, setNewExampleSentence] = useState('')
  const [newCollocations, setNewCollocations] = useState('')

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
    if (!selectedDeckId || !newTerm.trim() || !newVietDefinition.trim() || isSubmitting) return
    setIsSubmitting(true)

    try {
      const collocationsArray = newCollocations
        .split('\n')
        .concat(newCollocations.split(','))
        .map((s) => s.trim())
        .filter(Boolean)

      await fetch(`/api/decks/${selectedDeckId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: newTerm,
          vietnameseDefinition: newVietDefinition,
          phonetic: newPhonetic,
          partOfSpeech: newPartOfSpeech,
          exampleSentence: newExampleSentence,
          collocations: Array.from(new Set(collocationsArray)),
        }),
      })

      setNewTerm('')
      setNewVietDefinition('')
      setNewPhonetic('')
      setNewExampleSentence('')
      setNewCollocations('')
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

      // Try JSON parse first
      try {
        const parsed = JSON.parse(bulkInput)
        if (Array.isArray(parsed)) cardsToInsert = parsed
      } catch {
        // Fallback: parse line by line (format: term | definition)
        const lines = bulkInput.split('\n')
        cardsToInsert = lines
          .map((line) => {
            const parts = line.split('|').map((s) => s.trim())
            if (parts.length >= 2 && parts[0] && parts[1]) {
              return {
                term: parts[0],
                vietnameseDefinition: parts[1],
                exampleSentence: parts[2] || '',
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
          <button className="secondary-button" onClick={() => setShowBulkModal(true)}>
            <Upload size={16} /> Bulk Import
          </button>
          <button className="hero-action" onClick={() => setShowNewCardModal(true)}>
            <Plus size={16} /> New card
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
              placeholder="Search terms or definitions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="cards-table">
          <div className="table-head">
            <span>WORD / TERM</span>
            <span>VIETNAMESE DEFINITION</span>
            <span>PHONETIC / POS</span>
            <span>NEXT REVIEW</span>
            <span />
          </div>

          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : cardsList.length === 0 ? (
            <div style={{ padding: '32px', color: '#64748b', textAlign: 'center' }}>
              No cards found in this deck yet. Click <strong>New card</strong> to add your first word!
            </div>
          ) : (
            cardsList
              .filter((c) =>
                `${c.term} ${c.vietnameseDefinition}`.toLowerCase().includes(search.toLowerCase())
              )
              .map((c) => (
                <div className="table-row" key={c.id}>
                  <strong>{c.term}</strong>
                  <span>{c.vietnameseDefinition}</span>
                  <span className="deck-label">{c.phonetic || c.partOfSpeech || 'Vocabulary'}</span>
                  <span className="due">
                    {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : 'Scheduled'}
                  </span>
                  <button>
                    <MoreHorizontal size={17} />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>

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

      {/* NEW CARD MODAL */}
      {showNewCardModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add New Flashcard</h3>
              <button className="modal-close" onClick={() => setShowNewCardModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCard}>
              <div className="form-group">
                <label>Target Deck</label>
                <select
                  className="select-field"
                  value={selectedDeckId || ''}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                >
                  {decksList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>English Word / Term *</label>
                <input
                  className="input-field"
                  placeholder="e.g. accomplish"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vietnamese Definition *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Đạt được, hoàn thành mục tiêu"
                  value={newVietDefinition}
                  onChange={(e) => setNewVietDefinition(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>Phonetic</label>
                  <input
                    className="input-field"
                    placeholder="/əˈkʌm.plɪʃ/"
                    value={newPhonetic}
                    onChange={(e) => setNewPhonetic(e.target.value)}
                  />
                </div>
                <div>
                  <label>Part of Speech</label>
                  <select
                    className="select-field"
                    value={newPartOfSpeech}
                    onChange={(e) => setNewPartOfSpeech(e.target.value)}
                  >
                    <option value="verb">verb</option>
                    <option value="noun">noun</option>
                    <option value="adjective">adjective</option>
                    <option value="adverb">adverb</option>
                    <option value="phrase">phrase</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Example Sentence</label>
                <input
                  className="input-field"
                  placeholder="She accomplished her goal within 6 months."
                  value={newExampleSentence}
                  onChange={(e) => setNewExampleSentence(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Collocations (one per line or comma-separated)</label>
                <textarea
                  className="textarea-field"
                  style={{ minHeight: '60px' }}
                  placeholder="accomplish a task, accomplish a mission"
                  value={newCollocations}
                  onChange={(e) => setNewCollocations(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowNewCardModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="hero-action" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Card'}
                </button>
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
            <svg viewBox="0 0 700 220" preserveAspectRatio="none" aria-label="Retention trend chart">
              <path
                d="M0 170 C55 155 70 125 130 143 S205 82 260 112 S325 150 365 92 S440 105 480 72 S550 95 600 50 S665 66 700 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
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

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  const userInitials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AL'

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <AppLogo />
          <span>
            lingua<span>flow</span>
          </span>
        </div>

        <div className="workspace">
          <span className="workspace-avatar">{userInitials[0] || 'A'}</span>
          <div>
            <b>{user?.name || 'Alex'}&apos;s workspace</b>
            <small>Study Group Cohort</small>
          </div>
          <ChevronDown size={15} />
        </div>

        <nav>
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={view === label ? 'nav-item active' : 'nav-item'}
              onClick={() => setView(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <CircleHelp size={18} />
            <span>Help center</span>
          </button>
          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div className="sidebar-user">
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
        <Menu size={22} />
      </div>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span>/</span>
            <b>{view}</b>
          </div>

          <div className="topbar-actions">
            <button className="icon-button">
              <Search size={18} />
            </button>
            <button className="upgrade-button">
              <Sparkles size={15} /> Live Database
            </button>
            <span className="avatar">{userInitials}</span>
          </div>
        </header>

        {view === 'Dashboard' && <Dashboard setView={setView} user={user} />}
        {view === 'Review' && <Review setView={setView} />}
        {view === 'Translate' && <Translate setView={setView} />}
        {view === 'Decks' && <Decks />}
        {view === 'Analytics' && <Analytics />}
      </section>
    </main>
  )
}
