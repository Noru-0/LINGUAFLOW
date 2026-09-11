'use client'

import { useState } from 'react'
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
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserRound,
  X,
  Zap,
} from 'lucide-react'

type View = 'Dashboard' | 'Review' | 'Translate' | 'Decks' | 'Analytics'

const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Review', icon: Zap },
  { label: 'Translate', icon: BookOpen },
  { label: 'Decks', icon: Library },
  { label: 'Analytics', icon: BarChart3 },
]

const activity = [3, 5, 2, 7, 4, 8, 6, 3, 5, 7, 8, 4, 6, 7, 8, 6, 4, 7, 8, 5, 3, 6, 7, 8, 4, 6, 8, 7, 5, 4, 6, 7, 8, 5, 3, 7, 6, 8, 4, 5, 7, 8, 6, 3, 5, 7, 8, 4, 6, 7, 5, 8, 6, 4, 7, 8, 5, 6, 7, 8, 6, 4, 7, 8, 5, 3, 7, 6, 8, 4, 6, 7, 8, 5, 4, 6, 7, 8, 6, 3, 5, 7, 8, 4, 6, 7, 8, 5, 6, 4, 7, 8, 6, 5, 7, 8, 4, 6, 7, 5, 8, 6, 4, 7, 8, 5, 6, 7, 8, 4, 6, 7, 5, 8, 6, 4, 7, 8, 5]

function AppLogo() {
  return <div className="logo-mark"><GraduationCap size={19} strokeWidth={2.5} /></div>
}

function MetricCard({ icon: Icon, label, value, detail, tone }: { icon: typeof Target; label: string; value: string; detail: string; tone: string }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={18} /></div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
      <MoreHorizontal size={17} className="more" />
    </div>
  )
}

function Dashboard({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="page-content">
      <div className="welcome-row"><div><p className="eyebrow">Tuesday, September 9, 2026</p><h1>Good morning, Alex</h1><p className="subhead">Keep your momentum going. You&apos;re doing great.</p></div><button className="profile-button"><span className="avatar">AL</span><span>Alex Lee</span><ChevronDown size={15} /></button></div>
      <section className="hero-card"><div className="hero-copy"><span className="hero-pill"><Sparkles size={14} /> DAILY GOAL</span><h2>Make today count.</h2><p>You&apos;re 68% through your weekly learning goal. A few more minutes can make a big difference.</p><div className="hero-progress"><div><span>Weekly progress</span><b>17 / 25 sessions</b></div><div className="progress-track"><div style={{ width: '68%' }} /></div></div><button className="hero-action" onClick={() => setView('Review')}>Continue learning <ArrowRight size={17} /></button></div><div className="hero-illustration"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="book-shape"><BookOpen size={68} strokeWidth={1.1} /></div><div className="spark spark-a">✦</div><div className="spark spark-b">✧</div></div></section>
      <div className="section-heading"><div><p className="eyebrow">YOUR PROGRESS</p><h2>At a glance</h2></div><button className="text-button" onClick={() => setView('Analytics')}>View analytics <ArrowRight size={15} /></button></div>
      <div className="metrics-grid"><MetricCard icon={Target} label="Due today" value="24" detail="12 new · 12 review" tone="blue" /><MetricCard icon={TrendingUp} label="Mastery rate" value="82.4%" detail="+4.8% this month" tone="mint" /><MetricCard icon={Flame} label="Day streak" value="12 days" detail="Personal best: 21" tone="orange" /></div>
      <div className="content-grid"><section className="panel activity-panel"><div className="panel-header"><div><p className="eyebrow">CONSISTENCY</p><h3>Learning activity</h3></div><button className="select-button">Last 12 weeks <ChevronDown size={14} /></button></div><div className="activity-top"><strong>64 <span>sessions completed</span></strong><span className="positive">+18% <small>vs. last period</small></span></div><div className="heatmap-wrap"><div className="months"><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div><div className="heatmap"><div className="weekdays"><span>Mon</span><span>Wed</span><span>Fri</span></div><div className="squares">{activity.map((v, i) => <span key={i} className={`level-${Math.min(4, Math.ceil(v / 2))}`} />)}</div></div></div><div className="heatmap-legend"><span>Less</span>{[1,2,3,4,5].map(n => <i key={n} className={`level-${n}`} />)}<span>More</span></div></section><section className="panel actions-panel"><div className="panel-header"><div><p className="eyebrow">JUMP BACK IN</p><h3>Quick actions</h3></div></div><button className="action-row primary-action" onClick={() => setView('Review')}><span className="action-icon blue"><Zap size={18} /></span><span><b>Review vocabulary</b><small>24 cards waiting for you</small></span><ArrowRight size={17} /></button><button className="action-row" onClick={() => setView('Translate')}><span className="action-icon purple"><BookOpen size={18} /></span><span><b>Practice translation</b><small>10 grammar prompts available</small></span><ArrowRight size={17} /></button><button className="action-row" onClick={() => setView('Decks')}><span className="action-icon green"><Library size={18} /></span><span><b>Browse your decks</b><small>6 active decks</small></span><ArrowRight size={17} /></button></section></div>
      <section className="panel continue-panel"><div className="panel-header"><div><p className="eyebrow">RECENTLY STUDIED</p><h3>Continue where you left off</h3></div><button className="text-button" onClick={() => setView('Decks')}>View all <ArrowRight size={15} /></button></div><div className="deck-list"><div className="deck-item"><span className="deck-icon indigo"><Library size={19} /></span><span><b>Business English · Intermediate</b><small>128 cards · Last studied 2 hours ago</small></span><div className="deck-progress"><span>72%</span><div><i style={{ width: '72%' }} /></div></div><button className="round-arrow"><ArrowRight size={16} /></button></div><div className="deck-item"><span className="deck-icon amber"><Library size={19} /></span><span><b>Everyday conversations</b><small>86 cards · Last studied yesterday</small></span><div className="deck-progress"><span>48%</span><div><i style={{ width: '48%' }} /></div></div><button className="round-arrow"><ArrowRight size={16} /></button></div></div></section>
    </div>
  )
}

