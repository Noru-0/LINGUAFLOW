'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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
  Grid,
  CheckSquare,
  Search,
  ArrowLeft,
  BookMarked,
  Users,
  Utensils,
  CloudRain,
  Compass,
  Trees,
  Building2,
  Music,
  Trophy,
  Film,
  Briefcase,
  Newspaper,
  MessageSquare,
  Smile,
  User,
  Heart,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  Award,
  Clock,
  CheckCheck,
  TrendingUp,
  CircleDot,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { INITIAL_COLLOCATIONS, InitialCollocation } from '@/lib/db/initial_collocations'

export interface UserProgressState {
  reps: number
  stability: number
  difficulty: number
  dueDate?: string
  lastReviewedAt?: string
  isLearned: boolean
  isMastered: boolean
  isDue: boolean
}

export interface CollocationItem {
  id: string
  category?: string
  head_word: string
  tail_chunk: string
  full_phrase: string
  meaning_vi: string
  example_sentence: string
  distractors?: string[]
  cefr_level: string
  ielts_topic: string
  user_progress?: UserProgressState | null
}

// Topic configuration dictionary with Unit numbers, Vietnamese titles & descriptions
const TOPIC_CONFIG: Record<
  string,
  {
    unitNum: number
    titleVi: string
    descVi: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    themeColor: string
    badgeBgLight: string
    badgeBgDark: string
  }
