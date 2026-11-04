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

export function TopicExplorer({ setView }: { setView?: (view: any) => void }) {
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

  // Launch Topic Review Sprint
  const launchTopicSprint = async (topicId: string, topicName: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}/cards`)
      if (res.ok) {
        const data = await res.json()
        const cards = data.cards || []
        if (cards.length === 0) {
          alert('Chủ đề này chưa có từ vựng nào trong các decks của bạn.')
          return
        }
        setSprintTopic({ id: topicId, name: topicName })
        setSprintCards(cards)
        setSprintIndex(0)
        setIsFlipped(false)
        setSprintComplete(false)
      }
    } catch (e) {
      console.error('Failed to launch sprint:', e)
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
  }, [topicsData, searchQuery, activeFilter])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* 1. Header Banner & Executive Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              HIERARCHICAL TOPIC TAXONOMY • AI AUTO-CLUSTERING
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Bản Đồ Tri Thức Từ Vựng Theo Chủ Đề
            </h1>
            <p className="text-sm md:text-base text-emerald-100">
              Tự động gom nhóm toàn bộ từ vựng từ các Decks của bạn vào 10 Chủ đề Lớn và hơn 50 Chủ đề Nhỏ chuẩn Cambridge/IELTS. Khi thêm từ mới vào deck, AI sẽ tự động phân loại ngay lập tức.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleAutoCluster}
              disabled={isClustering}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 ${
                isClustering
                  ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed opacity-80'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 hover:shadow-xl hover:scale-105 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isClustering ? 'animate-spin' : ''}`} />
              {isClustering ? 'Đang gom nhóm AI...' : '⚡ Quét & Gom Toàn Bộ Decks'}
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <div className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Tổng Từ Vựng</div>
            <div className="text-2xl font-black mt-0.5">{stats.totalUserCards}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <div className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Đã Phân Loại</div>
            <div className="text-2xl font-black mt-0.5 text-amber-200">
              {stats.totalClassifiedCards}
              <span className="text-xs font-normal ml-1">
                ({stats.totalUserCards > 0 ? Math.round((stats.totalClassifiedCards / stats.totalUserCards) * 100) : 100}%)
              </span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <div className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Chưa Phân Loại</div>
            <div className="text-2xl font-black mt-0.5 text-emerald-100">{stats.totalUnclassifiedCards}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <div className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Chủ Đề Chuẩn Hóa</div>
            <div className="text-2xl font-black mt-0.5">10 Lớn • 50+ Nhỏ</div>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo chủ đề, từ khóa (e.g. climate, ai, finance)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Tất cả chủ đề (10)
          </button>
          <button
            onClick={() => setActiveFilter('has_cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'has_cards'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Có từ vựng của bạn
          </button>
          <button
            onClick={() => setActiveFilter('due')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeFilter === 'due'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-500" /> Đến hạn ôn tập
          </button>
        </div>
      </div>

      {/* 3. Major Topics Grid */}
      {loading ? (
        <div className="text-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm text-gray-500">Đang tải bản đồ tri thức chủ đề...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Không tìm thấy chủ đề phù hợp</h3>
          <p className="text-sm text-gray-500 mt-1">Hãy thử tìm từ khóa khác hoặc bấm "Quét & Gom Toàn Bộ Decks".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((major) => (
            <div
              key={major.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ backgroundColor: major.color }}
                  >
                    {renderIcon(major.icon, 'w-6 h-6')}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {major.nameEn}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{major.nameVi}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {major.totalCards} từ vựng
                  </span>
                  {major.dueCards > 0 && (
                    <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> {major.dueCards} cần ôn
                    </div>
                  )}
                </div>
              </div>

              {/* Retention Progress Bar */}
              <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-500">Độ nhớ vững (Mature):</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${major.retentionRate}%` }}
                    />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{major.retentionRate}%</span>
                </div>
              </div>

              {/* Subtopics List */}
              <div className="p-4 flex-1 space-y-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  Chủ đề nhánh ({major.subtopics.length})
                </div>
                <div className="space-y-1.5">
                  {major.subtopics.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => openSubtopicDrawer(sub, major)}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/60 cursor-pointer transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {sub.nameEn}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{sub.nameVi}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sub.cardCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {sub.cardCount} từ
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-gray-600">0 từ</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => openSubtopicDrawer(major.subtopics[0], major)}
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Xem chi tiết
                </button>

                <button
                  onClick={() => launchTopicSprint(major.id, major.nameEn)}
                  disabled={major.totalCards === 0}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    major.totalCards > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-105 active:scale-95'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" /> Ôn Tập Topic ({major.totalCards})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Subtopic Detailed Cards Drawer (Modal) */}
      {selectedSubtopic && selectedMajor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: selectedMajor.color }}
                >
                  {renderIcon(selectedMajor.icon, 'w-5 h-5')}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {selectedMajor.nameEn}
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {selectedSubtopic.nameEn}
                  </h3>
                  <p className="text-xs text-gray-500">{selectedSubtopic.nameVi}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => launchTopicSprint(selectedSubtopic.id, selectedSubtopic.nameEn)}
                  disabled={drawerCards.length === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" /> Luyện {drawerCards.length} từ
                </button>
                <button
                  onClick={() => setSelectedSubtopic(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cards List Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {loadingCards ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
                  <p className="text-xs text-gray-500">Đang gom các thẻ từ vựng thuộc chủ đề này...</p>
                </div>
              ) : drawerCards.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/40 rounded-xl p-6 border border-dashed border-gray-300 dark:border-gray-700">
                  <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Chưa có từ vựng trong chủ đề này</div>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Khi bạn thêm từ mới liên quan đến "{selectedSubtopic.nameEn}" vào bất kỳ Deck nào, hệ thống AI sẽ tự động gom vào đây!
                  </p>
                </div>
              ) : (
                drawerCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900 dark:text-gray-100">{card.term}</span>
                          {card.phonetic && <span className="text-xs text-gray-400 font-mono">{card.phonetic}</span>}
                          {card.cefrLevel && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                              {card.cefrLevel}
                            </span>
                          )}
                          {card.partOfSpeech && (
                            <span className="text-xs italic text-gray-500">({card.partOfSpeech})</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => playAudio(card.audioUrl, card.term)}
                          className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          Deck: {card.deckTitle}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      {card.vietnameseDefinition}
                    </div>

                    {card.exampleSentence && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border-l-2 border-emerald-500">
                        "{card.exampleSentence}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between text-xs text-gray-500">
              <span>Hiển thị {drawerCards.length} thẻ từ các Decks cá nhân</span>
              <button
                onClick={() => setSelectedSubtopic(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Topic SRS Sprint Review Modal */}
      {sprintTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative">
            <button
              onClick={() => setSprintTopic(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {sprintComplete ? (
              <div className="py-10 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  Xong & Trở Về Bản Đồ Chủ Đề
                </button>
              </div>
            ) : sprintCards[sprintIndex] ? (
              <div className="space-y-6">
                {/* Sprint Progress */}
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Zap className="w-4 h-4 fill-current" /> ÔN TẬP CHỦ ĐỀ: {sprintTopic.name}
                  </span>
                  <span>
                    {sprintIndex + 1} / {sprintCards.length}
                  </span>
                </div>

                {/* Flashcard Body */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="min-h-[220px] p-6 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-gray-850 dark:via-gray-900 dark:to-gray-850 border-2 border-emerald-200 dark:border-emerald-800/80 shadow-md flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-emerald-400 select-none"
                >
                  <div className="text-xs uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider mb-2">
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
                      <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                        {sprintCards[sprintIndex].vietnameseDefinition}
                      </div>
                      {sprintCards[sprintIndex].exampleSentence && (
                        <div className="text-xs italic text-gray-500 max-w-md px-4">
                          "{sprintCards[sprintIndex].exampleSentence}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-6 flex items-center gap-1">
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
                      className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800"
                    >
                      Again (1)
                    </button>
                    <button
                      onClick={() => handleGradeSprint(2)}
                      disabled={gradingLoading}
                      className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800"
                    >
                      Hard (2)
                    </button>
                    <button
                      onClick={() => handleGradeSprint(3)}
                      disabled={gradingLoading}
                      className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800"
                    >
                      Good (3)
                    </button>
                    <button
                      onClick={() => handleGradeSprint(4)}
                      disabled={gradingLoading}
                      className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800"
                    >
                      Easy (4)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                  >
                    Lật Thẻ (Xem Đáp Án)
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