function Review({ setView }: { setView: (view: View) => void }) {
  const [revealed, setRevealed] = useState(false)
  return <div className="page-content review-page"><div className="review-top"><div><p className="eyebrow">VOCABULARY REVIEW</p><h1>Daily review</h1><p className="subhead">Build lasting memory, one card at a time.</p></div><div className="review-count"><strong>12</strong><span>/ 24 cards</span></div></div><div className="session-progress"><span style={{ width: '50%' }} /></div><div className="review-layout"><div className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(!revealed)}><div className="card-label">{revealed ? 'ENGLISH' : 'VIETNAMESE'}</div><div className="card-word">{revealed ? 'accomplish' : 'Đạt được'}</div><p>{revealed ? 'to succeed in doing or completing something' : 'Tap or press space to reveal the answer'}</p><div className="card-example">{revealed ? 'She accomplished her goal after months of practice.' : 'To reach or complete a difficult goal'}</div><span className="flip-hint"><Keyboard size={14} /> Press space to flip</span></div><div className="rating-panel"><p className="eyebrow">HOW WELL DID YOU KNOW IT?</p><div className="rating-buttons">{[['Again','< 1m','red'],['Hard','6m','orange'],['Good','10m','green'],['Easy','4d','blue']].map(([name,time,tone], i) => <button key={name} className={`rating ${tone}`} disabled={!revealed} onClick={() => setView(i === 3 ? 'Dashboard' : 'Review')}><b>{i + 1}</b><span>{name}</span><small>{time}</small></button>)}</div></div></div><div className="keyboard-tip"><Keyboard size={16} /><span>Keyboard shortcuts</span><kbd>Space</kbd><small>flip card</small><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd><small>rate card</small></div></div>
}

