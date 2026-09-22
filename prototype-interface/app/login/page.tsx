'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Zap,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { TotoroMascot } from '@/components/ui/TotoroMascot'

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [theme, setTheme] = useState<'light' | 'dark' | 'pink'>('light')

  // Login Form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register Form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại')
      }

      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...')
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Xảy ra lỗi khi đăng nhập')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError(null)
    setSuccessMsg(null)
    setLoading(true)
    setLoginEmail('alex@linguaflow.internal')
    setLoginPassword('password123')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alex@linguaflow.internal', password: 'password123' }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập demo thất bại')
      }

      setSuccessMsg('Đã đăng nhập thành công với tài khoản Alex Lee!')
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Không thể đăng nhập tài khoản demo')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }

    if (regPassword.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự!')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký tài khoản thất bại')
      }

      setSuccessMsg('Tạo tài khoản thành công! Đang chuyển hướng...')
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Xảy ra lỗi trong quá trình đăng ký')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-container">
      {/* Top Navbar */}
      <header className="login-navbar">
        <div className="brand" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-mark">
            <GraduationCap size={19} strokeWidth={2.5} />
          </div>
          <span>
            lingua<span>flow</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="login-content-wrap">
        {/* Left Side: Hero Info */}
        <div className="login-hero-info">
          <span className="hero-pill">
            <Sparkles size={14} /> HỆ THỐNG HỌC TIẾNG ANH SRS
          </span>
          <h1>Nâng tầm vốn từ vựng cùng LinguaFlow</h1>
          <p>
            Không gian học tập chuyên sâu tích hợp thuật toán lặp lại ngắt quãng (SRS), luyện dịch câu ngữ pháp và phân tích độ bền trí nhớ chuẩn khoa học.
          </p>

          <div className="login-features-list">
            <div className="feature-item">
              <div className="feature-icon blue">
                <Zap size={18} />
              </div>
              <div>
                <strong>Ôn tập thuật toán SRS</strong>
                <span>Tối ưu hóa thời gian ghi nhớ từng từ vựng</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon purple">
                <BookOpen size={18} />
              </div>
              <div>
                <strong>Luyện dịch phản xạ</strong>
                <span>Tự động chấm điểm cấu trúc câu chuẩn xác</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login / Register Form Card */}
        <div className="login-card-container">
          <div className="auth-modal-card login-page-card">
            {/* Header */}
            <div className="auth-modal-header" style={{ marginBottom: '16px' }}>
              <div className="auth-brand">
                <div className="logo-mark" style={{ width: 34, height: 34 }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px' }}>Tham gia LinguaFlow</h3>
                  <p>Đồng bộ dữ liệu và theo dõi tiến trình của bạn</p>
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="auth-tabs" style={{ marginBottom: '18px' }}>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('login')
                  setError(null)
                }}
              >
                <LogIn size={15} /> Đăng nhập
              </button>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('register')
                  setError(null)
                }}
              >
                <UserPlus size={15} /> Đăng ký
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="auth-alert error">
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="auth-alert success">
                <CheckCircle2 size={16} /> <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label htmlFor="page-login-email">Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="page-login-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="page-login-password">Mật khẩu</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      id="page-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-primary-btn" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Đăng nhập ngay'}
                </button>

                <div className="auth-divider">
                  <span>hoặc trải nghiệm nhanh</span>
                </div>

                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={handleDemoLogin}
                  disabled={loading}
                >
                  <Sparkles size={16} className="text-amber-500" />
                  <span>Dùng Tài Khoản Demo (Alex Lee)</span>
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label htmlFor="page-reg-name">Họ và Tên</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      id="page-reg-name"
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="page-reg-email">Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="page-reg-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="page-reg-password">Mật khẩu</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      id="page-reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="page-reg-confirm">Xác nhận mật khẩu</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      id="page-reg-confirm"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập lại mật khẩu"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-primary-btn" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Tạo tài khoản mới'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <TotoroMascot />
    </div>
  )
}
