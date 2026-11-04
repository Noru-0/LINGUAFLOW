'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { TopicExplorer } from '@/components/topics/TopicExplorer'
import { ArrowLeft } from 'lucide-react'

export default function TopicsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Về Trang Chủ LinguaFlow
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
              10 Major Themes • 50+ Topics
            </span>
          </div>
        </div>
      </header>

      <main className="pb-16">
        <TopicExplorer setView={() => router.push('/')} />
      </main>
    </div>
  )
}