function Translate({ setView }: { setView: (view: View) => void }) {
  const [submitted, setSubmitted] = useState(false)
  return <div className="page-content"><div className="welcome-row"><div><p className="eyebrow">GRAMMAR WORKOUT</p><h1>Translate in context</h1><p className="subhead">Turn understanding into confident expression.</p></div><div className="streak-chip"><Flame size={17} /> 12 day streak</div></div><div className="translate-layout"><section className="prompt-card"><div className="prompt-top"><span className="tag purple-tag">INVERSION</span><span className="prompt-number">Prompt 4 of 10</span></div><p className="eyebrow">TRANSLATE THIS SENTENCE</p><h2>Chỉ khi cô ấy đến, chúng tôi mới bắt đầu cuộc họp.</h2><p className="prompt-note">Pay attention to the inverted sentence structure after “only when”.</p><div className="answer-area"><label htmlFor="translation">Your translation</label><textarea id="translation" placeholder="Type your English translation here..." defaultValue={submitted ? 'Only when she arrived did we start the meeting.' : ''} /><div className="answer-footer"><span><Keyboard size={14} /> Enter to submit</span><button className="hero-action" onClick={() => setSubmitted(true)}>Submit translation <ArrowRight size={16} /></button></div></div></section><aside className={`feedback-card ${submitted ? 'visible' : ''}`}>{submitted ? <><div className="feedback-title"><span className="success-icon"><Check size={18} /></span><div><p className="eyebrow">GREAT WORK</p><h3>That&apos;s correct!</h3></div></div><div className="comparison"><span>Your answer</span><p>Only when she arrived did we start the meeting.</p><span>Suggested answer</span><p>Only when she arrived did we begin the meeting.</p></div><div className="rule-box"><b>Grammar note</b><p>After “only when”, we use inversion: auxiliary + subject + verb. Your structure is spot on.</p></div><button className="next-button" onClick={() => setSubmitted(false)}>Next sentence <ArrowRight size={16} /></button></> : <div className="empty-feedback"><Sparkles size={25} /><h3>Your feedback will appear here</h3><p>Submit your translation to see detailed corrections, grammar notes, and an improved version.</p></div>}</aside></div></div>
}

function Decks() { const [search, setSearch] = useState(''); const cards = [['accomplish','Đạt được, hoàn thành','Business English','Due today'],['reliable','Đáng tin cậy','Business English','Tomorrow'],['negotiate','Đàm phán','Work vocabulary','In 3 days'],['insight','Sự hiểu biết sâu sắc','Academic English','In 4 days'],['overcome','Vượt qua','Everyday conversations','In 6 days']]; return <div className="page-content"><div className="welcome-row"><div><p className="eyebrow">YOUR LIBRARY</p><h1>Decks & cards</h1><p className="subhead">Organize your learning your way.</p></div><div className="deck-actions"><button className="secondary-button"><Upload size={16} /> Import</button><button className="hero-action"><Plus size={16} /> New card</button></div></div><div className="deck-tabs"><button className="active">All decks <span>6</span></button><button>Favorites <span>12</span></button><button>Recently added</button></div><div className="panel cards-panel"><div className="table-toolbar"><div className="search-box"><Search size={17} /><input placeholder="Search cards..." value={search} onChange={e => setSearch(e.target.value)} /></div><button className="select-button">All decks <ChevronDown size={14} /></button></div><div className="cards-table"><div className="table-head"><span>WORD</span><span>MEANING</span><span>DECK</span><span>NEXT REVIEW</span><span /></div>{cards.filter(c => c.join(' ').toLowerCase().includes(search.toLowerCase())).map(card => <div className="table-row" key={card[0]}><strong>{card[0]}</strong><span>{card[1]}</span><span className="deck-label">{card[2]}</span><span className={card[3] === 'Due today' ? 'due' : ''}>{card[3]}</span><button><MoreHorizontal size={17} /></button></div>)}</div></div></div> }

