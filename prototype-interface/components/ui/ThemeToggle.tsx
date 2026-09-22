'use client'

import React from 'react'
import { Sun, Moon, Sparkles } from 'lucide-react'

export type Theme = 'light' | 'dark' | 'pink'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
  variant?: 'icon' | 'full'
  className?: string
}

export function ThemeToggle({ theme, onToggle, variant = 'icon', className = '' }: ThemeToggleProps) {
  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`theme-toggle-btn full theme-${theme} ${className}`}
        title={
          theme === 'light'
            ? 'Chuyển sang Chế độ Tối'
            : theme === 'dark'
            ? 'Chuyển sang Chế độ Hồng Năng Động'
            : 'Chuyển sang Chế độ Sáng'
        }
      >
        {theme === 'light' && (
          <>
            <Sun size={16} className="theme-icon sun text-amber-500" />
            <span>Giao diện Sáng</span>
          </>
        )}
        {theme === 'dark' && (
          <>
            <Moon size={16} className="theme-icon moon text-indigo-400" />
            <span>Giao diện Tối</span>
          </>
        )}
        {theme === 'pink' && (
          <>
            <Sparkles size={16} className="theme-icon sparkles text-pink-400" />
            <span>Giao diện Hồng</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`theme-toggle-btn icon theme-${theme} ${className}`}
      title={
        theme === 'light'
          ? 'Giao diện: Sáng (Click để đổi sang Tối)'
          : theme === 'dark'
          ? 'Giao diện: Tối (Click để đổi sang Hồng Năng Động)'
          : 'Giao diện: Hồng Năng Động (Click để đổi sang Sáng)'
      }
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun size={18} className="theme-icon sun text-amber-500" />}
      {theme === 'dark' && <Moon size={18} className="theme-icon moon text-indigo-400" />}
      {theme === 'pink' && <Sparkles size={18} className="theme-icon sparkles text-pink-400" />}
    </button>
  )
}

