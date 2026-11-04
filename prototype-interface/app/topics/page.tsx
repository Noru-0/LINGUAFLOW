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
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Về Trang Chủ LinguaFlow
          </button>
          <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            Topic Taxonomy v1.4.0
          </div>
        </div>
      </header>

      <main className="pb-16">
        <TopicExplorer setView={() => router.push('/')} />
      </main>
    </div>
  )
}