function Analytics() { return <div className="page-content"><div className="welcome-row"><div><p className="eyebrow">INSIGHTS</p><h1>Your learning analytics</h1><p className="subhead">A clearer view of how far you&apos;ve come.</p></div><button className="select-button">Last 30 days <ChevronDown size={14} /></button></div><div className="analytics-metrics"><MetricCard icon={TrendingUp} label="Retention rate" value="91.8%" detail="+2.4% this period" tone="mint" /><MetricCard icon={Target} label="Cards mastered" value="248" detail="32 this month" tone="blue" /><MetricCard icon={Zap} label="Study time" value="14h 32m" detail="+22% vs. last month" tone="purple" /></div><div className="analytics-grid"><section className="panel chart-panel"><div className="panel-header"><div><p className="eyebrow">RETENTION</p><h3>Memory over time</h3></div><span className="chart-key"><i /> Retention rate</span></div><div className="line-chart"><div className="chart-lines"><span /><span /><span /><span /><span /></div><svg viewBox="0 0 700 220" preserveAspectRatio="none" aria-label="Retention trend chart"><path d="M0 170 C55 155 70 125 130 143 S205 82 260 112 S325 150 365 92 S440 105 480 72 S550 95 600 50 S665 66 700 28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg><div className="chart-labels"><span>Aug 11</span><span>Aug 18</span><span>Aug 25</span><span>Sep 1</span><span>Sep 8</span></div></div></section><section className="panel distribution-panel"><div className="panel-header"><div><p className="eyebrow">CARD HEALTH</p><h3>Memory stability</h3></div></div>{[['Learning','32','blue'],['Young','74','purple'],['Mature','142','green']].map(([a,b,c]) => <div className="bar-item" key={a}><div><span>{a}</span><b>{b} cards</b></div><div className="bar"><i className={c} style={{ width: `${Number(b) / 1.6}%` }} /></div></div>)}</section></div><section className="panel history-panel"><div className="panel-header"><div><p className="eyebrow">RECENT ATTEMPTS</p><h3>Translation history</h3></div><button className="text-button">View all <ArrowRight size={15} /></button></div><div className="history-row"><span className="success-icon"><Check size={15} /></span><span><b>Only when she arrived did we start the meeting.</b><small>Inversion · 2 minutes ago</small></span><strong className="positive">Correct</strong></div><div className="history-row"><span className="error-icon"><X size={15} /></span><span><b>He suggested that we should postpone it.</b><small>Subjunctive · Yesterday</small></span><strong className="negative">Review</strong></div></section></div> }

export default function Page() {
  const [view, setView] = useState<View>('Dashboard')
  return <main className="app-shell"><aside className="sidebar"><div className="brand"><AppLogo /><span>lingua<span>flow</span></span></div><div className="workspace"><span className="workspace-avatar">A</span><div><b>Alex&apos;s workspace</b><small>Personal account</small></div><ChevronDown size={15} /></div><nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={view === label ? 'nav-item active' : 'nav-item'} onClick={() => setView(label)}><Icon size={18} /><span>{label}</span>{label === 'Review' && <em>24</em>}</button>)}</nav><div className="sidebar-bottom"><button className="nav-item"><CircleHelp size={18} /><span>Help center</span></button><button className="nav-item"><Settings size={18} /><span>Settings</span></button><div className="sidebar-user"><span className="avatar">AL</span><span><b>Alex Lee</b><small>Free plan</small></span><MoreHorizontal size={17} /></div></div></aside><div className="mobile-header"><div className="brand"><AppLogo /><span>lingua<span>flow</span></span></div><Menu size={22} /></div><section className="main-area"><header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span>/</span><b>{view}</b></div><div className="topbar-actions"><button className="icon-button"><Search size={18} /></button><button className="upgrade-button"><Sparkles size={15} /> Upgrade</button><span className="avatar">AL</span></div></header>{view === 'Dashboard' && <Dashboard setView={setView} />}{view === 'Review' && <Review setView={setView} />}{view === 'Translate' && <Translate setView={setView} />}{view === 'Decks' && <Decks />}{view === 'Analytics' && <Analytics />}</section></main>
}
