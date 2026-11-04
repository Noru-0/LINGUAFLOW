'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Leaf,
  Cpu,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Landmark,
  Building2,
  Compass,
  Smile,
  Globe,
  Folder,
  Layers,
  Sparkles,
  Search,
  RefreshCw,
  Zap,
  BookOpen,
  Volume2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  X,
  Play,
  RotateCcw,
  Check,
  Flame,
  Award,
} from 'lucide-react'
import { INITIAL_TOPICS, MajorTopicDefinition } from '@/lib/db/initial_topics'

interface SubtopicStat {
  id: string
  parentId: string
  nameEn: string
  nameVi: string
  description: string
  icon: string
  cardCount: number
  matureCount: number
  dueCount: number
}

interface MajorTopicStat {
  id: string
  nameEn: string
  nameVi: string
  description: string
  icon: string
  color: string
  totalCards: number
  matureCards: number
  dueCards: number
  retentionRate: number
  subtopics: SubtopicStat[]
}

interface TopicCardItem {
  id: string
  deckId: string
  deckTitle: string
  term: string
  vietnameseDefinition: string
  englishMeaning?: string
  phonetic?: string
  partOfSpeech?: string
  exampleSentence?: string
  cefrLevel?: string
  audioUrl?: string
  collocations: string[]
  isDue: boolean
  isMature: boolean
}

export interface TopicThemeConfig {
  primaryHex: string
  accentBorder: string
  headerGradient: string
  cardBorderHover: string
  badgeStyle: { light: string; dark: string }
  progressColor: string
  subtopicHover: string
  buttonPrimary: string
  drawerGrad: string
  flashcardBorder: string
  flashcardBg: string
  textColor: string
  tagBg: string
}

