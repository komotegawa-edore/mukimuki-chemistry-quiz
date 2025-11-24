'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Home, Target, RotateCcw, ChevronDown, ChevronRight, Coins } from 'lucide-react'
import PointsDisplay from './PointsDisplay'
import BadgeDisplay from './BadgeDisplay'
import StreakDisplay from './StreakDisplay'
import WelcomeModal from './WelcomeModal'

interface Subject {
  id: number
  name: string
  description: string | null
  media_type: 'text' | 'image' | 'audio' | 'mixed'
  display_order: number
}

interface Chapter {
  id: number
  title: string
  order_num: number
  subject_id: number
  is_published: boolean
  subject?: Subject
}

interface ChapterResult {
  score: number
  total: number
}

interface HomeContentProps {
  subjects: Subject[]
  chapters: Chapter[]
  latestResults: Map<number, ChapterResult>
  clearedTodayIds: Set<number>
}

export default function HomeContent({
  subjects,
  chapters,
  latestResults,
  clearedTodayIds,
}: HomeContentProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'quest'>('quest')
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(
    new Set([1]) // デフォルトで無機化学（id=1）を展開
  )

  const toggleSubject = (subjectId: number) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId)
      } else {
        newSet.add(subjectId)
      }
      return newSet
    })
  }

  // 教科ごとに章をグループ化
  const chaptersBySubject = chapters.reduce(
    (acc, chapter) => {
      if (!acc[chapter.subject_id]) {
        acc[chapter.subject_id] = []
      }
      acc[chapter.subject_id].push(chapter)
      return acc
    },
    {} as Record<number, Chapter[]>
  )

  return (
    <>
      <WelcomeModal />
      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Roopyキャラクター挨拶 */}
            <div className="bg-gradient-to-br from-[#E0F7F1] to-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/Roopy.png"
                  alt="Roopy"
                  width={80}
                  height={80}
                  className="flex-shrink-0"
                />
                <div>
                  <h2 className="text-xl font-bold text-[#3A405A] mb-2">
                    ようこそ、受験の森へ！
                  </h2>
                  <p className="text-[#3A405A] text-sm opacity-80">
                    今日も一緒に頑張りましょう 🌱
                  </p>
                </div>
              </div>
            </div>

            {/* ポイント表示 */}
            <PointsDisplay />

            {/* 連続ログイン表示 */}
            <StreakDisplay />

            {/* バッジ表示 */}
            <BadgeDisplay />
          </div>
        )}

        {activeTab === 'quest' && (
          <div>
            {/* 復習モードカード */}
            <div className="mb-8">
              <Link
                href="/review"
                className="block bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <RotateCcw className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">
                        復習モード
                      </h2>
                      <p className="text-white/90 text-sm">
                        間違えた問題を復習しましょう
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>
              </Link>
            </div>

            {/* 教科セクション */}
            <div className="space-y-6">
              {subjects.map((subject) => {
                const subjectChapters = chaptersBySubject[subject.id] || []
                const isExpanded = expandedSubjects.has(subject.id)
                const isComingSoon = subject.id !== 1 // 無機化学以外は実装中

                return (
                  <div key={subject.id} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-[#E0F7F1]">
                    {/* 教科ヘッダー（トグル） */}
                    <button
                      onClick={() => toggleSubject(subject.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F4F9F7] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold text-[#3A405A]">
                            {subject.name}
                          </h2>
                          {isComingSoon && (
                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              実装中
                            </span>
                          )}
                        </div>
                        {subject.description && (
                          <p className="text-sm text-[#3A405A] opacity-70 hidden md:block">
                            {subject.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#3A405A] opacity-70">
                          {subjectChapters.length}章
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#5DDFC3] transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* 章一覧（展開時） */}
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        {subjectChapters.length === 0 ? (
                          <div className="text-center py-8 text-[#3A405A] opacity-70">
                            準備中です
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjectChapters.map((chapter) => {
                              const result = latestResults.get(chapter.id)
                              const percentage = result
                                ? Math.round((result.score / result.total) * 100)
                                : null
                              const canEarnPoints = !clearedTodayIds.has(chapter.id)

                              return (
                                <Link
                                  key={chapter.id}
                                  href={`/quiz/${chapter.id}`}
                                  className="relative bg-gradient-to-br from-white to-[#F4F9F7] rounded-xl shadow-sm p-6 hover:shadow-lg hover:scale-105 transition-all overflow-hidden border-2 border-[#E0F7F1]"
                                >
                                  {/* ポイント獲得可能バッジ */}
                                  {canEarnPoints && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md flex items-center gap-1">
                                      <Coins className="w-3 h-3" />
                                      +1pt獲得可能
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg text-[#3A405A]">
                                      {chapter.title}
                                    </h3>
                                    <span className="text-sm text-[#5DDFC3] font-semibold">
                                      #{chapter.order_num}
                                    </span>
                                  </div>

                                  {percentage !== null && (
                                    <div className="mt-4">
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[#3A405A] opacity-70">前回の結果</span>
                                        <span
                                          className={`font-semibold ${
                                            percentage >= 80
                                              ? 'text-[#5DDFC3]'
                                              : percentage >= 60
                                                ? 'text-yellow-600'
                                                : 'text-red-500'
                                          }`}
                                        >
                                          {percentage}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-[#E0F7F1] rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            percentage >= 80
                                              ? 'bg-[#5DDFC3]'
                                              : percentage >= 60
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                          }`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {percentage === null && (
                                    <p className="text-sm text-[#3A405A] opacity-70 mt-4">未挑戦</p>
                                  )}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* 下部タブバー */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0F7F1] shadow-lg z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around">
            {/* ホームタブ */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                activeTab === 'home'
                  ? 'text-[#5DDFC3]'
                  : 'text-[#3A405A] opacity-50 hover:opacity-70'
              }`}
            >
              <Home
                className="w-6 h-6 mb-1"
                fill={activeTab === 'home' ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">ホーム</span>
            </button>

            {/* クエストタブ */}
            <button
              onClick={() => setActiveTab('quest')}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                activeTab === 'quest'
                  ? 'text-[#5DDFC3]'
                  : 'text-[#3A405A] opacity-50 hover:opacity-70'
              }`}
            >
              <Target
                className="w-6 h-6 mb-1"
                fill={activeTab === 'quest' ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">クエスト</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