> = {
  'Introduction to Collocations': {
    unitNum: 1,
    titleVi: 'Giới Thiệu Về Collocations',
    descVi: 'Khái niệm, phân loại và tầm quan trọng của cụm từ cố định trong tiếng Anh.',
    icon: BookOpen,
    themeColor: 'text-indigo-600 dark:text-indigo-400',
    badgeBgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeBgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
  },
  'Types of Collocation': {
    unitNum: 2,
    titleVi: 'Các Cấu Trúc Collocation',
    descVi: 'Phân tích các dạng Tính + Danh, Động + Danh, Phó + Tính từ thường gặp.',
    icon: Layers,
    themeColor: 'text-cyan-600 dark:text-cyan-400',
    badgeBgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badgeBgDark: 'dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/60',
  },
  'Using your dictionary': {
    unitNum: 3,
    titleVi: 'Kỹ Năng Tra Từ Điển',
    descVi: 'Cách tra cứu và chọn lọc collocations chính xác từ từ điển người học.',
    icon: BookMarked,
    themeColor: 'text-blue-600 dark:text-blue-400',
    badgeBgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeBgDark: 'dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
  },
  'Learning Strategies': {
    unitNum: 4,
    titleVi: 'Chiến Lược Học & Ghi Nhớ',
    descVi: 'Phương pháp ghi chép, liên tưởng và xây dựng phản xạ cụm từ tự nhiên.',
    icon: Lightbulb,
    themeColor: 'text-amber-600 dark:text-amber-400',
    badgeBgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeBgDark: 'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  },
  'Everyday Verbs: Make/Do': {
    unitNum: 5,
    titleVi: 'Động Từ Make & Do',
    descVi: 'Quy tắc vàng phân biệt cụm từ đi với Make (tạo ra) và Do (hành động).',
    icon: Zap,
    themeColor: 'text-rose-600 dark:text-rose-400',
    badgeBgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeBgDark: 'dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  },
  'Everyday Verbs: Have/Take/Pay': {
    unitNum: 6,
    titleVi: 'Động Từ Have, Take & Pay',
    descVi: 'Have a word, Take action, Pay attention to... Các cụm từ tần suất cao.',
    icon: CreditCard,
    themeColor: 'text-purple-600 dark:text-purple-400',
    badgeBgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeBgDark: 'dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
  },
  'Everyday Verbs: Changes': {
    unitNum: 7,
    titleVi: 'Động Từ Diễn Tả Sự Thay Đổi',
    descVi: 'Cụm từ biểu đạt sự chuyển dịch trạng thái, tăng trưởng và cải biến.',
    icon: RefreshCw,
    themeColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeBgDark: 'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  'Everyday Verbs': {
    unitNum: 8,
    titleVi: 'Động Từ Sinh Hoạt Hàng Ngày',
    descVi: 'Give a call, run a bath, get into the habit... Cụm từ giao tiếp thường nhật.',
    icon: CheckSquare,
    themeColor: 'text-slate-600 dark:text-slate-300',
    badgeBgLight: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeBgDark: 'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  },
  'Intensifying Adverbs': {
    unitNum: 9,
    titleVi: 'Phó Từ Tăng Cường Cảm Xúc',
    descVi: 'Bitterly cold, highly unlikely, absolutely ridiculous... Nhấn mạnh sắc thái.',
    icon: Flame,
    themeColor: 'text-orange-600 dark:text-orange-400',
    badgeBgLight: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeBgDark: 'dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
  },
  'Topic: Physical Appearance': {
    unitNum: 10,
    titleVi: 'Ngoại Hình & Diện Mạo',
    descVi: 'Miêu tả khuôn mặt, vóc dáng, mái tóc, làn da và phong cách cá nhân.',
    icon: User,
    themeColor: 'text-pink-600 dark:text-pink-400',
    badgeBgLight: 'bg-pink-50 text-pink-700 border-pink-200',
    badgeBgDark: 'dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800/60',
  },
  'People: Character and Behaviour': {
    unitNum: 11,
    titleVi: 'Tính Cách & Cách Ứng Xử',
    descVi: 'Đặc điểm tính cách, thói quen, cách đối nhân xử thế và phẩm chất con người.',
    icon: Heart,
    themeColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    badgeBgLight: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    badgeBgDark: 'dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:border-fuchsia-800/60',
  },
  'Topic: Family & Relationships': {
    unitNum: 12,
    titleVi: 'Gia Đình & Quan Hệ Thân Tộc',
    descVi: 'Quan hệ huyết thống, nuôi dưỡng con cái, mái ấm và các sự kiện gia đình.',
    icon: Users,
    themeColor: 'text-green-600 dark:text-green-400',
    badgeBgLight: 'bg-green-50 text-green-700 border-green-200',
    badgeBgDark: 'dark:bg-green-950/60 dark:text-green-300 dark:border-green-800/60',
  },
  Relationships: {
    unitNum: 13,
    titleVi: 'Mối Quan Hệ Xã Hội & Tình Bạn',
    descVi: 'Tình bạn bè, kết giao đồng nghiệp, lòng tin và quan hệ đối tác.',
    icon: Users,
    themeColor: 'text-rose-600 dark:text-rose-400',
    badgeBgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeBgDark: 'dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  },
  'Houses, flats and rooms': {
    unitNum: 14,
    titleVi: 'Nhà Cửa & Không Gian Sống',
    descVi: 'Nội thất, căn hộ, phòng ốc, thiết kế và trang trí không gian sinh hoạt.',
    icon: Building2,
    themeColor: 'text-sky-600 dark:text-sky-400',
    badgeBgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeBgDark: 'dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
  },
  'Topic: Food & Drink': {
    unitNum: 15,
    titleVi: 'Ẩm Thực, Món Ăn & Đồ Uống',
    descVi: 'Món ăn nhanh, bữa ăn thịnh soạn, khẩu vị, chế biến và thói quen dinh dưỡng.',
    icon: Utensils,
    themeColor: 'text-amber-600 dark:text-amber-400',
    badgeBgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeBgDark: 'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  },
  'Topic: Weather': {
    unitNum: 16,
    titleVi: 'Thời Tiết & Hiện Tượng Tự Nhiên',
    descVi: 'Mưa bão, sương mù dày đặc, nhiệt độ khắc nghiệt và biến đổi khí hậu.',
    icon: CloudRain,
    themeColor: 'text-sky-600 dark:text-sky-400',
    badgeBgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeBgDark: 'dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
  },
  'Topic: Travel': {
    unitNum: 17,
    titleVi: 'Du Lịch, Hành Trình & Chuyến Đi',
    descVi: 'Hành trình, vé xe, khách sạn boutique, tham quan và trải nghiệm văn hóa.',
    icon: Compass,
    themeColor: 'text-teal-600 dark:text-teal-400',
    badgeBgLight: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeBgDark: 'dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
  },
  'Topic: Countryside': {
    unitNum: 18,
    titleVi: 'Miền Quê & Cảnh Quan Thiên Nhiên',
    descVi: 'Cảnh quan nông thôn, thung lũng, đồi núi, sông ngòi và cuộc sống yên bình.',
    icon: Trees,
    themeColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeBgDark: 'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  'Topic: Towns and Cities': {
    unitNum: 19,
    titleVi: 'Đô Thị, Phố Xá & Thành Phố',
    descVi: 'Đô thị mở rộng, nhịp sống sầm uất, tòa nhà cao tầng và giao thông thành phố.',
    icon: Building2,
    themeColor: 'text-indigo-600 dark:text-indigo-400',
    badgeBgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeBgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
  },
  'Topic: Music': {
    unitNum: 20,
    titleVi: 'Âm Nhạc, Giai Điệu & Biểu Diễn',
    descVi: 'Hòa nhạc, nhạc cụ, album âm nhạc, giai điệu bắt tai và các phong cách nhạc.',
    icon: Music,
    themeColor: 'text-purple-600 dark:text-purple-400',
    badgeBgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeBgDark: 'dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
  },
  'Topic: Sport': {
    unitNum: 21,
    titleVi: 'Thể Thao & Rèn Luyện Thể Chất',
    descVi: 'Sút phạt đền, quả phạt trực tiếp, thi đấu, phá kỷ lục và tinh thần thể thao.',
    icon: Trophy,
    themeColor: 'text-yellow-600 dark:text-yellow-400',
    badgeBgLight: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    badgeBgDark: 'dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800/60',
  },
  'Films and Books': {
    unitNum: 22,
    titleVi: 'Phim Ảnh & Sách Truyện',
    descVi: 'Cốt truyện lôi cuốn, dàn diễn viên, tác giả kinh điển và thể loại nghệ thuật.',
    icon: Film,
    themeColor: 'text-indigo-600 dark:text-indigo-400',
    badgeBgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeBgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
  },
  'Synonyms and confusable words': {
    unitNum: 23,
    titleVi: 'Từ Đồng Nghĩa & Cặp Từ Dễ Nhầm Lẫn',
    descVi: 'Phân biệt sắc thái biểu đạt tinh tế giữa các cụm từ đồng nghĩa trong ngữ cảnh.',
    icon: HelpCircle,
    themeColor: 'text-orange-600 dark:text-orange-400',
    badgeBgLight: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeBgDark: 'dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
  },
  Metaphor: {
    unitNum: 24,
    titleVi: 'Ẩn Dụ & Diễn Đạt Tượng Hình',
    descVi: 'Cụm từ ẩn dụ sâu sắc, cách dùng từ tượng hình trong văn phong báo chí & học thuật.',
    icon: Sparkles,
    themeColor: 'text-purple-600 dark:text-purple-400',
    badgeBgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeBgDark: 'dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
  },
  'Register: Business English': {
    unitNum: 25,
    titleVi: 'Tiếng Anh Thương Mại & Doanh Nghiệp',
    descVi: 'Huy động vốn, bỏ thầu dự án, đàm phán hợp đồng và khởi nghiệp kinh doanh.',
    icon: Briefcase,
    themeColor: 'text-slate-700 dark:text-slate-300',
    badgeBgLight: 'bg-slate-100 text-slate-700 border-slate-300',
    badgeBgDark: 'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  },
  'Register: Newspaper English': {
    unitNum: 26,
    titleVi: 'Văn Phong Báo Chí & Thời Sự',
    descVi: 'Cắt giảm chi tiêu, trấn áp tội phạm, tiêu đề tin tức và bình luận xã hội.',
    icon: Newspaper,
    themeColor: 'text-slate-700 dark:text-slate-300',
    badgeBgLight: 'bg-slate-100 text-slate-700 border-slate-300',
    badgeBgDark: 'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  },
  'Register: Spoken English': {
    unitNum: 27,
    titleVi: 'Tiếng Anh Giao Tiếp Hàng Ngày',
    descVi: 'Bored stiff, badly need... Khẩu ngữ tự nhiên và cách nói chuyện của người bản xứ.',
    icon: MessageSquare,
    themeColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeBgDark: 'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  'Emotions & Feelings': {
    unitNum: 28,
    titleVi: 'Cảm Xúc & Tâm Trạng',
    descVi: 'Desperately jealous, burst into tears... Bộc lộ cảm xúc vui buồn sâu lắng.',
    icon: Smile,
    themeColor: 'text-rose-600 dark:text-rose-400',
    badgeBgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeBgDark: 'dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  },
}

export type SortingGroupId =
  | 'make_do'
  | 'have_take_pay'
  | 'give_keep_set'
  | 'adverbs_intensity'
  | 'adjectives_contrast'
  | 'change_verbs'

interface SortingGroupConfig {
  id: SortingGroupId
  nameVi: string
  emoji: string
  buckets: string[]
  bucketColors: Record<string, string>
}

const SORTING_GROUPS: SortingGroupConfig[] = [
  {
    id: 'make_do',
    nameVi: 'Make vs Do',
    emoji: '🔴',
    buckets: ['make', 'do'],
    bucketColors: {
      make: 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700',
      do: 'text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700',
    },
  },
  {
    id: 'have_take_pay',
    nameVi: 'Have vs Take vs Pay',
    emoji: '🟣',
    buckets: ['have', 'take', 'pay'],
    bucketColors: {
      have: 'text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700',
      take: 'text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700',
      pay: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700',
    },
  },
  {
    id: 'give_keep_set',
    nameVi: 'Give vs Keep vs Set',
    emoji: '🟢',
    buckets: ['give', 'keep', 'set'],
    bucketColors: {
      give: 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700',
      keep: 'text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-700',
      set: 'text-cyan-600 dark:text-cyan-400 border-cyan-300 dark:border-cyan-700',
    },
  },
  {
    id: 'adverbs_intensity',
    nameVi: 'Phó Từ: Bitterly / Highly / Absolutely / Deeply',
    emoji: '🔥',
    buckets: ['bitterly', 'highly', 'absolutely', 'deeply'],
    bucketColors: {
      bitterly: 'text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700',
      highly: 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700',
      absolutely: 'text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700',
      deeply: 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700',
    },
  },
  {
    id: 'adjectives_contrast',
    nameVi: 'Tính Từ: Heavy / Strong / Powerful / Sharp',
    emoji: '⚡',
    buckets: ['heavy', 'strong', 'powerful', 'sharp'],
    bucketColors: {
      heavy: 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      strong: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700',
      powerful: 'text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700',
      sharp: 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700',
    },
  },
  {
    id: 'change_verbs',
    nameVi: 'Biến Đổi: Go / Get / Turn / Become',
    emoji: '🌊',
    buckets: ['go', 'get', 'turn', 'become'],
    bucketColors: {
      go: 'text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-700',
      get: 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700',
      turn: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700',
      become: 'text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-300 dark:border-fuchsia-700',
    },
  },
]

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
    return {
      before: sentence.substring(0, headIdx),
      phraseInSentence: sentence.substring(headIdx, tailIdx + tailChunk.length),
      after: sentence.substring(tailIdx + tailChunk.length),
    }
  }

  // 3. Fallback: split by first occurrence of head word
  if (headIdx !== -1) {
    return {
      before: sentence.substring(0, headIdx),
      phraseInSentence: sentence.substring(headIdx, headIdx + fullPhrase.length),
      after: sentence.substring(headIdx + fullPhrase.length),
    }
  }

  return {
    before: 'Please complete the sentence: ',
    phraseInSentence: fullPhrase,
    after: ` (${sentence})`,
  }
}

function generateHintPattern(phrase: string) {
  return phrase
    .split(' ')
    .map((word) => {
      if (word.length <= 2) return word
      return word[0] + '_'.repeat(word.length - 1)
    })
    .join(' ')
}

export function CollocationMatcher() {
  // Navigation View: 'hub' (List of Topics & SRS Review Hub) vs 'practice' (Active Learning / Review View)
  const [viewMode, setViewMode] = useState<'hub' | 'practice'>('hub')

  // Hub Tab: 'units' (Danh Sách 28 Bài Học) vs 'review_center' (Trung Tâm Ôn Tập SRS)
  const [hubTab, setHubTab] = useState<'units' | 'review_center'>('units')

  // Learning Mode: 'study' (Lượt học bài mới theo thứ tự bài học) vs 'review' (Ôn tập Spaced Repetition DSR)
  const [learningMode, setLearningMode] = useState<'study' | 'review'>('study')

  // Review Sub-Filter: 'all' (Tất cả từ đã học) | 'due' (Đến hạn hôm nay) | 'weak' (Cần củng cố / làm sai)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'due' | 'weak'>('all')

  // Track results of the current study/review session
  const [sessionStudyStats, setSessionStudyStats] = useState<{ correctFirstTry: number; wrongFirstTry: number }>({
    correctFirstTry: 0,
    wrongFirstTry: 0,
  })

  const [practiceMode, setPracticeMode] = useState<'context' | 'sorting' | 'matching'>('context')
  const [allCollocations, setAllCollocations] = useState<CollocationItem[]>([])
  const [globalStats, setGlobalStats] = useState({
    total: 346,
    learned: 0,
    mastered: 0,
    dueToday: 0,
    progressPercent: 0,
  })
  const [loading, setLoading] = useState(true)

  // Hub Search, Filter & Pagination
  const [hubSearch, setHubSearch] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'NOT_STARTED' | 'LEARNING' | 'MASTERED'>('ALL')
  const [hubCurrentPage, setHubCurrentPage] = useState<number>(1)
  const [topicsPerPage, setTopicsPerPage] = useState<number>(6)

  // ----------------------------------------------------
  // MODE 1 (Contextual Blank-filling) State
  // ----------------------------------------------------
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [userTypedAnswer, setUserTypedAnswer] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState<boolean>(false)
  const [showChoicesHint, setShowChoicesHint] = useState<boolean>(false)
  const [streak, setStreak] = useState<number>(0)
  const [inputMode, setInputMode] = useState<'choice' | 'typing'>('choice')
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [sessionCorrectIds, setSessionCorrectIds] = useState<Set<string>>(new Set())
  const [reviewSessionList, setReviewSessionList] = useState<CollocationItem[]>([])

  // Keyboard navigation & auto-focus refs
  const typingInputRef = useRef<HTMLInputElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  // ----------------------------------------------------
  // MODE 2 (Categorisation / Sorting) State
  // ----------------------------------------------------
  const [sortingGroup, setSortingGroup] = useState<SortingGroupId>('make_do')
  const [unassignedCards, setUnassignedCards] = useState<CollocationItem[]>([])
  const [sortedBuckets, setSortedBuckets] = useState<Record<string, CollocationItem[]>>({})
  const [selectedSortingCard, setSelectedSortingCard] = useState<CollocationItem | null>(null)
  const [sortingFeedback, setSortingFeedback] = useState<{ message: string; isSuccess: boolean } | null>(null)
  const [sortingCompleted, setSortingCompleted] = useState<boolean>(false)

  // ----------------------------------------------------
  // MODE 3 (Dual Column Matching) State
  // ----------------------------------------------------
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
        if (data.collocations && data.collocations.length > 0) {
          setAllCollocations(data.collocations)
        } else {
          setAllCollocations(INITIAL_COLLOCATIONS)
        }
        if (data.stats) {
          setGlobalStats(data.stats)
        }
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

  // Topics extraction and progress calculation per topic
  const topicsSummary = useMemo(() => {
    const map = new Map<
      string,
      { count: number; learnedCount: number; masteredCount: number; cefrLevels: Set<string>; samples: string[] }
    >()

    allCollocations.forEach((c) => {
      const cat = c.category || c.ielts_topic || 'General'
      if (!map.has(cat)) {
        map.set(cat, { count: 0, learnedCount: 0, masteredCount: 0, cefrLevels: new Set(), samples: [] })
      }
      const entry = map.get(cat)!
      entry.count += 1
      if (c.user_progress?.isLearned) entry.learnedCount += 1
      if (c.user_progress?.isMastered) entry.masteredCount += 1
      if (c.cefr_level) entry.cefrLevels.add(c.cefr_level)
      if (entry.samples.length < 3) {
        entry.samples.push(c.full_phrase)
      }
    })

    return Array.from(map.entries())
      .map(([topicKey, data]) => {
        const meta = TOPIC_CONFIG[topicKey] || {
          unitNum: 99,
          titleVi: topicKey,
          descVi: `Các cụm từ theo chủ đề ${topicKey}.`,
          icon: BookOpen,
          themeColor: 'text-indigo-600 dark:text-indigo-400',
          badgeBgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          badgeBgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
        }
        const levels = Array.from(data.cefrLevels).sort()
        const levelLabel = levels.length > 0 ? levels.join(' • ') : 'B1-B2'
        const percent = data.count > 0 ? Math.round((data.learnedCount / data.count) * 100) : 0

        let status: 'NOT_STARTED' | 'LEARNING' | 'MASTERED' = 'NOT_STARTED'
        if (percent === 100) status = 'MASTERED'
        else if (data.learnedCount > 0) status = 'LEARNING'

        return {
          topicKey,
          unitNum: meta.unitNum,
          titleVi: meta.titleVi,
          titleEn: topicKey,
          descVi: meta.descVi,
          icon: meta.icon,
          themeColor: meta.themeColor,
          badgeBgLight: meta.badgeBgLight,
          badgeBgDark: meta.badgeBgDark,
          count: data.count,
          learnedCount: data.learnedCount,
          masteredCount: data.masteredCount,
          progressPercent: percent,
          status,
          levelLabel,
          samples: data.samples,
        }
      })
      .sort((a, b) => a.unitNum - b.unitNum)
  }, [allCollocations])

  const [isUnitFinished, setIsUnitFinished] = useState<boolean>(false)

  // Filtered & Sorted List:
  // - In 'study' mode: strictly sequential order of the unit (no SRS shuffle)
  // - In 'review' mode: uses stable snapshot initialized when starting the review session
  const filteredList = useMemo(() => {
    if (learningMode === 'review') {
      return reviewSessionList
    }

    // Mode 1: Lượt học bài mới (Tuần tự bài học từ câu 1 đến hết)
    return allCollocations.filter((item) => {
      const matchTopic =
        selectedTopic === 'ALL' ||
        item.category === selectedTopic ||
        item.ielts_topic === selectedTopic ||
        (item as any).topic === selectedTopic
      const matchLevel = selectedLevel === 'ALL' || item.cefr_level === selectedLevel
      return matchTopic && matchLevel
    })
  }, [selectedTopic, selectedLevel, allCollocations, learningMode, reviewSessionList])

  const currentItem = filteredList[currentIndex] || filteredList[0] || null

  // Start Initial Study for a Unit (supports resuming directly from first unlearned question)
  const handleStartStudy = (topicKey: string, resume: boolean = true) => {
    setSelectedTopic(topicKey)
    setLearningMode('study')
    setSessionCorrectIds(new Set())

    let startIndex = 0
    if (resume) {
      const unitItems = allCollocations.filter(
        (c) =>
          topicKey === 'ALL' ||
          c.category === topicKey ||
          c.ielts_topic === topicKey ||
          (c as any).topic === topicKey
      )
      const listToUse =
        selectedLevel === 'ALL'
          ? unitItems
          : unitItems.filter((c) => c.cefr_level === selectedLevel).length > 0
          ? unitItems.filter((c) => c.cefr_level === selectedLevel)
          : unitItems

      const firstUnlearned = listToUse.findIndex((c) => !c.user_progress?.isLearned)
      if (firstUnlearned > 0) {
        startIndex = firstUnlearned
      }
    }

    setCurrentIndex(startIndex)
    setBatchIndex(0)
    setSessionStudyStats({ correctFirstTry: 0, wrongFirstTry: 0 })
    setIsUnitFinished(false)
    setViewMode('practice')
  }

  // Start Spaced Repetition Review (All learned or single Unit with stable session snapshot)
  const handleStartReview = (topicKey: string = 'ALL', filter: 'all' | 'due' | 'weak' = 'all') => {
    setSelectedTopic(topicKey)
    setLearningMode('review')
    setReviewFilter(filter)

    // Build the prioritized review queue snapshot for this session
    const list = allCollocations.filter((item) => {
      const matchTopic =
        topicKey === 'ALL' ||
        item.category === topicKey ||
        item.ielts_topic === topicKey ||
        (item as any).topic === topicKey
      const matchLevel = selectedLevel === 'ALL' || item.cefr_level === selectedLevel
      return matchTopic && matchLevel
    })

    let reviewPool = list.filter((item) => item.user_progress?.isLearned)

    if (filter === 'due') {
      const dues = reviewPool.filter((item) => item.user_progress?.isDue)
      if (dues.length > 0) reviewPool = dues
    } else if (filter === 'weak') {
      const weaks = reviewPool.filter((item) => (item.user_progress?.stability || 0) < 2)
      if (weaks.length > 0) reviewPool = weaks
    }

    if (reviewPool.length === 0 && list.some((i) => i.user_progress?.isLearned)) {
      reviewPool = list.filter((item) => item.user_progress?.isLearned)
    }

    // Sort by Spaced Repetition priority stably for this session
    const sortedQueue = [...reviewPool].sort((a, b) => {
      // 1. Due items first
      if (a.user_progress?.isDue && !b.user_progress?.isDue) return -1
      if (!a.user_progress?.isDue && b.user_progress?.isDue) return 1

      // 2. Lowest stability next
      const aStab = a.user_progress?.stability || 0
      const bStab = b.user_progress?.stability || 0
      if (aStab !== bStab) return aStab - bStab

      return (a.user_progress?.reps || 0) - (b.user_progress?.reps || 0)
    })

    setReviewSessionList(sortedQueue)
    setSessionCorrectIds(new Set())
    setCurrentIndex(0)
    setBatchIndex(0)
    setSessionStudyStats({ correctFirstTry: 0, wrongFirstTry: 0 })
    setIsUnitFinished(false)
    setViewMode('practice')
  }

  // Navigation helpers (Automatically skip already answered questions in study mode)
  const goToNextQuestion = useCallback(() => {
    if (filteredList.length === 0) return

    if (learningMode === 'study') {
      // Find the next unlearned question after current index
      let nextUnlearnedIdx = -1
      for (let i = currentIndex + 1; i < filteredList.length; i++) {
        if (!filteredList[i].user_progress?.isLearned) {
          nextUnlearnedIdx = i
          break
        }
      }

      if (nextUnlearnedIdx !== -1) {
        setIsUnitFinished(false)
        setCurrentIndex(nextUnlearnedIdx)
      } else {
        // Check if there are any unlearned questions earlier in the unit
        const anyUnlearnedIdx = filteredList.findIndex((item) => !item.user_progress?.isLearned)
        if (anyUnlearnedIdx !== -1 && anyUnlearnedIdx !== currentIndex) {
          setIsUnitFinished(false)
          setCurrentIndex(anyUnlearnedIdx)
        } else {
          // All questions in this unit are completed!
          setIsUnitFinished(true)
        }
      }
    } else {
      if (currentIndex >= filteredList.length - 1) {
        setIsUnitFinished(true)
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    }
  }, [filteredList, currentIndex, learningMode])

  const goToPrevQuestion = useCallback(() => {
    if (filteredList.length === 0) return
    setIsUnitFinished(false)

    if (learningMode === 'study') {
      // Find the previous unlearned question before current index
      let prevUnlearnedIdx = -1
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (!filteredList[i].user_progress?.isLearned) {
          prevUnlearnedIdx = i
          break
        }
      }

      if (prevUnlearnedIdx !== -1) {
        setCurrentIndex(prevUnlearnedIdx)
      } else {
        setCurrentIndex((prev) => Math.max(0, prev - 1))
      }
    } else {
      setCurrentIndex((prev) => Math.max(0, prev - 1))
    }
  }, [filteredList, currentIndex, learningMode])

  // Move to next unit in topics order
  const handleNextUnit = useCallback(() => {
    const currentTopicIdx = topicsSummary.findIndex((t) => t.topicKey === selectedTopic)
    if (currentTopicIdx !== -1 && currentTopicIdx < topicsSummary.length - 1) {
      const nextTopicKey = topicsSummary[currentTopicIdx + 1].topicKey
      handleStartStudy(nextTopicKey)
    } else {
      setViewMode('hub')
    }
  }, [topicsSummary, selectedTopic])

  // Reset finished state when changing topic or level
  useEffect(() => {
    setIsUnitFinished(false)
  }, [selectedTopic, selectedLevel])

  // Generate 4 candidate options for context mode (Only runs when question index or target item changes)
  useEffect(() => {
    if (!currentItem || allCollocations.length === 0) return

    const correctPhrase = currentItem.full_phrase
    let fourChoices: string[] = []

    if (currentItem.distractors && currentItem.distractors.length >= 3) {
      fourChoices = [correctPhrase, ...currentItem.distractors.slice(0, 3)].sort(() => Math.random() - 0.5)
    } else {
      const sameCategory = allCollocations.filter(
        (i) => i.id !== currentItem.id && (i.category === currentItem.category || i.head_word === currentItem.head_word)
      )
      const otherItems = sameCategory.length >= 3 ? sameCategory : allCollocations.filter((i) => i.id !== currentItem.id)
      const randomThree = [...otherItems].sort(() => Math.random() - 0.5).slice(0, 3)
      fourChoices = [correctPhrase, ...randomThree.map((i) => i.full_phrase)].sort(() => Math.random() - 0.5)
    }

    setOptions(fourChoices)
    setSelectedOption(null)
    setUserTypedAnswer('')
    setIsAnswered(false)
    setIsCorrect(null)
    setShowHint(false)
    setShowChoicesHint(false)
    setQuestionStartTime(Date.now())
  }, [currentItem?.id, currentIndex, selectedTopic, selectedLevel])

  // Auto-focus input on question load
  useEffect(() => {
    if (!isAnswered && (learningMode === 'review' || inputMode === 'typing') && viewMode === 'practice' && !isUnitFinished) {
      const timer = setTimeout(() => {
        typingInputRef.current?.focus()
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, isAnswered, learningMode, inputMode, viewMode, isUnitFinished])

  // Auto-focus next question button after answer submission (allows manual click / space / enter when ready)
  useEffect(() => {
    if (isAnswered && viewMode === 'practice' && !isUnitFinished) {
      const timer = setTimeout(() => {
        nextButtonRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isAnswered, viewMode, isUnitFinished])

  // Setup Sorting Mode
  const setupSortingCards = (groupId: SortingGroupId) => {
    const groupDef = SORTING_GROUPS.find((g) => g.id === groupId) || SORTING_GROUPS[0]
    const targetBuckets = groupDef.buckets

    const pool = allCollocations.filter((c) => {
      const h = c.head_word.toLowerCase().trim()
      const p = c.full_phrase.toLowerCase().trim()
      return targetBuckets.some((b) => h === b || p.startsWith(`${b} `))
    })

    const initialBuckets: Record<string, CollocationItem[]> = {}
    targetBuckets.forEach((b) => {
      initialBuckets[b] = []
    })
    setSortedBuckets(initialBuckets)

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10)
    setUnassignedCards(shuffled)
    setSelectedSortingCard(null)
    setSortingFeedback(null)
    setSortingCompleted(false)
  }

  useEffect(() => {
    if (practiceMode === 'sorting' && allCollocations.length > 0) {
      setupSortingCards(sortingGroup)
    }
  }, [practiceMode, sortingGroup, allCollocations])

  // Setup Dual-Column Matching Batch
  const setupMatchingBatch = (list: CollocationItem[], bIndex: number) => {
    const start = bIndex * BATCH_SIZE
    const batch = list.slice(start, start + BATCH_SIZE)
    if (batch.length === 0) return

    setCurrentBatch(batch)
    const shuffledHeads = [...batch.map((i) => i.head_word)].sort(() => Math.random() - 0.5)
    const shuffledTails = [...batch.map((i) => i.tail_chunk)].sort(() => Math.random() - 0.5)
    setHeads(shuffledHeads)
    setTails(shuffledTails)
    setSelectedHead(null)
    setSelectedTail(null)
    setMatchedIds([])
    setFailedAttempts(new Set())
    setMatchFeedback(null)
  }

  useEffect(() => {
    if (practiceMode === 'matching' && filteredList.length > 0) {
      setupMatchingBatch(filteredList, batchIndex)
    }
  }, [practiceMode, filteredList, batchIndex])

  // TTS audio helper
  const playAudio = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  // Update item progress locally in state
  const updateLocalItemProgress = (collocationId: string, isCorrectGrade: boolean) => {
    setAllCollocations((prev) =>
      prev.map((item) => {
        if (item.id === collocationId) {
          const currentReps = item.user_progress?.reps || 0
          const newReps = isCorrectGrade ? currentReps + 1 : Math.max(0, currentReps - 1)
          return {
            ...item,
            user_progress: {
              reps: newReps,
              stability: isCorrectGrade ? (item.user_progress?.stability || 1) + 2 : 1,
              difficulty: item.user_progress?.difficulty || 0.3,
              isLearned: newReps > 0,
              isMastered: newReps >= 3,
              isDue: false,
              lastReviewedAt: new Date().toISOString(),
            },
          }
        }
        return item
      })
    )

    setGlobalStats((prev) => {
      const targetItem = allCollocations.find((i) => i.id === collocationId)
      const wasLearned = targetItem?.user_progress?.isLearned || false
      const newLearned = !wasLearned && isCorrectGrade ? prev.learned + 1 : prev.learned
      return {
        ...prev,
        learned: newLearned,
        progressPercent: prev.total > 0 ? Math.round((newLearned / prev.total) * 100) : 0,
      }
    })
  }

  // Handle Context Answer Submit
  const handleCheckContextAnswer = (answerText: string) => {
    if (isAnswered || !currentItem) return

    const correct = currentItem.full_phrase.trim().toLowerCase()
    const submitted = answerText.trim().toLowerCase()
    const isAnsCorrect = submitted === correct

    setIsAnswered(true)
    setIsCorrect(isAnsCorrect)

    if (isAnsCorrect) {
      setStreak((prev) => prev + 1)
      setSessionCorrectIds((prev) => new Set(prev).add(currentItem.id))
      playAudio(currentItem.full_phrase)
    } else {
      setStreak(0)
    }

    updateLocalItemProgress(currentItem.id, isAnsCorrect)

    // DSR Grade Recording
    const timeSpentMs = Date.now() - questionStartTime
    let dsrRating = 3
    if (!isAnsCorrect) {
      dsrRating = 1
    } else if (timeSpentMs < 3000 && !showHint) {
      dsrRating = 4
    } else if (showHint || timeSpentMs > 10000) {
      dsrRating = 2
    }

    fetch('/api/collocations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collocationId: currentItem.id,
        rating: dsrRating,
      }),
    }).catch(() => {})
  }

  // Handle Sorting Card Placement
  const handlePlaceCardIntoBucket = (bucketKey: string) => {
    if (!selectedSortingCard) return

    const head = selectedSortingCard.head_word.toLowerCase().trim()
    const phrase = selectedSortingCard.full_phrase.toLowerCase().trim()
    const isMatch = head === bucketKey || phrase.startsWith(`${bucketKey} `)

    if (isMatch) {
      setSortedBuckets((prev) => ({
        ...prev,
        [bucketKey]: [...prev[bucketKey], selectedSortingCard],
      }))
      const nextUnassigned = unassignedCards.filter((c) => c.id !== selectedSortingCard.id)
      setUnassignedCards(nextUnassigned)
      setSelectedSortingCard(null)
      setSortingFeedback({ message: `Chính xác! "${selectedSortingCard.full_phrase}" thuộc nhóm "${bucketKey}".`, isSuccess: true })
      playAudio(selectedSortingCard.full_phrase)

      if (nextUnassigned.length === 0) {
        setSortingCompleted(true)
      }

      updateLocalItemProgress(selectedSortingCard.id, true)

      fetch('/api/collocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collocationId: selectedSortingCard.id, rating: 3 }),
      }).catch(() => {})
    } else {
      setSortingFeedback({
        message: `Chưa đúng! "${selectedSortingCard.full_phrase}" không thuộc nhóm "${bucketKey}". Hãy thử lại!`,
        isSuccess: false,
      })
      updateLocalItemProgress(selectedSortingCard.id, false)
      fetch('/api/collocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collocationId: selectedSortingCard.id, rating: 1 }),
      }).catch(() => {})
    }
  }

  // Handle Dual-Column Match Selection
  useEffect(() => {
    if (selectedHead && selectedTail && practiceMode === 'matching') {
      const match = currentBatch.find((item) => item.head_word === selectedHead && item.tail_chunk === selectedTail)

      if (match) {
        setMatchedIds((prev) => [...prev, match.id])
        setMatchFeedback(`✅ Khớp thành công: "${match.full_phrase}" (${match.meaning_vi})`)
        playAudio(match.full_phrase)

        const isFirstTry = !failedAttempts.has(match.id)
        updateLocalItemProgress(match.id, isFirstTry)

        fetch('/api/collocations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collocationId: match.id, rating: isFirstTry ? 3 : 1 }),
        }).catch(() => {})
      } else {
        const targetCard = currentBatch.find((i) => i.head_word === selectedHead)
        if (targetCard) {
          setFailedAttempts((prev) => new Set(prev).add(targetCard.id))
          updateLocalItemProgress(targetCard.id, false)
        }
        setMatchFeedback(`❌ Chưa đúng! Thử ghép lại với từ "${selectedHead}".`)
      }
      setSelectedHead(null)
      setSelectedTail(null)
    }
  }, [selectedHead, selectedTail, currentBatch, practiceMode])

  // Filter topics on Hub by search query and progress status
  const filteredTopics = useMemo(() => {
    let result = topicsSummary

    if (selectedStatusFilter !== 'ALL') {
      result = result.filter((t) => t.status === selectedStatusFilter)
    }

    if (hubSearch.trim()) {
      const q = hubSearch.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.titleVi.toLowerCase().includes(q) ||
          t.titleEn.toLowerCase().includes(q) ||
          t.descVi.toLowerCase().includes(q) ||
          t.samples.some((s) => s.toLowerCase().includes(q))
      )
    }

    return result
  }, [topicsSummary, hubSearch, selectedStatusFilter])

  // Reset pagination when search query or filter changes
  useEffect(() => {
    setHubCurrentPage(1)
  }, [hubSearch, selectedStatusFilter])

  // Paginated topics for Hub view
  const totalHubPages = Math.ceil(filteredTopics.length / topicsPerPage) || 1
  const paginatedTopics = useMemo(() => {
    const start = (hubCurrentPage - 1) * topicsPerPage
    return filteredTopics.slice(start, start + topicsPerPage)
  }, [filteredTopics, hubCurrentPage, topicsPerPage])

  // Current topic progress in practice mode
  const currentTopicStats = useMemo(() => {
    const totalInTopic = filteredList.length
    const learnedInTopic = filteredList.filter((i) => i.user_progress?.isLearned).length
    const percent = totalInTopic > 0 ? Math.round((learnedInTopic / totalInTopic) * 100) : 0
    return { totalInTopic, learnedInTopic, percent }
  }, [filteredList])

  // Start practicing a selected topic
  const handleSelectTopicToLearn = (topicKey: string) => {
    setSelectedTopic(topicKey)
    setCurrentIndex(0)
    setBatchIndex(0)
    setViewMode('practice')
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[360px] gap-3">
        <RefreshCw className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Đang nạp 346 Collocations Cambridge & tiến độ học tập...</span>
      </div>
    )
  }

  // =========================================================================
  // VIEW 1: TOPIC HUB / LIST OF UNITS (MÀN HÌNH CHỌN CHỦ ĐỀ & TIẾN ĐỘ TỔNG QUAN)
  // =========================================================================
  if (viewMode === 'hub') {
    const weakCollocationsCount = allCollocations.filter(
      (i) => i.user_progress?.isLearned && (i.user_progress?.stability || 0) < 2
    ).length

    const learnedTopics = topicsSummary.filter((t) => t.learnedCount > 0)

    return (
      <div className="max-w-5xl mx-auto py-2 pb-10 select-none">
        {/* Hub Hero Banner with Progress Overview */}
        <div className="colloc-hub-hero relative overflow-hidden rounded-3xl p-7 sm:p-8 mb-6 border text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-indigo-200 dark:text-indigo-300 uppercase bg-white/10 dark:bg-slate-800/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                <Zap size={13} className="text-amber-400" /> CAMBRIDGE ENGLISH COLLOCATIONS IN USE
              </span>

              {/* Main Hub Tabs: 1. Học Bài Mới vs 2. Trung Tâm Ôn Tập SRS */}
              <div className="flex items-center gap-1 bg-black/25 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setHubTab('units')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    hubTab === 'units'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <BookOpen size={14} /> 1. Danh Sách Bài Học ({topicsSummary.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHubTab('review_center')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    hubTab === 'review_center'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sparkles size={14} className="text-amber-400" /> 2. Ôn Tập Thông Minh (SRS)
                  {globalStats.dueToday > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-extrabold">
                      {globalStats.dueToday}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight text-white">
              {hubTab === 'units'
                ? 'Danh Sách 28 Bài Học & Tiến Độ Học Mới'
                : 'Trung Tâm Ôn Tập Lặp Lại Ngắt Quãng (Spaced Repetition)'}
            </h1>
            <p className="text-sm text-indigo-100 dark:text-slate-200 max-w-2xl leading-relaxed mb-5">
              {hubTab === 'units'
                ? 'Học bài mới tuần tự từng câu theo đúng giáo trình chuẩn Cambridge. Sau khi học xong 1 lượt, bạn có thể chuyển sang chế độ Ôn tập SRS.'
                : 'Luyện tập củng cố trí nhớ dài hạn dựa trên kết quả đúng/sai ở lần học đầu. Các từ làm sai hoặc khó sẽ được ưu tiên ôn trước.'}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <div className="bg-white/10 dark:bg-slate-800/50 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-lg sm:text-xl font-extrabold text-white">{globalStats.total} cụm</div>
                <div className="text-[11px] text-indigo-100 dark:text-slate-300 font-semibold">Tổng 28 Bài Học</div>
              </div>
              <div className="bg-white/10 dark:bg-slate-800/50 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-lg sm:text-xl font-extrabold text-emerald-300">{globalStats.learned} cụm</div>
                <div className="text-[11px] text-indigo-100 dark:text-slate-300 font-semibold">Đã hoàn thành lượt đầu</div>
              </div>
              <div className="bg-white/10 dark:bg-slate-800/50 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-lg sm:text-xl font-extrabold text-amber-300">{globalStats.dueToday} cụm</div>
                <div className="text-[11px] text-indigo-100 dark:text-slate-300 font-semibold">⏰ Đến hạn ôn hôm nay</div>
              </div>
              <div className="bg-white/10 dark:bg-slate-800/50 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-lg sm:text-xl font-extrabold text-rose-300">{weakCollocationsCount} cụm</div>
                <div className="text-[11px] text-indigo-100 dark:text-slate-300 font-semibold">🔴 Cần củng cố (Làm sai)</div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: 28 UNITS LIST (HỌC BÀI MỚI TUẦN TỰ)          */}
        {/* ==================================================== */}
        {hubTab === 'units' && (
          <div>
            {/* Search, Filter & Per-Page Controls */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm chủ đề (ví dụ: Make/Do, Thời tiết, Du lịch, Unit 5...)"
                    value={hubSearch}
                    onChange={(e) => setHubSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-xs transition-colors"
                  />
                  {hubSearch && (
                    <button
                      type="button"
                      onClick={() => setHubSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span>Hiển thị:</span>
                    <select
                      value={topicsPerPage}
                      onChange={(e) => {
                        setTopicsPerPage(Number(e.target.value))
                        setHubCurrentPage(1)
                      }}
                      className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value={6} className="dark:bg-slate-800">6 / trang</option>
                      <option value={9} className="dark:bg-slate-800">9 / trang</option>
                      <option value={12} className="dark:bg-slate-800">12 / trang</option>
                      <option value={28} className="dark:bg-slate-800">Tất cả (28)</option>
                    </select>
                  </div>

                  {/* Switch to SRS Review Button */}
                  <button
                    type="button"
                    onClick={() => setHubTab('review_center')}
                    className="colloc-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                  >
                    <Sparkles size={14} className="text-amber-500" /> Trung tâm ôn tập SRS
                  </button>
                </div>
              </div>

              {/* Progress Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[11px] mr-1">Lọc theo tiến độ:</span>
                {[
                  { id: 'ALL', label: 'Tất cả chủ đề', count: topicsSummary.length },
                  { id: 'NOT_STARTED', label: '⚪ Chưa học', count: topicsSummary.filter((t) => t.status === 'NOT_STARTED').length },
                  { id: 'LEARNING', label: '🚀 Đang học', count: topicsSummary.filter((t) => t.status === 'LEARNING').length },
                  { id: 'MASTERED', label: '⭐ Đã hoàn thành lượt đầu', count: topicsSummary.filter((t) => t.status === 'MASTERED').length },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedStatusFilter === st.id
                        ? 'colloc-tab-active bg-indigo-600 text-white shadow-xs'
                        : 'colloc-btn-secondary bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st.label} ({st.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
              {paginatedTopics.map((topic) => {
                const IconComponent = topic.icon

                return (
                  <div
                    key={topic.topicKey}
                    className="colloc-card group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200"
                  >
                    <div>
                      {/* Top Meta: Unit & Status */}
                      <div className="flex justify-between items-center mb-3">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${topic.badgeBgLight} ${topic.badgeBgDark}`}>
                          <IconComponent size={13} />
                          Unit {topic.unitNum < 10 ? `0${topic.unitNum}` : topic.unitNum}
                        </div>

                        {/* Progress Status Badge */}
                        {topic.status === 'MASTERED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                            <CheckCheck size={13} /> Đã học xong lượt đầu
                          </span>
                        ) : topic.status === 'LEARNING' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                            <CircleDot size={12} className="text-indigo-500 animate-pulse" /> Đang học {topic.progressPercent}%
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            Chưa học
                          </span>
                        )}
                      </div>

                      {/* Topic Titles */}
                      <h3 className="colloc-title text-base font-bold leading-snug mb-1">
                        {topic.titleVi}
                      </h3>
                      <div className="colloc-subtitle text-xs font-semibold mb-2">
                        {topic.titleEn}
                      </div>

                      {/* Description */}
                      <p className="colloc-desc text-xs leading-relaxed mb-3 line-clamp-2">
                        {topic.descVi}
                      </p>

                      {/* Topic Progress Bar */}
                      <div className="mb-3.5 bg-slate-100 dark:bg-slate-700/60 p-2.5 rounded-xl">
                        <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                          <span className="text-slate-600 dark:text-slate-300">Tiến độ bài học:</span>
                          <span className="colloc-subtitle font-extrabold">
                            {topic.learnedCount} / {topic.count} ({topic.progressPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
                            style={{ width: `${topic.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Collocation Sample Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {topic.samples.map((phrase) => (
                          <span
                            key={phrase}
                            className="colloc-pill text-[11px] font-medium px-2 py-0.5 rounded-md"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions: Học bài mới & Ôn tập riêng */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 gap-2">
                      {(topic.status === 'NOT_STARTED' || topic.learnedCount === 0) && (
                        <button
                          type="button"
                          onClick={() => handleStartStudy(topic.topicKey)}
                          className="colloc-btn-primary w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
                        >
                          <BookOpen size={14} className="shrink-0" /> Bắt đầu học mới
                        </button>
                      )}

                      {topic.status === 'LEARNING' && topic.learnedCount > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartStudy(topic.topicKey)}
                            className="colloc-btn-primary flex-1 inline-flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap min-w-0"
                            title={`Học tiếp câu ${topic.learnedCount + 1}`}
                          >
                            <BookOpen size={13} className="shrink-0" />
                            <span className="truncate">Học tiếp ({topic.learnedCount}/{topic.count})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartReview(topic.topicKey, 'all')}
                            className="colloc-btn-secondary flex-1 inline-flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold border cursor-pointer whitespace-nowrap min-w-0"
                            title="Ôn tập thông minh Spaced Repetition cho Unit này"
                          >
                            <Sparkles size={13} className="text-amber-500 shrink-0" />
                            <span className="truncate">Ôn tập SRS</span>
                          </button>
                        </>
                      )}

                      {topic.status === 'MASTERED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartReview(topic.topicKey, 'all')}
                            className="colloc-btn-primary flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl text-xs font-bold cursor-pointer"
                            title="Ôn tập lại các cụm từ trong Unit này theo thuật toán Spaced Repetition"
                          >
                            <Sparkles size={14} /> Ôn tập SRS
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartStudy(topic.topicKey, false)}
                            className="colloc-btn-secondary flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                            title="Học lại tuần tự từ câu đầu tiên"
                          >
                            <RotateCcw size={14} /> Học lại
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Navigation Bar for Topic Hub */}
            {totalHubPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Hiển thị <strong className="text-slate-800 dark:text-slate-100">{(hubCurrentPage - 1) * topicsPerPage + 1}</strong> - <strong className="text-slate-800 dark:text-slate-100">{Math.min(hubCurrentPage * topicsPerPage, filteredTopics.length)}</strong> trên tổng số <strong className="text-slate-800 dark:text-slate-100">{filteredTopics.length}</strong> chủ đề
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={hubCurrentPage === 1}
                    onClick={() => setHubCurrentPage((p) => Math.max(1, p - 1))}
                    className="colloc-btn-secondary p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalHubPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    const isActive = hubCurrentPage === pageNum
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setHubCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'colloc-tab-active bg-indigo-600 text-white shadow-xs shadow-indigo-500/20'
                            : 'colloc-btn-secondary border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    disabled={hubCurrentPage === totalHubPages}
                    onClick={() => setHubCurrentPage((p) => Math.min(totalHubPages, p + 1))}
                    className="colloc-btn-secondary p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Trang tiếp theo"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: DEDICATED SPACED REPETITION REVIEW HUB        */}
        {/* ==================================================== */}
        {hubTab === 'review_center' && (
          <div className="flex flex-col gap-6">
            {/* Quick Launch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A: Ôn tập tổng hợp tất cả */}
              <div className="colloc-card p-5 rounded-2xl border flex flex-col justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={16} /> ÔN TẬP TỔNG HỢP
                  </div>
                  <h3 className="colloc-title text-base font-extrabold mb-1">
                    Tất Cả Cụm Từ Đã Học
                  </h3>
                  <p className="colloc-desc text-xs leading-relaxed">
                    Ôn tập tổng hợp toàn bộ <strong>{globalStats.learned}</strong> cụm từ đã hoàn thành từ tất cả các bài học theo thứ tự ưu tiên trí nhớ.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={globalStats.learned === 0}
                  onClick={() => handleStartReview('ALL', 'all')}
                  className="colloc-btn-primary w-full py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Zap size={14} /> Ôn tập tất cả ({globalStats.learned} cụm)
                </button>
              </div>

              {/* Option B: Ôn từ đến hạn hôm nay */}
              <div className="colloc-card p-5 rounded-2xl border flex flex-col justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Calendar size={16} /> ĐẾN HẠN HÔM NAY
                  </div>
                  <h3 className="colloc-title text-base font-extrabold mb-1">
                    Cụm Từ Đến Lịch Ôn
                  </h3>
                  <p className="colloc-desc text-xs leading-relaxed">
                    Có <strong>{globalStats.dueToday}</strong> cụm từ đã đến điểm rơi trí nhớ cần củng cố lại ngay hôm nay theo thuật toán DSR.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={globalStats.dueToday === 0}
                  onClick={() => handleStartReview('ALL', 'due')}
                  className="colloc-btn-primary w-full py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Calendar size={14} /> Ôn từ đến hạn ({globalStats.dueToday} cụm)
                </button>
              </div>

              {/* Option C: Ôn từ hay làm sai */}
              <div className="colloc-card p-5 rounded-2xl border flex flex-col justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertCircle size={16} /> CẦN CỦNG CỐ
                  </div>
                  <h3 className="colloc-title text-base font-extrabold mb-1">
                    Cụm Từ Từng Làm Sai
                  </h3>
                  <p className="colloc-desc text-xs leading-relaxed">
                    Có <strong>{weakCollocationsCount}</strong> cụm từ có độ nhớ chưa cao cần rèn luyện thêm để ghi nhớ vững chắc.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={weakCollocationsCount === 0}
                  onClick={() => handleStartReview('ALL', 'weak')}
                  className="colloc-btn-primary w-full py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw size={14} /> Ôn từ cần củng cố ({weakCollocationsCount} cụm)
                </button>
              </div>
            </div>

            {/* List of Units for Individual Unit Review */}
            <div className="colloc-card p-6 rounded-2xl border shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="colloc-title text-base font-bold">
                    Ôn Tập Riêng Biệt Theo Từng Unit Đã Học
                  </h3>
                  <p className="colloc-desc text-xs mt-0.5">
                    Chọn một Unit cụ thể bên dưới để ôn tập lại toàn bộ cụm từ của riêng Unit đó theo thuật toán Spaced Repetition.
                  </p>
                </div>
                <span className="colloc-pill text-xs font-bold px-3 py-1 rounded-lg">
                  {learnedTopics.length} / {topicsSummary.length} Units đã học
                </span>
              </div>

              {learnedTopics.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  Bạn chưa hoàn thành Unit nào. Hãy bấm sang tab <strong>"1. Danh Sách Bài Học"</strong> để học lượt bài đầu tiên!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {learnedTopics.map((topic) => (
                    <div
                      key={topic.topicKey}
                      className="colloc-inner-card p-4 rounded-xl border flex justify-between items-center gap-3"
                    >
                      <div>
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          Unit {topic.unitNum < 10 ? `0${topic.unitNum}` : topic.unitNum} • {topic.titleEn}
                        </div>
                        <h4 className="colloc-title text-sm font-bold mt-0.5">
                          {topic.titleVi}
                        </h4>
                        <div className="colloc-desc text-xs mt-1">
                          Đã học: <strong>{topic.learnedCount}/{topic.count}</strong> cụm ({topic.progressPercent}%)
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartReview(topic.topicKey, 'all')}
                        className="colloc-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Sparkles size={13} /> Ôn Unit này
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: STUDY & PRACTICE MODE (MÀN HÌNH LUYỆN TẬP VỚI CHECK TIẾN ĐỘ THỜI GIAN THỰC)
  // =========================================================================
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
  const currentTopicMeta = TOPIC_CONFIG[selectedTopic]

  return (
    <div className="max-w-4xl mx-auto py-2 pb-12 select-none">
      {/* Top Navigation & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setViewMode('hub')}
          className="colloc-btn-secondary inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Danh sách chủ đề
        </button>

        {/* Practice Mode Switcher (3 Tabs) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setPracticeMode('context')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              practiceMode === 'context'
                ? 'colloc-tab-active bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'colloc-tab-inactive text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BookOpen size={14} /> 1. Điền Ngữ Cảnh
          </button>
          <button
            type="button"
            onClick={() => setPracticeMode('sorting')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              practiceMode === 'sorting'
                ? 'colloc-tab-active bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'colloc-tab-inactive text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Grid size={14} /> 2. Phân Loại Nhóm
          </button>
          <button
            type="button"
            onClick={() => setPracticeMode('matching')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              practiceMode === 'matching'
                ? 'colloc-tab-active bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'colloc-tab-inactive text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Layers size={14} /> 3. Ghép Vế 2 Cột
          </button>
        </div>
      </div>

      {/* Current Topic Header Info with Learning Mode Badge */}
      <div className="colloc-card flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border mb-4 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {learningMode === 'study' ? (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800">
                  📖 HỌC BÀI MỚI • {selectedTopic === 'ALL' ? 'Tất Cả' : `Unit ${currentTopicMeta?.unitNum || '1'}`}
                </span>
              ) : (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800">
                  🧠 ÔN TẬP THÔNG MINH (SPACED REPETITION)
                </span>
              )}
              <span className="colloc-pill text-[11px] font-bold px-2 py-0.5 rounded-md">
                {filteredList.length} cụm từ
              </span>
            </div>

            <h2 className="colloc-title text-lg sm:text-xl font-bold m-0">
              {learningMode === 'study'
                ? selectedTopic === 'ALL'
                  ? 'Lượt Học Bài Mới Tổng Hợp'
                  : currentTopicMeta?.titleVi || selectedTopic
                : selectedTopic === 'ALL'
                ? 'Ôn Tập Tổng Hợp Toàn Bộ Bài Học'
                : `Ôn Tập: ${currentTopicMeta?.titleVi || selectedTopic}`}
            </h2>

            <div className="colloc-desc text-xs mt-0.5">
              {learningMode === 'study'
                ? 'Học tuần tự theo thứ tự chuẩn của bài học.'
                : 'Áp dụng thuật toán Spaced Repetition (ưu tiên từ đến hạn / từ làm sai ở lần học đầu).'}
            </div>
          </div>

          {/* Quick Switch between Study & Review */}
          <div className="flex items-center gap-2">
            {learningMode === 'study' ? (
              <button
                type="button"
                onClick={() => handleStartReview(selectedTopic, 'all')}
                className="colloc-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-500" /> Chuyển sang Ôn tập SRS
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStartStudy(selectedTopic === 'ALL' ? 'Topic: Work' : selectedTopic)}
                className="colloc-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
              >
                <BookOpen size={13} /> Chuyển sang Học bài mới
              </button>
            )}
          </div>
        </div>

        {/* Topic Real-Time Progress Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="colloc-desc text-slate-600 dark:text-slate-300">
              Tiến độ: <strong className="colloc-title">{currentIndex + 1} / {filteredList.length || 1} cụm</strong>
            </span>
            <span className="colloc-subtitle font-extrabold">
              {filteredList.length > 0 ? Math.round(((currentIndex + 1) / filteredList.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${filteredList.length > 0 ? Math.round(((currentIndex + 1) / filteredList.length) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Toolbar (CEFR & Stepper) */}
      <div className="colloc-card flex justify-between items-center flex-wrap gap-2.5 p-3 px-4 rounded-xl border mb-4 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="colloc-desc font-bold uppercase text-[11px]">Cấp độ CEFR:</span>
          <div className="flex gap-1">
            {['ALL', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelectedLevel(lvl)
                  setCurrentIndex(0)
                  setBatchIndex(0)
                  setIsUnitFinished(false)
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  selectedLevel === lvl
                    ? 'colloc-tab-active bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                    : 'colloc-pill border hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {lvl === 'ALL' ? 'Tất cả' : lvl}
              </button>
            ))}
          </div>
        </div>

        {practiceMode === 'context' && !isUnitFinished && (
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
              <Flame size={15} className="fill-amber-500 text-amber-500" /> Streak: {streak}
            </span>
            <span className="colloc-pill font-bold px-2.5 py-1 rounded-lg">
              Câu {currentIndex + 1} / {filteredList.length || 1}
            </span>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODE 1: CONTEXTUAL FILL-IN-THE-BLANK                 */}
      {/* ==================================================== */}
      {practiceMode === 'context' && (
        <div className="flex flex-col gap-4">
          {filteredList.length === 0 ? (
            <div className="colloc-container text-center py-12 px-4 rounded-3xl border">
              <HelpCircle size={36} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
              <h3 className="colloc-title text-base font-bold mb-1">Chưa có cụm từ nào cho mục này</h3>
              <p className="colloc-desc text-xs mb-4">
                {learningMode === 'review'
                  ? 'Hiện tại chưa có cụm từ nào cần ôn tập trong mục này. Bạn có thể học thêm bài mới hoặc chọn ôn tập tất cả!'
                  : 'Vui lòng chọn lại cấp độ CEFR khác hoặc quay về danh sách chủ đề.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedLevel('ALL')
                  setReviewFilter('all')
                }}
                className="colloc-btn-primary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Reset bộ lọc
              </button>
            </div>
          ) : isUnitFinished ? (
            /* ==================================================== */
            /* UNIT COMPLETION & MEMORY REVIEW SUMMARY              */
            /* ==================================================== */
            <div className="colloc-container p-7 sm:p-8 rounded-3xl border shadow-md text-center flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 text-3xl">
                🎉
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {learningMode === 'study' ? 'Đã Hoàn Thành Lượt Học Đầu Của Unit' : 'Đã Hoàn Thành Phiên Ôn Tập SRS'}
                </span>
                <h2 className="colloc-title text-xl sm:text-2xl font-extrabold mt-2 mb-1">
                  {learningMode === 'study'
                    ? `Hoàn Thành Bài Học: ${currentTopicMeta?.titleVi || selectedTopic}!`
                    : 'Hoàn Thành Xuất Sắc Lượt Ôn Tập!'}
                </h2>
                <p className="colloc-desc text-xs sm:text-sm max-w-lg mx-auto">
                  {learningMode === 'study'
                    ? `Toàn bộ ${filteredList.length} cụm từ của Unit đã được ghi nhận. Kết quả đúng/sai ở lần học đầu tiên đã được lưu vào hệ thống để cá nhân hóa các đợt ôn tập Spaced Repetition.`
                    : `Tất cả ${filteredList.length} cụm từ ôn tập đã được cập nhật chu kỳ ghi nhớ dài hạn.`}
                </p>
              </div>

              {/* Memory Review Distribution Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    🟢 Đã nhớ tốt
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {filteredList.filter((i) => (i.user_progress?.stability || 0) >= 5).length} cụm
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">Ôn lại sau 1 tuần</div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1">
                    🟡 Đang rèn luyện
                  </div>
                  <div className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400">
                    {filteredList.filter((i) => {
                      const s = i.user_progress?.stability || 0
                      return s >= 2 && s < 5
                    }).length} cụm
                  </div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400/80 mt-0.5">Ôn lại sau 2–3 ngày</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                    🔴 Cần củng cố
                  </div>
                  <div className="text-xl font-extrabold text-amber-700 dark:text-amber-400">
                    {filteredList.filter((i) => (i.user_progress?.stability || 0) < 2).length} cụm
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5">Ôn lại vào ngày mai</div>
                </div>
              </div>

              {/* Next actions buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {learningMode === 'study' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartReview(selectedTopic, 'all')}
                      className="colloc-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                    >
                      <Sparkles size={16} /> Bắt đầu ôn tập SRS cho Unit này
                    </button>

                    <button
                      type="button"
                      onClick={handleNextUnit}
                      className="colloc-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer"
                    >
                      Học Unit tiếp theo <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUnitFinished(false)
                        setCurrentIndex(0)
                      }}
                      className="colloc-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                    >
                      <RotateCcw size={15} /> Ôn tập lại lượt này
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartReview('ALL', 'all')}
                      className="colloc-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer"
                    >
                      Ôn tập tổng hợp tất cả bài
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setViewMode('hub')}
                  className="colloc-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Quay lại danh sách chủ đề
                </button>
              </div>
            </div>
          ) : (
            currentItem && (
              <div className="colloc-container p-6 rounded-3xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col gap-4">
                {/* Meta Tags & Friendly Status Badges */}
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="colloc-pill text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                      {currentItem.category || currentItem.ielts_topic || 'Academic'}
                    </span>
                    <span className="colloc-pill text-[11px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                      CEFR {currentItem.cefr_level || 'B2'}
                    </span>

                    {/* Friendly Memory Status Badge */}
                    {currentItem.user_progress?.isMastered ? (
                      <span className="colloc-pill text-[11px] font-bold inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                        ⭐ Đã thuộc ({currentItem.user_progress.reps} lần ôn)
                      </span>
                    ) : currentItem.user_progress?.isDue ? (
                      <span className="colloc-pill text-[11px] font-bold inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                        ⏰ Đến hạn ôn tập
                      </span>
                    ) : currentItem.user_progress?.isLearned ? (
                      <span className="colloc-pill text-[11px] font-bold inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                        🚀 Đang học ({currentItem.user_progress.reps} lần ôn)
                      </span>
                    ) : (
                      <span className="colloc-pill text-[11px] font-bold inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        🌱 Cụm từ mới
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playAudio(currentItem.example_sentence)}
                      className="colloc-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                    >
                      <Volume2 size={14} /> Phát âm câu mẫu
                    </button>
                  </div>
                </div>

                {/* Context Sentence Card */}
                <div className="colloc-inner-card p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    NGỮ CẢNH CÂU (FILL IN THE BLANK):
                  </p>
                  <h3 className="colloc-title text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-relaxed m-0">
                    "{blankData.before}
                    <span
                      className={`inline-block min-w-[130px] px-3 py-0.5 mx-1 rounded-lg text-center font-extrabold transition-colors ${
                        isAnswered
                          ? isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-100 border-b-2 border-emerald-500'
                            : 'bg-rose-100 dark:bg-rose-900/90 text-rose-800 dark:text-rose-100 border-b-2 border-rose-500'
                          : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500'
                      }`}
                    >
                      {isAnswered
                        ? isCorrect
                          ? blankData.phraseInSentence
                          : currentItem.full_phrase
                        : '[ ________________ ]'}
                    </span>
                    {blankData.after}"
                  </h3>

                  {/* Vietnamese Definition Prompt */}
                  <div className="mt-3.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs sm:text-sm">
                    <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="colloc-title font-semibold text-slate-700 dark:text-slate-200">
                      Nghĩa tiếng Việt: <strong className="colloc-subtitle text-indigo-600 dark:text-indigo-400">"{currentItem.meaning_vi}"</strong>
                    </span>
                  </div>
                </div>

                {/* In Review Mode: Typing Only, with 4 Choices as Hint */}
                {learningMode === 'review' ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input
                        ref={typingInputRef}
                        type="text"
                        placeholder="Gõ cụm từ tiếng Anh chính xác vào đây (Ôn tập Active Recall)..."
                        value={userTypedAnswer}
                        disabled={isAnswered}
                        autoFocus
                        onChange={(e) => setUserTypedAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && userTypedAnswer.trim() && !isAnswered) {
                            handleCheckContextAnswer(userTypedAnswer)
                          }
                        }}
                        className="flex-1 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                      {!isAnswered && (
                        <button
                          type="button"
                          onClick={() => handleCheckContextAnswer(userTypedAnswer)}
                          disabled={!userTypedAnswer.trim()}
                          className="colloc-btn-primary px-6 rounded-xl text-white font-bold text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
                        >
                          Kiểm tra
                        </button>
                      )}
                    </div>

                    {/* Hint: 4 Multiple Choices */}
                    {!isAnswered && (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowChoicesHint(!showChoicesHint)
                            setShowHint(true)
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors py-1 cursor-pointer"
                        >
                          <Lightbulb size={14} />
                          {showChoicesHint ? 'Ẩn gợi ý 4 lựa chọn' : '💡 Quên từ? Xem gợi ý 4 lựa chọn'}
                        </button>

                        {showChoicesHint && (
                          <div className="mt-2 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 animate-in fade-in duration-200">
                            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-2">
                              💡 GỢI Ý 4 LỰA CHỌN (Bấm vào đáp án để điền và kiểm tra nhanh):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {options.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setUserTypedAnswer(opt)
                                    handleCheckContextAnswer(opt)
                                  }}
                                  className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold text-left hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* In Study Mode: Choice vs Typing Selector & Views */
                  <>
                    {/* Mode Selector: Choice vs Typing */}
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/80 pb-2 text-xs">
                      <span className="colloc-desc font-bold text-slate-500 dark:text-slate-400">Cách trả lời:</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInputMode('choice')}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            inputMode === 'choice'
                              ? 'colloc-tab-active bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                              : 'colloc-pill bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          4 Lựa chọn trắc nghiệm
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputMode('typing')}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            inputMode === 'typing'
                              ? 'colloc-tab-active bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                              : 'colloc-pill bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          ⌨️ Gõ cụm từ (Hard Recall)
                        </button>
                      </div>
                    </div>

                    {/* Sub-Mode A: 4 Multiple Choice Grid */}
                    {inputMode === 'choice' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {options.map((opt) => {
                          const isOptCorrect = opt.trim().toLowerCase() === currentItem.full_phrase.trim().toLowerCase()
                          const isThisSelected = selectedOption === opt

                          let optClasses = 'colloc-option-btn bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 dark:hover:bg-slate-700 shadow-sm'

                          if (isAnswered) {
                            if (isOptCorrect) {
                              optClasses = 'bg-emerald-50 dark:bg-emerald-900/90 border-2 border-emerald-400 dark:border-emerald-400 text-emerald-800 dark:text-emerald-100 shadow-md shadow-emerald-500/20'
                            } else if (isThisSelected && !isOptCorrect) {
                              optClasses = 'bg-rose-50 dark:bg-rose-900/90 border-2 border-rose-400 dark:border-rose-400 text-rose-800 dark:text-rose-100 shadow-md shadow-rose-500/20'
                            } else {
                              optClasses = 'bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                            }
                          } else if (isThisSelected) {
                            optClasses = 'bg-indigo-50 dark:bg-indigo-950/80 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-md shadow-indigo-500/10'
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => {
                                setSelectedOption(opt)
                                handleCheckContextAnswer(opt)
                              }}
                              className={`p-3.5 rounded-xl border text-sm font-bold text-left flex items-center justify-between shadow-xs transition-all ${optClasses}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && isOptCorrect && <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400 shrink-0" />}
                              {isAnswered && isThisSelected && !isOptCorrect && <XCircle size={18} className="text-rose-500 dark:text-rose-400 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      /* Sub-Mode B: Typing Input */
                      <div className="flex gap-2">
                        <input
                          ref={typingInputRef}
                          type="text"
                          placeholder="Gõ cụm từ tiếng Anh chính xác vào đây..."
                          value={userTypedAnswer}
                          disabled={isAnswered}
                          autoFocus
                          onChange={(e) => setUserTypedAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && userTypedAnswer.trim() && !isAnswered) {
                              handleCheckContextAnswer(userTypedAnswer)
                            }
                          }}
                          className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold outline-none focus:border-indigo-500"
                        />
                        {!isAnswered && (
                          <button
                            type="button"
                            onClick={() => handleCheckContextAnswer(userTypedAnswer)}
                            disabled={!userTypedAnswer.trim()}
                            className="colloc-btn-primary px-5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm disabled:opacity-50"
                          >
                            Kiểm tra
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Feedback Card & Next Question CTA */}
                {isAnswered && (
                  <div
                    className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-900/60 border-emerald-400 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-md shadow-emerald-500/10'
                        : 'bg-rose-50 dark:bg-rose-900/60 border-rose-400 dark:border-rose-500 text-rose-950 dark:text-rose-100 shadow-md shadow-rose-500/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-extrabold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={18} className="text-rose-600 dark:text-rose-400" />}
                        {isCorrect ? 'Tuyệt vời! Bạn đã chọn chính xác.' : 'Chưa chính xác!'}
                      </div>
                      <p className="text-xs mt-1">
                        Đáp án đúng: <strong className="underline">{currentItem.full_phrase}</strong> — {currentItem.meaning_vi}
                      </p>
                    </div>

                    <button
                      ref={nextButtonRef}
                      type="button"
                      onClick={goToNextQuestion}
                      className="colloc-btn-primary px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shadow-md self-end sm:self-auto cursor-pointer transition-all active:scale-95 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    >
                      Câu tiếp theo <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {/* Question Stepper Bar (Pagination between questions) - Only in Study Mode */}
                {learningMode === 'study' && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={goToPrevQuestion}
                      className="colloc-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer font-semibold"
                    >
                      <ChevronLeft size={14} /> Câu trước
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 py-1 px-1">
                      {filteredList.map((qItem, qIdx) => {
                        const isActive = currentIndex === qIdx
                        const isLearnedCorrect =
                          sessionCorrectIds.has(qItem.id) ||
                          qItem.user_progress?.isLearned ||
                          (qItem.user_progress?.reps || 0) > 0 ||
                          (isActive && isAnswered && isCorrect)
                        return (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => {
                              setIsUnitFinished(false)
                              setCurrentIndex(qIdx)
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center ${
                              isLearnedCorrect
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 border border-emerald-600 dark:border-emerald-500 shadow-xs'
                                : isActive
                                ? 'colloc-tab-active bg-indigo-600 text-white font-extrabold shadow-xs'
                                : 'colloc-btn-secondary border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            title={isLearnedCorrect ? `Câu ${qIdx + 1}: Đã làm đúng` : isActive ? `Đang làm câu ${qIdx + 1}` : `Câu ${qIdx + 1}: Chưa hoàn thành`}
                          >
                            {qIdx + 1}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={currentIndex === filteredList.length - 1}
                      onClick={goToNextQuestion}
                      className="colloc-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer font-semibold"
                    >
                      Câu sau <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 2: CATEGORISATION / SORTING (6 RICH GROUPS)     */}
      {/* ==================================================== */}
      {practiceMode === 'sorting' && (
        <div className="flex flex-col gap-4">
          {/* Sub-Group Switcher (6 Groups) */}
          <div className="colloc-card p-4 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <span className="colloc-title text-xs font-bold text-slate-700 dark:text-slate-200">
                Chọn bộ nhóm phân loại ({SORTING_GROUPS.length} nhóm):
              </span>
              <button
                type="button"
                onClick={() => setupSortingCards(sortingGroup)}
                className="colloc-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                <RotateCcw size={13} /> Đổi thẻ mới
              </button>
            </div>

            {/* Group selector pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SORTING_GROUPS.map((grp) => {
                const isActive = sortingGroup === grp.id
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setSortingGroup(grp.id)}
                    className={`colloc-group-btn p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      isActive
                        ? 'colloc-group-btn-active bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className="mr-1">{grp.emoji}</span> {grp.nameVi}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cards Waiting to be Sorted */}
          <div className="colloc-card p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h4 className="colloc-desc text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                1. Chọn thẻ cần phân loại ({unassignedCards.length} thẻ còn lại):
              </h4>
              {selectedSortingCard && (
                <span className="colloc-pill text-[11px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md">
                  Đang chọn: "{selectedSortingCard.tail_chunk}"
                </span>
              )}
            </div>

            {unassignedCards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {unassignedCards.map((card) => {
                  const isCardSelected = selectedSortingCard?.id === card.id
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedSortingCard(card)}
                      className={`colloc-card-chip p-2.5 px-3.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        isCardSelected
                          ? 'colloc-card-chip-selected bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-400'
                      }`}
                    >
                      {card.tail_chunk}
                      <span className="colloc-desc block text-[10.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {card.meaning_vi}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                🎉 Hoàn hảo! Bạn đã phân loại thành công toàn bộ thẻ vào đúng nhóm.
              </div>
            )}
          </div>

          {/* Feedback message */}
          {sortingFeedback && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm font-bold border ${
                sortingFeedback.isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
              }`}
            >
              {sortingFeedback.message}
            </div>
          )}

          {/* Buckets Grid */}
          <div
            className={`grid gap-3.5 ${
              Object.keys(sortedBuckets).length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : Object.keys(sortedBuckets).length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {Object.keys(sortedBuckets).map((bucketKey) => {
              const placedItems = sortedBuckets[bucketKey] || []

              return (
                <div
                  key={bucketKey}
                  className={`colloc-bucket flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-850/90 border min-h-[220px] transition-all ${
                    selectedSortingCard
                      ? 'border-2 border-dashed border-indigo-400 dark:border-indigo-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="colloc-title text-base font-extrabold uppercase text-slate-900 dark:text-slate-100">
                        {bucketKey}
                      </span>
                      <span className="colloc-pill text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                        {placedItems.length} cụm
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {placedItems.map((item) => (
                        <div
                          key={item.id}
                          className="colloc-pill flex items-center justify-between p-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                        >
                          <span>{item.full_phrase}</span>
                          <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedSortingCard}
                    onClick={() => handlePlaceCardIntoBucket(bucketKey)}
                    className={`mt-4 p-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedSortingCard
                        ? 'colloc-btn-primary bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 cursor-pointer'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    + Đặt vào nhóm "{bucketKey}"
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 3: DUAL-COLUMN MATCHING                         */}
      {/* ==================================================== */}
      {practiceMode === 'matching' && (
        <div className="flex flex-col gap-4">
          <div className="colloc-card flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <div>
              <span className="colloc-subtitle text-[11px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                Ghép Thẻ 2 Cột • Đợt {batchIndex + 1} / {totalMatchingBatches}
              </span>
              <h3 className="colloc-title text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 m-0">
                Ghép Động Từ (Cột Trái) với Danh Từ / Giới Từ (Cột Phải)
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextIdx = (batchIndex + 1) % totalMatchingBatches
                setBatchIndex(nextIdx)
                setupMatchingBatch(filteredList, nextIdx)
              }}
              className="colloc-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <RotateCcw size={13} /> Đổi đợt ghép
            </button>
          </div>

          {matchFeedback && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm font-bold border ${
                matchFeedback.startsWith('✅')
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
              }`}
            >
              {matchFeedback}
            </div>
          )}

          {/* Dual Columns Grid */}
          <div className="colloc-container grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            {/* Left: Heads */}
            <div>
              <h4 className="colloc-desc text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5">
                Cột vế trước (Head Words / Verbs)
              </h4>
              <div className="flex flex-col gap-2.5">
                {heads.map((h) => {
                  const matchedItem = currentBatch.find((i) => i.head_word === h && matchedIds.includes(i.id))
                  const isMatched = !!matchedItem
                  const isSelected = selectedHead === h

                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={isMatched}
                      onClick={() => setSelectedHead(h)}
                      className={`colloc-match-item p-3.5 rounded-xl border text-sm font-bold text-left flex items-center justify-between transition-all ${
                        isMatched
                          ? 'colloc-match-item-matched bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through'
                          : isSelected
                          ? 'colloc-match-item-selected bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-400'
                      }`}
                    >
                      <span>{h}</span>
                      {isMatched && <Check size={16} className="text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: Tails */}
            <div>
              <h4 className="colloc-desc text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5">
                Cột vế sau (Noun Chunks / Prepositions)
              </h4>
              <div className="flex flex-col gap-2.5">
                {tails.map((t) => {
                  const matchedItem = currentBatch.find((i) => i.tail_chunk === t && matchedIds.includes(i.id))
                  const isMatched = !!matchedItem
                  const isSelected = selectedTail === t

                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={isMatched}
                      onClick={() => setSelectedTail(t)}
                      className={`colloc-match-item p-3.5 rounded-xl border text-sm font-semibold text-left flex items-center justify-between transition-all ${
                        isMatched
                          ? 'colloc-match-item-matched bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through'
                          : isSelected
                          ? 'colloc-match-item-selected bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-400'
                      }`}
                    >
                      <span>{t}</span>
                      {isMatched && <Check size={16} className="text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Batch Completed Screen */}
          {isMatchingBatchDone && (
            <div className="colloc-completed-box p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/60 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800 text-center">
              <h3 className="colloc-title text-base font-extrabold text-indigo-950 dark:text-indigo-200 mb-1">
                🎉 Đã hoàn thành Đợt {batchIndex + 1}!
              </h3>
              <p className="colloc-desc text-xs text-indigo-700 dark:text-indigo-300 mb-3">
                Tất cả {BATCH_SIZE} cụm từ đợt này đã được lưu vào hệ thống ôn lặp ngắt quãng DSR.
              </p>
              <button
                type="button"
                onClick={() => {
                  const nextIdx = (batchIndex + 1) % totalMatchingBatches
                  setBatchIndex(nextIdx)
                  setupMatchingBatch(filteredList, nextIdx)
                }}
                className="colloc-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
              >
                Sang Đợt {((batchIndex + 1) % totalMatchingBatches) + 1} tiếp theo <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
