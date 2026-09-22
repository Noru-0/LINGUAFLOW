'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Layers,
  BookOpen,
  Mic,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Search,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Activity,
  Database,
  RefreshCw,
  UserCheck,
  UserPlus,
  Flame,
  Award,
  FileText,
  Lock,
  Eye,
  TrendingUp,
  X,
  Check,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark' | 'pink'>('light')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'collocations' | 'speaking' | 'system'>('overview')

  // Auth Guard
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false)

  // Data states
  const [stats, setStats] = useState<any>(null)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [userList, setUserList] = useState<any[]>([])
  const [collocList, setCollocList] = useState<any[]>([])
  const [speakingList, setSpeakingList] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<string>('')

  // User Progress Modal State
  const [selectedUserProgress, setSelectedUserProgress] = useState<any>(null)
  const [progressLoading, setProgressLoading] = useState<boolean>(false)
  const [modalLogTab, setModalLogTab] = useState<'sentence' | 'paragraph' | 'speaking'>('sentence')

  // Modals & Forms
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')

  const [showAddCollocModal, setShowAddCollocModal] = useState(false)
  const [newHeadWord, setNewHeadWord] = useState('')
  const [newTailChunk, setNewTailChunk] = useState('')
  const [newFullPhrase, setNewFullPhrase] = useState('')
  const [newMeaningVi, setNewMeaningVi] = useState('')
  const [newExampleSentence, setNewExampleSentence] = useState('')
  const [newCefrLevel, setNewCefrLevel] = useState('C1')
  const [newIeltsTopic, setNewIeltsTopic] = useState('Environment')

  const [showAddSpeakingModal, setShowAddSpeakingModal] = useState(false)
  const [newSpeakingPart, setNewSpeakingPart] = useState<number>(1)
  const [newSpeakingTopic, setNewSpeakingTopic] = useState('')
  const [newSpeakingQuestion, setNewSpeakingQuestion] = useState('')
  const [newSpeakingModelResponse, setNewSpeakingModelResponse] = useState('')

  // 1. Auth Guard & Theme setup
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'pink' | null
      if (savedTheme) {
        setTheme(savedTheme)
        document.documentElement.classList.remove('dark', 'pink')
        if (savedTheme === 'dark') document.documentElement.classList.add('dark')
        if (savedTheme === 'pink') document.documentElement.classList.add('pink')
      }
    } catch {}

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user)
          if (data.user.role === 'admin' || data.user.email === 'admin@linguaflow.com') {
            setIsAdminAuthorized(true)
          } else {
            setIsAdminAuthorized(false)
          }
        } else {
          setIsAdminAuthorized(false)
        }
      })
      .catch(() => setIsAdminAuthorized(false))
      .finally(() => setIsCheckingAuth(false))
  }, [])

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'pink')[] = ['light', 'dark', 'pink']
    const next = themes[(themes.indexOf(theme) + 1) % themes.length]
    setTheme(next)
    try {
      localStorage.setItem('theme', next)
      document.documentElement.classList.remove('dark', 'pink')
      if (next === 'dark') document.documentElement.classList.add('dark')
      if (next === 'pink') document.documentElement.classList.add('pink')
    } catch {}
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch admin stats and data
  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [resStats, resUsers, resColloc, resSpeaking] = await Promise.all([
        fetch('/api/admin/stats').then((r) => r.json()),
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/admin/collocations').then((r) => r.json()),
        fetch('/api/admin/speaking').then((r) => r.json()),
      ])

      if (resStats.success) {
        setStats(resStats.stats)
        setRecentUsers(resStats.recentUsers || [])
      }
      if (resUsers.success) setUserList(resUsers.users || [])
      if (resColloc.success) setCollocList(resColloc.collocations || [])
      if (resSpeaking.success) setSpeakingList(resSpeaking.prompts || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdminAuthorized) {
      fetchAdminData()
    }
  }, [isAdminAuthorized])

  // Inspect User Learning Progress
  const handleInspectUserProgress = async (userId: string) => {
    setProgressLoading(true)
    setSelectedUserProgress(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/progress`)
      const data = await res.json()
      if (data.success) {
        setSelectedUserProgress(data)
      } else {
        alert(data.error || 'Không thể tải tiến trình học của người dùng này!')
      }
    } catch {
      alert('Lỗi kết nối khi tải tiến trình học!')
    } finally {
      setProgressLoading(false)
    }
  }

  // Toggle User Role (Admin / User)
  const handleToggleUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message)
        fetchAdminData()
        if (selectedUserProgress && selectedUserProgress.user.id === userId) {
          setSelectedUserProgress({
            ...selectedUserProgress,
            user: { ...selectedUserProgress.user, role: newRole },
          })
        }
      }
    } catch {
      alert('Không thể cập nhật phân quyền!')
    }
  }

  // Action handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message || 'Đã tạo tài khoản thành công!')
        setShowAddUserModal(false)
        setNewUserName('')
        setNewUserEmail('')
        setNewUserPassword('')
        fetchAdminData()
      } else {
        alert(data.error || 'Có lỗi xảy ra!')
      }
    } catch {
      alert('Lỗi kết nối máy chủ!')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('Đã xóa người dùng thành công!')
        fetchAdminData()
      }
    } catch {
      alert('Không thể xóa người dùng!')
    }
  }

  const handleCreateCollocation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/collocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headWord: newHeadWord,
          tailChunk: newTailChunk,
          fullPhrase: newFullPhrase,
          meaningVi: newMeaningVi,
          exampleSentence: newExampleSentence,
          cefrLevel: newCefrLevel,
          ieltsTopic: newIeltsTopic,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Đã thêm Collocation thành công!')
        setShowAddCollocModal(false)
        setNewHeadWord('')
        setNewTailChunk('')
        setNewFullPhrase('')
        setNewMeaningVi('')
        setNewExampleSentence('')
        fetchAdminData()
      }
    } catch {
      alert('Có lỗi xảy ra!')
    }
  }

  const handleDeleteCollocation = async (id: string) => {
    if (!confirm('Xóa cụm từ này khỏi hệ thống?')) return
    try {
      const res = await fetch(`/api/admin/collocations?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('Đã xóa Collocation!')
        fetchAdminData()
      }
    } catch {
      alert('Lỗi khi xóa!')
    }
  }

  const handleCreateSpeaking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: newSpeakingPart,
          topic: newSpeakingTopic,
          questionPrompt: newSpeakingQuestion,
          modelResponse: newSpeakingModelResponse,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Đã thêm bài Speaking mới!')
        setShowAddSpeakingModal(false)
        setNewSpeakingTopic('')
        setNewSpeakingQuestion('')
        setNewSpeakingModelResponse('')
        fetchAdminData()
      }
    } catch {
      alert('Lỗi khi thêm bài Speaking!')
    }
  }

  const handleDeleteSpeaking = async (id: string) => {
    if (!confirm('Xóa bài Speaking này?')) return
    try {
      const res = await fetch(`/api/admin/speaking?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('Đã xóa bài Speaking!')
        fetchAdminData()
      }
    } catch {
      alert('Lỗi khi xóa!')
    }
  }

  // Filtered Lists
  const filteredUsers = userList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredColloc = collocList.filter(
    (c) =>
      c.fullPhrase?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.meaningVi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ieltsTopic?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSpeaking = speakingList.filter(
    (s) =>
      s.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.questionPrompt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 403 Forbidden Screen if not Admin
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <RefreshCw size={28} className="animate-spin text-indigo-400 mb-2" />
        <p className="text-xs text-slate-400">Đang xác thực quyền Admin...</p>
      </div>
    )
  }

  if (!isAdminAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <AnimatedBackground />
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-4 shadow-2xl">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-extrabold mb-1">Truy cập bị từ chối (403 Forbidden)</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          Trang Quản trị chỉ dành riêng cho tài khoản Admin hệ thống. Vui lòng đăng nhập tài khoản có quyền Admin để tiếp tục.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Quay về trang chính
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Đăng nhập Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans bg-transparent text-slate-900 dark:text-slate-100 flex flex-col select-none relative z-1">
      <AnimatedBackground />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[99999] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar Header */}
      <header className="h-16 px-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 flex items-center gap-2 text-xs font-semibold"
            title="Quay lại trang học"
          >
            <ArrowLeft size={18} />
            <span>Về trang chủ</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Shield size={18} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm leading-tight flex items-center gap-2">
                LinguaFlow Admin
                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/20">
                  Secured
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Giám sát tiến trình học & Quản trị hệ thống</p>
            </div>
          </div>
        </div>

        {/* Global Search & Action Tools */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm người dùng, collocations, speaking..."
              className="w-full bg-slate-100/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 text-xs pl-9 pr-3 py-2 rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Admin Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Admin Navigation Sidebar */}
        <aside className="w-60 flex-shrink-0 flex flex-col gap-2">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 size={17} />
              <span>Tổng quan hệ thống</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users size={17} />
              <span>Giám sát người dùng</span>
            </button>

            <button
              onClick={() => setActiveTab('collocations')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'collocations'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers size={17} />
              <span>IELTS Collocations</span>
            </button>

            <button
              onClick={() => setActiveTab('speaking')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'speaking'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Mic size={17} />
              <span>Bài tập Speaking</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'system'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings size={17} />
              <span>Hệ thống & AI Status</span>
            </button>
          </div>
        </aside>

        {/* Content View Tab Panels */}
        <main className="flex-1 flex flex-col gap-6">
          {/* TAB 1: SYSTEM OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Người dùng</p>
                    <h3 className="text-2xl font-extrabold mt-1">{stats?.totalUsers || 0}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Users size={22} />
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bộ từ Decks</p>
                    <h3 className="text-2xl font-extrabold mt-1">{stats?.totalDecks || 0}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <BookOpen size={22} />
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Collocations</p>
                    <h3 className="text-2xl font-extrabold mt-1">{stats?.totalCollocations || 0}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    <Layers size={22} />
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bài Speaking</p>
                    <h3 className="text-2xl font-extrabold mt-1">{stats?.totalSpeakingPrompts || 0}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Mic size={22} />
                  </div>
                </div>
              </div>

              {/* Recent Users Section */}
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <UserCheck size={18} className="text-indigo-500" />
                    Thành viên mới đăng ký & Giám sát tiến trình
                  </h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Xem danh sách chi tiết ({userList.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recentUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleInspectUserProgress(u.id)}
                      className="p-3.5 bg-white/70 dark:bg-slate-800/70 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 rounded-xl border border-slate-200/50 dark:border-slate-700/60 flex items-center justify-between cursor-pointer transition-all shadow-xs group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs">
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {u.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <Eye size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT & MONITORING */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Quản lý & Giám sát quá trình học của User</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Click "Tiến trình học" để xem chi tiết lịch sử học tập, Speaking & dịch đoạn văn của từng học viên</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <UserPlus size={16} />
                  <span>Tạo người dùng mới</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Người dùng</th>
                      <th className="p-3.5">Phân quyền Role</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Ngày tham gia</th>
                      <th className="p-3.5 text-right">Giám sát & Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((u) => {
                      const userRole = u.role || (u.email === 'admin@linguaflow.com' ? 'admin' : 'user')
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-3.5 font-bold flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleUserRole(u.id, userRole === 'admin' ? 'user' : 'admin')}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 transition-all ${
                                userRole === 'admin'
                                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                              }`}
                              title="Click để đổi phân quyền"
                            >
                              <Shield size={12} />
                              <span>{userRole.toUpperCase()}</span>
                            </button>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400">{u.email}</td>
                          <td className="p-3.5 text-slate-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-3.5 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleInspectUserProgress(u.id)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <TrendingUp size={14} />
                              <span>Tiến trình học</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COLLOCATIONS MANAGER */}
          {activeTab === 'collocations' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Quản lý IELTS Collocations</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Danh mục cụm từ vựng C1/C2 dùng cho luyện tập ghép từ</p>
                </div>
                <button
                  onClick={() => setShowAddCollocModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus size={16} />
                  <span>Thêm Collocation mới</span>
                </button>
              </div>

              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Cụm từ (Full Phrase)</th>
                      <th className="p-3.5">Nghĩa tiếng Việt</th>
                      <th className="p-3.5">Chủ đề IELTS</th>
                      <th className="p-3.5">CEFR</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredColloc.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold">
                          <span className="text-indigo-600 dark:text-indigo-400">{c.headWord}</span> {c.tailChunk}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{c.meaningVi}</td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                            {c.ieltsTopic}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-rose-500">{c.cefrLevel}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteCollocation(c.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Xóa cụm từ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SPEAKING PROMPTS MANAGER */}
          {activeTab === 'speaking' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Quản lý bài tập Speaking</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Danh sách các câu hỏi IELTS Speaking Part 1, 2, 3</p>
                </div>
                <button
                  onClick={() => setShowAddSpeakingModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus size={16} />
                  <span>Thêm bài Speaking</span>
                </button>
              </div>

              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Part</th>
                      <th className="p-3.5">Chủ đề (Topic)</th>
                      <th className="p-3.5">Câu hỏi (Prompt)</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSpeaking.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold">
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-[11px]">
                            Part {s.part}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-700 dark:text-slate-200">{s.topic}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-md truncate">{s.questionPrompt}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteSpeaking(s.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Xóa bài Speaking"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM & MAINTENANCE */}
          {activeTab === 'system' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Database size={18} className="text-indigo-500" />
                  Trạng thái hệ thống & Cơ sở dữ liệu
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Cơ sở dữ liệu</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">SQLite / Postgres Dialect Active</p>
                  </div>
                  <div className="p-3.5 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">AI Evaluator Engine</p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-1">Gemini AI Studio Ready</p>
                  </div>
                  <div className="p-3.5 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">SRS Algorithm</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400 mt-1">DSR Dual-Stability Enabled</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: USER PROGRESS MONITORING INSPECTOR */}
      {selectedUserProgress && (
        <div className="fixed inset-0 z-[99990] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-6 text-xs custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold flex items-center justify-center text-base shadow-md">
                  {selectedUserProgress.user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-2">
                    {selectedUserProgress.user.name}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        selectedUserProgress.user.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      }`}
                    >
                      {selectedUserProgress.user.role.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{selectedUserProgress.user.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserProgress(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Top 4 Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Metric 1: Retention & Accuracy */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Tỷ lệ ghi nhớ & Chính xác
                  </p>
                  <h3 className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
                    {selectedUserProgress.overview?.accuracyRate ?? 0}%
                  </h3>
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                  Tính trên {selectedUserProgress.overview?.totalCompletedTurns ?? 0} lượt hoàn thành
                </p>
              </div>

              {/* Metric 2: Single Sentence Translation */}
              <div className="p-4 bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-950/40 dark:to-violet-950/40 rounded-2xl border border-purple-200/60 dark:border-purple-800/60 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Dịch Câu Đơn đã làm
                  </p>
                  <h3 className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                    {selectedUserProgress.overview?.singleSentence?.total ?? 0} câu
                  </h3>
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                  Đã đúng {selectedUserProgress.overview?.singleSentence?.correct ?? 0}/{selectedUserProgress.overview?.singleSentence?.total ?? 0} câu
                </p>
              </div>

              {/* Metric 3: Paragraph Translation */}
              <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Dịch Đoạn Văn đã làm
                  </p>
                  <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    {selectedUserProgress.overview?.paragraph?.total ?? 0} đoạn
                  </h3>
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                  Bài viết IELTS / Đoạn văn đã chấm AI
                </p>
              </div>

              {/* Metric 4: Streak */}
              <div className="p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 rounded-2xl border border-amber-200/60 dark:border-amber-800/60 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Chuỗi ngày học
                  </p>
                  <h3 className="text-2xl font-black text-amber-700 dark:text-amber-300 flex items-center gap-1 mt-1">
                    <Flame size={20} className="text-amber-500 fill-amber-500" />
                    {selectedUserProgress.streak?.currentStreak ?? 0} ngày
                  </h3>
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                  Kỷ lục: {selectedUserProgress.streak?.longestStreak ?? 0} ngày liên tiếp
                </p>
              </div>
            </div>

            {/* PHÂN BỔ TRÍ NHỚ (Memory Distribution Section) */}
            <div className="bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-500" />
                  PHÂN BỔ TRÍ NHỚ
                </h4>
                <p className="text-[11px] font-semibold text-slate-400">Giai đoạn ghi nhớ từ vựng (SRS Spaced Repetition)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Stage 1: New */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Từ mới (Chưa học)
                    </span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedUserProgress.overview?.memoryStages?.new?.count ?? 0} thẻ ({selectedUserProgress.overview?.memoryStages?.new?.percentage ?? 0}%)
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedUserProgress.overview?.memoryStages?.new?.percentage ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Stage 2: Learning */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                      Đang học (Khoảng cách &lt; 2 ngày)
                    </span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedUserProgress.overview?.memoryStages?.learning?.count ?? 0} thẻ ({selectedUserProgress.overview?.memoryStages?.learning?.percentage ?? 0}%)
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedUserProgress.overview?.memoryStages?.learning?.percentage ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Stage 3: Consolidating */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase">
                      Đang củng cố (Khoảng cách 2 - 30 ngày)
                    </span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedUserProgress.overview?.memoryStages?.consolidating?.count ?? 0} thẻ ({selectedUserProgress.overview?.memoryStages?.consolidating?.percentage ?? 0}%)
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-violet-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedUserProgress.overview?.memoryStages?.consolidating?.percentage ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Stage 4: Mastered */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      Thành thạo (Khoảng cách ≥ 30 ngày)
                    </span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedUserProgress.overview?.memoryStages?.mastered?.count ?? 0} thẻ ({selectedUserProgress.overview?.memoryStages?.mastered?.percentage ?? 0}%)
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedUserProgress.overview?.memoryStages?.mastered?.percentage ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* NHẬT KÝ LUYỆN TẬP BÀI LÀM (Practice Log & History) */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-indigo-500" />
                    NHẬT KÝ LUYỆN TẬP BÀI LÀM
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-400">Lịch sử & Nhật ký dịch bài</p>
                </div>

                {/* Log Tabs switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setModalLogTab('sentence')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      modalLogTab === 'sentence'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Dịch Câu Đơn ({selectedUserProgress.sentenceLogs?.length ?? 0})
                  </button>
                  <button
                    onClick={() => setModalLogTab('paragraph')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      modalLogTab === 'paragraph'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Dịch Đoạn Văn ({selectedUserProgress.paragraphSubmissions?.length ?? 0})
                  </button>
                  <button
                    onClick={() => setModalLogTab('speaking')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      modalLogTab === 'speaking'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Speaking AI ({selectedUserProgress.speakingSubmissions?.length ?? 0})
                  </button>
                </div>
              </div>

              {/* Tab 1: Single Sentence Translations Log */}
              {modalLogTab === 'sentence' && (
                <div>
                  {selectedUserProgress.sentenceLogs?.length === 0 ? (
                    <p className="text-slate-400 italic p-4 bg-slate-100/40 dark:bg-slate-800/40 rounded-xl text-center">
                      Học viên chưa có nhật ký dịch câu đơn nào.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                      {selectedUserProgress.sentenceLogs?.map((log: any) => (
                        <div
                          key={log.id}
                          className="p-3 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                              {log.vietnameseText || 'Câu dịch đơn'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                log.isCorrect
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {log.isCorrect ? 'Đã đúng' : 'Chưa đúng'}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                            Bài làm: "{log.userSubmission}"
                          </p>
                          {log.matchedCanonical && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic">
                              Đáp án chuẩn: {log.matchedCanonical}
                            </p>
                          )}
                          <p className="text-[9px] text-slate-400 text-right">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Paragraph Submissions Log */}
              {modalLogTab === 'paragraph' && (
                <div>
                  {selectedUserProgress.paragraphSubmissions?.length === 0 ? (
                    <p className="text-slate-400 italic p-4 bg-slate-100/40 dark:bg-slate-800/40 rounded-xl text-center">
                      Học viên chưa thực hiện bài dịch đoạn văn nào.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                      {selectedUserProgress.paragraphSubmissions?.map((p: any) => (
                        <div
                          key={p.id}
                          className="p-3.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                              {p.subTopic || 'Đoạn văn dịch'}
                            </span>
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[10px]">
                              CEFR {p.estimatedCefr || 'B2'}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                            <strong className="text-slate-900 dark:text-slate-100">Bài dịch:</strong> "{p.userTranslation}"
                          </p>
                          {p.overallFeedback && (
                            <div className="p-2 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-lg text-indigo-700 dark:text-indigo-300 text-[10px]">
                              <strong className="block mb-0.5">Nhận xét AI:</strong> {p.overallFeedback}
                            </div>
                          )}
                          <p className="text-[9px] text-slate-400 text-right">
                            {new Date(p.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Speaking Submissions Log */}
              {modalLogTab === 'speaking' && (
                <div>
                  {selectedUserProgress.speakingSubmissions?.length === 0 ? (
                    <p className="text-slate-400 italic p-4 bg-slate-100/40 dark:bg-slate-800/40 rounded-xl text-center">
                      Học viên chưa thực hiện bài nói Speaking nào.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                      {selectedUserProgress.speakingSubmissions?.map((s: any) => (
                        <div
                          key={s.id}
                          className="p-3.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-violet-600 dark:text-violet-400">
                              {s.topic} (Part {s.part})
                            </span>
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 text-[10px]">
                              IELTS Band {s.estimatedBand || 'N/A'}
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                            Prompt: "{s.questionPrompt}"
                          </p>
                          <div className="p-2 bg-white/70 dark:bg-slate-900/70 rounded-lg text-slate-600 dark:text-slate-300 text-[11px] italic">
                            Bài nói ghi âm: "{s.transcribedText}"
                          </div>
                          {s.improvedVersion && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              <strong>Gợi ý nâng cấp:</strong> {s.improvedVersion}
                            </p>
                          )}
                          <p className="text-[9px] text-slate-400 text-right">
                            {new Date(s.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[99990] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl flex flex-col gap-4 text-xs"
          >
            <h3 className="font-bold text-base">Tạo tài khoản người dùng mới</h3>

            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                Hủy
              </button>
              <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-md">
                Tạo tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD COLLOCATION */}
      {showAddCollocModal && (
        <div className="fixed inset-0 z-[99990] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCollocation}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col gap-3.5 text-xs"
          >
            <h3 className="font-bold text-base">Thêm IELTS Collocation mới</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Từ chính (Head Word)</label>
                <input
                  type="text"
                  required
                  value={newHeadWord}
                  onChange={(e) => setNewHeadWord(e.target.value)}
                  placeholder="ví dụ: robust"
                  className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Phần đuôi (Tail Chunk)</label>
                <input
                  type="text"
                  required
                  value={newTailChunk}
                  onChange={(e) => setNewTailChunk(e.target.value)}
                  placeholder="ví dụ: evidence"
                  className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Cụm từ đầy đủ (Full Phrase)</label>
              <input
                type="text"
                required
                value={newFullPhrase}
                onChange={(e) => setNewFullPhrase(e.target.value)}
                placeholder="robust evidence"
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Nghĩa tiếng Việt</label>
              <input
                type="text"
                required
                value={newMeaningVi}
                onChange={(e) => setNewMeaningVi(e.target.value)}
                placeholder="bằng chứng đanh thép, vững chắc"
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Ví dụ minh họa</label>
              <input
                type="text"
                required
                value={newExampleSentence}
                onChange={(e) => setNewExampleSentence(e.target.value)}
                placeholder="The researchers provided robust evidence..."
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Cấp độ (CEFR)</label>
                <select
                  value={newCefrLevel}
                  onChange={(e) => setNewCefrLevel(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500 font-bold"
                >
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Chủ đề IELTS</label>
                <input
                  type="text"
                  required
                  value={newIeltsTopic}
                  onChange={(e) => setNewIeltsTopic(e.target.value)}
                  placeholder="Environment, Technology..."
                  className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddCollocModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                Hủy
              </button>
              <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-md">
                Thêm cụm từ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD SPEAKING PROMPT */}
      {showAddSpeakingModal && (
        <div className="fixed inset-0 z-[99990] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSpeaking}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col gap-3.5 text-xs"
          >
            <h3 className="font-bold text-base">Thêm bài tập Speaking mới</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Part (1, 2 hoặc 3)</label>
                <select
                  value={newSpeakingPart}
                  onChange={(e) => setNewSpeakingPart(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500 font-bold"
                >
                  <option value={1}>Part 1</option>
                  <option value={2}>Part 2 (Cue Card)</option>
                  <option value={3}>Part 3 (Discussion)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Chủ đề (Topic)</label>
                <input
                  type="text"
                  required
                  value={newSpeakingTopic}
                  onChange={(e) => setNewSpeakingTopic(e.target.value)}
                  placeholder="Hometown, Work..."
                  className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Câu hỏi (Question Prompt)</label>
              <textarea
                required
                rows={2}
                value={newSpeakingQuestion}
                onChange={(e) => setNewSpeakingQuestion(e.target.value)}
                placeholder="Describe a piece of technology that you use often..."
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Bài nói mẫu (Model Response)</label>
              <textarea
                rows={3}
                value={newSpeakingModelResponse}
                onChange={(e) => setNewSpeakingModelResponse(e.target.value)}
                placeholder="Well, one device I rely on heavily is..."
                className="w-full bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl outline-none border border-transparent focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddSpeakingModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                Hủy
              </button>
              <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-md">
                Lưu bài Speaking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