export const TOPIC_THEMES: Record<string, TopicThemeConfig> = {
  env: {
    primaryHex: '#10B981',
    accentBorder: 'border-t-emerald-500',
    headerGradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    cardBorderHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    badgeStyle: {
      light: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dark: 'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    },
    progressColor: '#10B981',
    subtopicHover: 'hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 hover:border-emerald-200 dark:hover:border-emerald-800/70 group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
    buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25',
    drawerGrad: 'from-emerald-100/70 via-white to-teal-50/30 dark:from-emerald-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-400',
    flashcardBg: 'from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-gray-900 dark:to-emerald-950/20',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  },
  tech: {
    primaryHex: '#2563EB',
    accentBorder: 'border-t-blue-500',
    headerGradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
    cardBorderHover: 'hover:border-blue-400 dark:hover:border-blue-600',
    badgeStyle: {
      light: 'bg-blue-50 text-blue-800 border-blue-200',
      dark: 'dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    },
    progressColor: '#2563EB',
    subtopicHover: 'hover:bg-blue-50/70 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-800/70 group-hover:text-blue-700 dark:group-hover:text-blue-300',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25',
    drawerGrad: 'from-blue-100/70 via-white to-indigo-50/30 dark:from-blue-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-blue-300 dark:border-blue-700 hover:border-blue-400',
    flashcardBg: 'from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-gray-900 dark:to-blue-950/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    tagBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  },
  biz: {
    primaryHex: '#D97706',
    accentBorder: 'border-t-amber-500',
    headerGradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    cardBorderHover: 'hover:border-amber-400 dark:hover:border-amber-600',
    badgeStyle: {
      light: 'bg-amber-50 text-amber-900 border-amber-200',
      dark: 'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    },
    progressColor: '#D97706',
    subtopicHover: 'hover:bg-amber-50/70 dark:hover:bg-amber-950/40 hover:border-amber-200 dark:hover:border-amber-800/70 group-hover:text-amber-800 dark:group-hover:text-amber-300',
    buttonPrimary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25',
    drawerGrad: 'from-amber-100/70 via-white to-orange-50/30 dark:from-amber-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-amber-300 dark:border-amber-700 hover:border-amber-400',
    flashcardBg: 'from-amber-50/50 via-white to-orange-50/30 dark:from-amber-950/20 dark:via-gray-900 dark:to-amber-950/20',
    textColor: 'text-amber-800 dark:text-amber-300',
    tagBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  },
  edu: {
    primaryHex: '#7C3AED',
    accentBorder: 'border-t-purple-500',
    headerGradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
    cardBorderHover: 'hover:border-purple-400 dark:hover:border-purple-600',
    badgeStyle: {
      light: 'bg-purple-50 text-purple-800 border-purple-200',
      dark: 'dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    },
    progressColor: '#7C3AED',
    subtopicHover: 'hover:bg-purple-50/70 dark:hover:bg-purple-950/40 hover:border-purple-200 dark:hover:border-purple-800/70 group-hover:text-purple-700 dark:group-hover:text-purple-300',
    buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25',
    drawerGrad: 'from-purple-100/70 via-white to-violet-50/30 dark:from-purple-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-purple-300 dark:border-purple-700 hover:border-purple-400',
    flashcardBg: 'from-purple-50/50 via-white to-violet-50/30 dark:from-purple-950/20 dark:via-gray-900 dark:to-purple-950/20',
    textColor: 'text-purple-700 dark:text-purple-300',
    tagBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
  },
  health: {
    primaryHex: '#E11D48',
    accentBorder: 'border-t-rose-500',
    headerGradient: 'from-rose-500/15 via-rose-500/5 to-transparent',
    cardBorderHover: 'hover:border-rose-400 dark:hover:border-rose-600',
    badgeStyle: {
      light: 'bg-rose-50 text-rose-800 border-rose-200',
      dark: 'dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    },
    progressColor: '#E11D48',
    subtopicHover: 'hover:bg-rose-50/70 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-800/70 group-hover:text-rose-700 dark:group-hover:text-rose-300',
    buttonPrimary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25',
    drawerGrad: 'from-rose-100/70 via-white to-red-50/30 dark:from-rose-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-rose-300 dark:border-rose-700 hover:border-rose-400',
    flashcardBg: 'from-rose-50/50 via-white to-red-50/30 dark:from-rose-950/20 dark:via-gray-900 dark:to-rose-950/20',
    textColor: 'text-rose-700 dark:text-rose-300',
    tagBg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
  },
  soc: {
    primaryHex: '#4F46E5',
    accentBorder: 'border-t-indigo-500',
    headerGradient: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
    cardBorderHover: 'hover:border-indigo-400 dark:hover:border-indigo-600',
    badgeStyle: {
      light: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      dark: 'dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    },
    progressColor: '#4F46E5',
    subtopicHover: 'hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800/70 group-hover:text-indigo-700 dark:group-hover:text-indigo-300',
    buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25',
    drawerGrad: 'from-indigo-100/70 via-white to-blue-50/30 dark:from-indigo-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-indigo-300 dark:border-indigo-700 hover:border-indigo-400',
    flashcardBg: 'from-indigo-50/50 via-white to-blue-50/30 dark:from-indigo-950/20 dark:via-gray-900 dark:to-indigo-950/20',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
  },
  urban: {
    primaryHex: '#0891B2',
    accentBorder: 'border-t-cyan-500',
    headerGradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    cardBorderHover: 'hover:border-cyan-400 dark:hover:border-cyan-600',
    badgeStyle: {
      light: 'bg-cyan-50 text-cyan-900 border-cyan-200',
      dark: 'dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
    },
    progressColor: '#0891B2',
    subtopicHover: 'hover:bg-cyan-50/70 dark:hover:bg-cyan-950/40 hover:border-cyan-200 dark:hover:border-cyan-800/70 group-hover:text-cyan-800 dark:group-hover:text-cyan-300',
    buttonPrimary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/25',
    drawerGrad: 'from-cyan-100/70 via-white to-blue-50/30 dark:from-cyan-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-cyan-300 dark:border-cyan-700 hover:border-cyan-400',
    flashcardBg: 'from-cyan-50/50 via-white to-blue-50/30 dark:from-cyan-950/20 dark:via-gray-900 dark:to-cyan-950/20',
    textColor: 'text-cyan-800 dark:text-cyan-300',
    tagBg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
  },
  travel: {
    primaryHex: '#0D9488',
    accentBorder: 'border-t-teal-500',
    headerGradient: 'from-teal-500/15 via-teal-500/5 to-transparent',
    cardBorderHover: 'hover:border-teal-400 dark:hover:border-teal-600',
    badgeStyle: {
      light: 'bg-teal-50 text-teal-900 border-teal-200',
      dark: 'dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    },
    progressColor: '#0D9488',
    subtopicHover: 'hover:bg-teal-50/70 dark:hover:bg-teal-950/40 hover:border-teal-200 dark:hover:border-teal-800/70 group-hover:text-teal-800 dark:group-hover:text-teal-300',
    buttonPrimary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25',
    drawerGrad: 'from-teal-100/70 via-white to-emerald-50/30 dark:from-teal-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-teal-300 dark:border-teal-700 hover:border-teal-400',
    flashcardBg: 'from-teal-50/50 via-white to-emerald-50/30 dark:from-teal-950/20 dark:via-gray-900 dark:to-teal-950/20',
    textColor: 'text-teal-800 dark:text-teal-300',
    tagBg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
  },
  life: {
    primaryHex: '#DB2777',
    accentBorder: 'border-t-pink-500',
    headerGradient: 'from-pink-500/15 via-pink-500/5 to-transparent',
    cardBorderHover: 'hover:border-pink-400 dark:hover:border-pink-600',
    badgeStyle: {
      light: 'bg-pink-50 text-pink-800 border-pink-200',
      dark: 'dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800',
    },
    progressColor: '#DB2777',
    subtopicHover: 'hover:bg-pink-50/70 dark:hover:bg-pink-950/40 hover:border-pink-200 dark:hover:border-pink-800/70 group-hover:text-pink-700 dark:group-hover:text-pink-300',
    buttonPrimary: 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/25',
    drawerGrad: 'from-pink-100/70 via-white to-rose-50/30 dark:from-pink-950/50 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-pink-300 dark:border-pink-700 hover:border-pink-400',
    flashcardBg: 'from-pink-50/50 via-white to-rose-50/30 dark:from-pink-950/20 dark:via-gray-900 dark:to-pink-950/20',
    textColor: 'text-pink-700 dark:text-pink-300',
    tagBg: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800',
  },
  gov: {
    primaryHex: '#475569',
    accentBorder: 'border-t-slate-500',
    headerGradient: 'from-slate-500/15 via-slate-500/5 to-transparent',
    cardBorderHover: 'hover:border-slate-400 dark:hover:border-slate-600',
    badgeStyle: {
      light: 'bg-slate-100 text-slate-800 border-slate-300',
      dark: 'dark:bg-slate-800/70 dark:text-slate-200 dark:border-slate-700',
    },
    progressColor: '#475569',
    subtopicHover: 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700/70 group-hover:text-slate-800 dark:group-hover:text-slate-200',
    buttonPrimary: 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-700/25',
    drawerGrad: 'from-slate-100/80 via-white to-gray-50/40 dark:from-slate-900/60 dark:via-gray-900 dark:to-gray-900',
    flashcardBorder: 'border-slate-300 dark:border-slate-700 hover:border-slate-400',
    flashcardBg: 'from-slate-100/50 via-white to-gray-100/30 dark:from-slate-900/30 dark:via-gray-900 dark:to-slate-900/30',
    textColor: 'text-slate-800 dark:text-slate-200',
    tagBg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
  },
}

export function getTopicTheme(majorId: string): TopicThemeConfig {
  const rootId = majorId.split('.')[0]
  return TOPIC_THEMES[rootId] || TOPIC_THEMES.env
}

export function TopicExplorer({
  setView,
  onStartTopicReview,
}: {
  setView?: (view: any) => void
  onStartTopicReview?: (topicId: string, topicName: string) => void
}) {
  const [topicsData, setTopicsData] = useState<MajorTopicStat[]>([])
  const [stats, setStats] = useState<{
    totalUserCards: number
    totalClassifiedCards: number
    totalUnclassifiedCards: number
    majorCount: number
  }>({
    totalUserCards: 0,
    totalClassifiedCards: 0,
    totalUnclassifiedCards: 0,
    majorCount: 10,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [isClustering, setIsClustering] = useState<boolean>(false)
  const [clusterToast, setClusterToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'due' | 'has_cards'>('all')
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<string>('ALL')

  // Subtopic Cards Drawer State
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubtopicStat | null>(null)
  const [selectedMajor, setSelectedMajor] = useState<MajorTopicStat | null>(null)
  const [drawerCards, setDrawerCards] = useState<TopicCardItem[]>([])
  const [loadingCards, setLoadingCards] = useState<boolean>(false)

  // Topic Sprint Review Modal State
  const [sprintTopic, setSprintTopic] = useState<{ id: string; name: string } | null>(null)
  const [sprintCards, setSprintCards] = useState<TopicCardItem[]>([])
  const [sprintIndex, setSprintIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean>(false)
  const [sprintComplete, setSprintComplete] = useState<boolean>(false)
  const [gradingLoading, setGradingLoading] = useState<boolean>(false)

  // Fetch Topics and User Progress
  const fetchTopics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/topics')
      if (res.ok) {
        const data = await res.json()
        setTopicsData(data.topics || [])
        setStats(data.stats || {
          totalUserCards: 0,
          totalClassifiedCards: 0,
          totalUnclassifiedCards: 0,
          majorCount: 10,
        })
      }
    } catch (e) {
      console.error('Failed to fetch topics:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  // Batch Auto-Cluster Action
  const handleAutoCluster = async () => {
    setIsClustering(true)
    setClusterToast({ message: 'Đang quét và phân loại từ vựng trong các Decks bằng AI...', type: 'info' })
    try {
      const res = await fetch('/api/topics/auto-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'all_decks', forceReclassify: false }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.newlyClassifiedCount > 0) {
          setClusterToast({
            message: `Thành công! Đã phân loại tự động ${data.newlyClassifiedCount} từ vựng vào cây chủ đề.`,
            type: 'success',
          })
        } else if (data.alreadyClassified) {
          setClusterToast({
            message: 'Tất cả từ vựng trong các Decks đã được phân loại vào đúng chủ đề!',
            type: 'success',
          })
        } else {
          setClusterToast({
            message: `Hoàn tất! Đã kiểm tra ${data.processedCount} từ vựng.`,
            type: 'info',
          })
        }
        await fetchTopics()
      } else {
        setClusterToast({ message: 'Không thể gom nhóm: ' + (data.error || 'Lỗi server'), type: 'error' })
      }
    } catch (err: any) {
      setClusterToast({ message: 'Lỗi mạng khi gom nhóm: ' + err.message, type: 'error' })
    } finally {
      setIsClustering(false)
      setTimeout(() => setClusterToast(null), 6000)
    }
  }

  // Open Subtopic Drawer
  const openSubtopicDrawer = async (sub: SubtopicStat, major: MajorTopicStat) => {
    setSelectedSubtopic(sub)
    setSelectedMajor(major)
    setLoadingCards(true)
    try {
      const res = await fetch(`/api/topics/${sub.id}/cards`)
      if (res.ok) {
        const data = await res.json()
        setDrawerCards(data.cards || [])
      }
    } catch (e) {
      console.error('Failed to fetch subtopic cards:', e)
    } finally {
      setLoadingCards(false)
    }
  }

  // Launch Topic Review - Transitions to the main Review page
  const launchTopicSprint = async (topicId: string, topicName: string) => {
    try {
      setSelectedSubtopic(null)

      if (onStartTopicReview) {
        onStartTopicReview(topicId, topicName)
        return
      }

      if (setView) {
        try {
          localStorage.setItem(
            'linguaflow_pending_topic_review',
            JSON.stringify({ id: topicId, name: topicName })
          )
        } catch {}
        setView('Review')
        return
      }

      // Standalone route fallback
      try {
        localStorage.setItem(
          'linguaflow_pending_topic_review',
          JSON.stringify({ id: topicId, name: topicName })
        )
        window.location.href = '/?view=Review'
      } catch {}
    } catch (e) {
      console.error('Failed to launch topic review:', e)
    }
  }

  // Handle Grade in Sprint
  const handleGradeSprint = async (rating: number) => {
    const card = sprintCards[sprintIndex]
    if (!card) return
    setGradingLoading(true)

    try {
      await fetch('/api/srs/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, rating }),
      })
    } catch {}

    setGradingLoading(false)
    if (sprintIndex + 1 < sprintCards.length) {
      setSprintIndex((prev) => prev + 1)
      setIsFlipped(false)
    } else {
      setSprintComplete(true)
      fetchTopics()
    }
  }

  // Audio speech playback helper
  const playAudio = (url?: string, text?: string) => {
    if (url) {
      const a = new Audio(url)
      a.play().catch(() => playSpeech(text))
    } else if (text) {
      playSpeech(text)
    }
  }

  const playSpeech = (text?: string) => {
    if (!text || typeof window === 'undefined') return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    window.speechSynthesis.speak(u)
  }

  // Render Lucide Icon by name
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Leaf': return <Leaf className={className} />
      case 'Cpu': return <Cpu className={className} />
      case 'Briefcase': return <Briefcase className={className} />
      case 'GraduationCap': return <GraduationCap className={className} />
      case 'HeartPulse': return <HeartPulse className={className} />
      case 'Landmark': return <Landmark className={className} />
      case 'Building2': return <Building2 className={className} />
      case 'Compass': return <Compass className={className} />
      case 'Smile': return <Smile className={className} />
      case 'Globe': return <Globe className={className} />
      default: return <Folder className={className} />
    }
  }

  // Filter topics
  const filteredTopics = useMemo(() => {
    return topicsData.filter((major) => {
      // Major topic filter
      if (selectedMajorFilter !== 'ALL' && major.id !== selectedMajorFilter) {
        return false
      }

      // Query filter
      const matchesSearch =
        searchQuery === '' ||
        major.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        major.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        major.subtopics.some(
          (s) =>
            s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nameVi.toLowerCase().includes(searchQuery.toLowerCase())
        )

      if (!matchesSearch) return false

      if (activeFilter === 'due') {
        return major.dueCards > 0
      }
      if (activeFilter === 'has_cards') {
        return major.totalCards > 0
      }

      return true
    })
  }, [topicsData, searchQuery, activeFilter, selectedMajorFilter])

  return (
    <div className="topic-explorer-page w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* 1. Header Banner & Executive Stats */}
      <div className="topic-hub-hero relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-300">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="topic-hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              TOPIC TAXONOMY • DUAL CLASSIFICATION ENGINE
            </div>
            <h1 className="topic-hero-title text-2xl md:text-3xl font-black tracking-tight">
              Bản Đồ Tri Thức Từ Vựng Theo Chủ Đề
            </h1>
            <p className="topic-hero-desc text-sm md:text-base leading-relaxed">
              Tự động gom nhóm toàn bộ từ vựng từ các Decks của bạn vào 10 Chủ đề Lớn và hơn 50 Chủ đề Nhỏ chuẩn Cambridge/IELTS Academic. Khi thêm từ mới vào deck, AI sẽ tự động phân loại ngay lập tức.
            </p>

            {/* Spectrum mini dots preview */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="topic-hero-label text-[11px] font-bold uppercase tracking-wider mr-1">Chủ đề:</span>
              {INITIAL_TOPICS.map((top) => {
                const th = getTopicTheme(top.id)
                return (
                  <span
                    key={top.id}
                    title={`${top.nameEn} (${top.nameVi})`}
                    className="topic-spectrum-pill inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-xs"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: th.primaryHex }} />
                    {top.nameEn.split('&')[0].trim()}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleAutoCluster}
              disabled={isClustering}
              className={`topic-cluster-btn inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-xl transition-all duration-200 ${
                isClustering ? 'is-clustering' : 'hover:scale-105 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isClustering ? 'animate-spin' : ''}`} />
              {isClustering ? 'Đang gom nhóm AI...' : '⚡ Quét & Gom Toàn Bộ Decks'}
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="topic-hero-stats-row grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t">
          <div className="topic-stat-box rounded-2xl p-3.5 text-center">
            <div className="topic-stat-label text-xs uppercase tracking-wider font-semibold">Tổng Từ Vựng</div>
            <div className="topic-stat-value text-2xl font-black mt-1">{stats.totalUserCards}</div>
          </div>
          <div className="topic-stat-box rounded-2xl p-3.5 text-center">
            <div className="topic-stat-label text-xs uppercase tracking-wider font-semibold">Đã Phân Loại</div>
            <div className="topic-stat-classified text-2xl font-black mt-1">
              {stats.totalClassifiedCards}
              <span className="topic-stat-percent text-xs font-normal ml-1">
                ({stats.totalUserCards > 0 ? Math.round((stats.totalClassifiedCards / stats.totalUserCards) * 100) : 100}%)
              </span>
            </div>
          </div>
          <div className="topic-stat-box rounded-2xl p-3.5 text-center">
            <div className="topic-stat-label text-xs uppercase tracking-wider font-semibold">Chưa Phân Loại</div>
            <div className="topic-stat-unclassified text-2xl font-black mt-1">{stats.totalUnclassifiedCards}</div>
          </div>
          <div className="topic-stat-box rounded-2xl p-3.5 text-center">
            <div className="topic-stat-label text-xs uppercase tracking-wider font-semibold">Chủ Đề Chuẩn Hóa</div>
            <div className="topic-stat-topics text-2xl font-black mt-1">10 Lớn • 50+ Nhỏ</div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {clusterToast && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-md transition-all ${
            clusterToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              : clusterToast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
              : 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {clusterToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {clusterToast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {clusterToast.type === 'info' && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />}
            <span className="text-sm font-medium">{clusterToast.message}</span>
          </div>
          <button onClick={() => setClusterToast(null)} className="text-sm opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="topic-search-icon w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo chủ đề, từ khóa (e.g. climate, ai, finance)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="topic-search-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none shadow-xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`topic-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeFilter === 'all' ? 'active' : ''
              }`}
            >
              Tất cả ({topicsData.length})
            </button>
            <button
              onClick={() => setActiveFilter('has_cards')}
              className={`topic-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeFilter === 'has_cards' ? 'active' : ''
              }`}
            >
              Có từ vựng của bạn
            </button>
            <button
              onClick={() => setActiveFilter('due')}
              className={`topic-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === 'due' ? 'active due-btn' : ''
              }`}
            >
              <Clock className="w-3 h-3 text-amber-500" /> Đến hạn ôn tập
            </button>
          </div>
        </div>

        {/* Major Topic Color Filter Chips with styled horizontal scrollbar & divider bar */}
        <div className="w-full pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-2.5 custom-horizontal-scrollbar">
            <button
              onClick={() => setSelectedMajorFilter('ALL')}
              className={`topic-all-themes-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                selectedMajorFilter === 'ALL' ? 'active' : ''
              }`}
            >
              Tất cả Themes
            </button>
            {topicsData.map((t) => {
              const th = getTopicTheme(t.id)
              const isSelected = selectedMajorFilter === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedMajorFilter(isSelected ? 'ALL' : t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? `${th.buttonPrimary} shadow-sm border-transparent scale-105`
                      : `${th.tagBg} hover:opacity-100 hover:scale-105 active:scale-95`
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: th.primaryHex }} />
                  <span>{t.nameEn.split('&')[0].trim()}</span>
                  <span className="opacity-75 font-normal">({t.totalCards})</span>
                </button>
              )
            })}
          </div>
          {/* Thanh ngang phân cách rõ ràng */}
          <div className="topic-horizontal-divider w-full h-0.5 mt-1" />
        </div>
      </div>

      {/* 3. Major Topics Grid */}
      {loading ? (
        <div className="text-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-gray-500">Đang tải bản đồ tri thức chủ đề...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 space-y-3">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-1" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Không tìm thấy chủ đề phù hợp</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Hãy thử tìm từ khóa khác hoặc bấm nút "Tất cả Themes" phía trên.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setActiveFilter('all')
              setSelectedMajorFilter('ALL')
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((major) => {
            const theme = getTopicTheme(major.id)
            return (
              <div
                key={major.id}
                className={`topic-card rounded-3xl border-2 border-t-4 ${theme.accentBorder} ${theme.cardBorderHover} shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group/card`}
              >
                {/* Card Header with Theme Gradient Tint */}
                <div className={`topic-card-header p-5 border-b bg-gradient-to-r ${theme.headerGradient} flex items-start justify-between gap-4`}>
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 transition-transform duration-300 group-hover/card:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.primaryHex}dd)`,
                        boxShadow: `0 6px 16px ${theme.primaryHex}35`,
                      }}
                    >
                      {renderIcon(major.icon, 'w-6 h-6')}
                    </div>
                    <div>
                      <h2 className="topic-card-title text-base font-black flex items-center gap-2">
                        {major.nameEn}
                      </h2>
                      <p className="topic-card-sub text-xs font-medium mt-0.5">{major.nameVi}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${theme.badgeStyle.light} ${theme.badgeStyle.dark}`}>
                      {major.totalCards} từ vựng
                    </span>
                    {major.dueCards > 0 && (
                      <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> {major.dueCards} cần ôn
                      </div>
                    )}
                  </div>
                </div>

                {/* Retention Progress Bar */}
                <div className="topic-retention-bar px-5 py-2.5 border-b flex items-center justify-between text-xs">
                  <span className="topic-retention-label font-medium">Độ nhớ vững (Mature):</span>
                  <div className="flex items-center gap-2.5">
                    <div className="topic-progress-track w-28 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${major.retentionRate}%`,
                          backgroundColor: theme.progressColor,
                        }}
                      />
                    </div>
                    <span className="topic-retention-value font-extrabold text-[11.5px]">{major.retentionRate}%</span>
                  </div>
                </div>

                {/* Subtopics List */}
                <div className="p-4 flex-1 space-y-2">
                  <div className="topic-subtopics-header text-[11px] font-bold uppercase tracking-wider px-1">
                    Chủ đề nhánh ({major.subtopics.length})
                  </div>
                  <div className="space-y-1.5">
                    {major.subtopics.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => openSubtopicDrawer(sub, major)}
                        className={`topic-subtopic-row group flex items-center justify-between p-2.5 rounded-xl border border-transparent cursor-pointer transition-all ${theme.subtopicHover}`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="topic-subtopic-title text-sm font-semibold transition-colors truncate">
                            {sub.nameEn}
                          </div>
                          <div className="topic-subtopic-vi text-xs truncate">{sub.nameVi}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {sub.cardCount > 0 ? (
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${theme.badgeStyle.light} ${theme.badgeStyle.dark}`}>
                              {sub.cardCount} từ
                            </span>
                          ) : (
                            <span className="topic-subtopic-empty text-xs">0 từ</span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="topic-card-footer p-4 border-t flex items-center justify-between gap-3">
                  <button
                    onClick={() => openSubtopicDrawer(major.subtopics[0], major)}
                    className={`topic-detail-btn text-xs font-bold flex items-center gap-1 transition-colors`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Xem chi tiết
                  </button>

                  <button
                    onClick={() => launchTopicSprint(major.id, major.nameEn)}
                    disabled={major.totalCards === 0}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      major.totalCards > 0
                        ? `${theme.buttonPrimary} hover:scale-105 active:scale-95`
                        : 'topic-review-btn-disabled'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" /> Ôn Tập ({major.totalCards})
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. Subtopic Detailed Cards Drawer (Modal) */}
      {selectedSubtopic && selectedMajor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {(() => {
            const majorTheme = getTopicTheme(selectedMajor.id)
            return (
              <div className="topic-drawer-modal rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border-2 overflow-hidden">
                {/* Drawer Header Styled in Major Theme */}
                <div className={`topic-drawer-header p-5 border-b flex items-start justify-between gap-4 bg-gradient-to-r ${majorTheme.drawerGrad}`}>
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${majorTheme.primaryHex}, ${majorTheme.primaryHex}dd)`,
                        boxShadow: `0 4px 12px ${majorTheme.primaryHex}35`,
                      }}
                    >
                      {renderIcon(selectedMajor.icon, 'w-5 h-5')}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider" style={{ color: majorTheme.primaryHex }}>
                        {selectedMajor.nameEn}
                      </div>
                      <h3 className="topic-drawer-title text-lg font-black flex items-center gap-2">
                        {selectedSubtopic.nameEn}
                      </h3>
                      <p className="topic-drawer-sub text-xs">{selectedSubtopic.nameVi}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => launchTopicSprint(selectedSubtopic.id, selectedSubtopic.nameEn)}
                      disabled={drawerCards.length === 0}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 ${majorTheme.buttonPrimary}`}
                    >
                      <Play className="w-3 h-3 fill-current" /> Luyện {drawerCards.length} từ
                    </button>
                    <button
                      onClick={() => setSelectedSubtopic(null)}
                      className="topic-drawer-close p-1.5 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Cards List Body */}
                <div className="topic-drawer-body p-5 flex-1 overflow-y-auto space-y-3">
                  {loadingCards ? (
                    <div className="py-16 text-center space-y-3">
                      <RefreshCw className="w-7 h-7 animate-spin mx-auto" style={{ color: majorTheme.primaryHex }} />
                      <p className="text-xs text-gray-500">Đang gom các thẻ từ vựng thuộc chủ đề này...</p>
                    </div>
                  ) : drawerCards.length === 0 ? (
                    <div className="topic-drawer-empty py-12 text-center rounded-2xl p-6 border border-dashed space-y-2">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <div className="text-sm font-bold">Chưa có từ vựng trong chủ đề này</div>
                      <p className="text-xs mt-1 max-w-sm mx-auto opacity-75">
                        Khi bạn thêm từ mới liên quan đến "{selectedSubtopic.nameEn}" vào bất kỳ Deck nào, hệ thống AI sẽ tự động gom vào đây!
                      </p>
                    </div>
                  ) : (
                    drawerCards.map((card) => (
                      <div
                        key={card.id}
                        className={`topic-drawer-card p-4 rounded-2xl border ${majorTheme.cardBorderHover} transition-colors space-y-2 shadow-xs`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="topic-card-term text-base font-bold">{card.term}</span>
                              {card.phonetic && <span className="topic-card-phonetic text-xs font-mono">{card.phonetic}</span>}
                              {card.cefrLevel && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${majorTheme.badgeStyle.light} ${majorTheme.badgeStyle.dark}`}>
                                  {card.cefrLevel}
                                </span>
                              )}
                              {card.partOfSpeech && (
                                <span className="topic-card-pos text-xs italic">({card.partOfSpeech})</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => playAudio(card.audioUrl, card.term)}
                              className="topic-audio-btn p-1 rounded-lg transition-colors"
                              style={{ color: majorTheme.primaryHex }}
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <span className="topic-deck-pill text-[11px] font-medium px-2 py-0.5 rounded-full">
                              Deck: {card.deckTitle}
                            </span>
                          </div>
                        </div>

                        <div className={`text-sm font-semibold`} style={{ color: majorTheme.primaryHex }}>
                          {card.vietnameseDefinition}
                        </div>

                        {card.exampleSentence && (
                          <div
                            className="topic-example-box text-xs italic p-2.5 rounded-xl border-l-3"
                            style={{ borderLeftColor: majorTheme.primaryHex }}
                          >
                            "{card.exampleSentence}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="topic-card-footer p-4 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>Hiển thị {drawerCards.length} thẻ từ các Decks cá nhân</span>
                  <button
                    onClick={() => setSelectedSubtopic(null)}
                    className="topic-detail-btn px-4 py-2 rounded-xl font-bold transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* 5. Topic SRS Sprint Review Modal */}
      {sprintTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          {(() => {
            const sprintTheme = getTopicTheme(sprintTopic.id)
            return (
              <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-800 relative">
                <button
                  onClick={() => setSprintTopic(null)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {sprintComplete ? (
                  <div className="py-10 text-center space-y-5">
                    <div
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg"
                      style={{
                        backgroundColor: `${sprintTheme.primaryHex}20`,
                        color: sprintTheme.primaryHex,
                      }}
                    >
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">Hoàn Thành Topic Sprint!</h3>
                      <p className="text-sm text-gray-500">
                        Bạn đã ôn luyện xong {sprintCards.length} từ vựng thuộc chủ đề "{sprintTopic.name}".
                      </p>
                    </div>
                    <button
                      onClick={() => setSprintTopic(null)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${sprintTheme.buttonPrimary}`}
                    >
                      Xong & Trở Về Bản Đồ Chủ Đề
                    </button>
                  </div>
                ) : sprintCards[sprintIndex] ? (
                  <div className="space-y-6">
                    {/* Sprint Progress */}
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <span className={`flex items-center gap-1.5 font-bold ${sprintTheme.textColor}`}>
                        <Zap className="w-4 h-4 fill-current" /> ÔN TẬP CHỦ ĐỀ: {sprintTopic.name}
                      </span>
                      <span className="font-bold text-gray-600 dark:text-gray-400">
                        {sprintIndex + 1} / {sprintCards.length}
                      </span>
                    </div>

                    {/* Flashcard Body Styled with Topic Theme */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={`min-h-[220px] p-6 rounded-3xl bg-gradient-to-br ${sprintTheme.flashcardBg} border-2 ${sprintTheme.flashcardBorder} shadow-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none`}
                    >
                      <div className={`text-xs uppercase font-black tracking-wider mb-2 ${sprintTheme.textColor}`}>
                        {sprintCards[sprintIndex].partOfSpeech || 'Word'}
                      </div>
                      <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
                        {sprintCards[sprintIndex].term}
                      </div>
                      {sprintCards[sprintIndex].phonetic && (
                        <div className="text-sm text-gray-400 font-mono mt-1">
                          {sprintCards[sprintIndex].phonetic}
                        </div>
                      )}

                      {isFlipped ? (
                        <div className="mt-5 space-y-3 animate-fadeIn">
                          <div className={`text-lg font-extrabold ${sprintTheme.textColor}`}>
                            {sprintCards[sprintIndex].vietnameseDefinition}
                          </div>
                          {sprintCards[sprintIndex].exampleSentence && (
                            <div className="text-xs italic text-gray-500 max-w-md px-4">
                              "{sprintCards[sprintIndex].exampleSentence}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-6 flex items-center gap-1 font-medium">
                          <RotateCcw className="w-3.5 h-3.5" /> Bấm vào thẻ để xem nghĩa & ví dụ
                        </div>
                      )}
                    </div>

                    {/* Flashcard Rating Controls */}
                    {isFlipped ? (
                      <div className="grid grid-cols-4 gap-2 pt-2 animate-fadeIn">
                        <button
                          onClick={() => handleGradeSprint(1)}
                          disabled={gradingLoading}
                          className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-colors"
                        >
                          Again (1)
                        </button>
                        <button
                          onClick={() => handleGradeSprint(2)}
                          disabled={gradingLoading}
                          className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-colors"
                        >
                          Hard (2)
                        </button>
                        <button
                          onClick={() => handleGradeSprint(3)}
                          disabled={gradingLoading}
                          className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-colors"
                        >
                          Good (3)
                        </button>
                        <button
                          onClick={() => handleGradeSprint(4)}
                          disabled={gradingLoading}
                          className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          Easy (4)
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsFlipped(true)}
                        className={`w-full py-3 rounded-2xl font-bold text-sm shadow-md transition-all ${sprintTheme.buttonPrimary}`}
                      >
                        Lật Thẻ (Xem Đáp Án)
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
