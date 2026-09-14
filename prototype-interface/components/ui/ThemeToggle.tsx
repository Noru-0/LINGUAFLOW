'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
  variant?: 'icon' | 'full'
  className?: string
}

export function ThemeToggle({ theme, onToggle, variant = 'icon', className = '' }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`theme-toggle-btn full ${className}`}
        title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
      >
        {isDark ? (
          <>
            <Sun size={16} className="theme-icon sun text-amber-400" />
            <span>Giao diện Sáng</span>
          </>
        ) : (
          <>
            <Moon size={16} className="theme-icon moon text-indigo-400" />
            <span>Giao diện Tối</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`theme-toggle-btn icon ${className}`}
      title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={18} className="theme-icon sun text-amber-400" />
      ) : (
        <Moon size={18} className="theme-icon moon text-indigo-500" />
      )}
    </button>
  )
}
