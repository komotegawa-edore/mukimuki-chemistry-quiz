'use client'

import { useState } from 'react'
import Link from 'next/link'
import PointsDisplay from './PointsDisplay'
import BadgeDisplay from './BadgeDisplay'
import StreakDisplay from './StreakDisplay'

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
      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {activeTab === 'home' && (
          <div className="space-y-6">
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
                className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:from-blue-600 hover:to-blue-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      復習モード
                    </h2>
                    <p className="text-blue-100 text-sm">
                      過去に間違えた問題を復習しましょう
                    </p>
                  </div>
                  <div className="text-white">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
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
                  <div key={subject.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* 教科ヘッダー（トグル） */}
                    <button
                      onClick={() => toggleSubject(subject.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold text-black">
                            {subject.name}
                          </h2>
                          {isComingSoon && (
                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              実装中
                            </span>
                          )}
                        </div>
                        {subject.description && (
                          <p className="text-sm text-gray-600 hidden md:block">
                            {subject.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {subjectChapters.length}章
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* 章一覧（展開時） */}
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        {subjectChapters.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
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
                                  className="relative bg-gray-50 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
                                >
                                  {/* ポイント獲得可能バッジ */}
                                  {canEarnPoints && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
                                      +1pt獲得可能
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg text-black">
                                      {chapter.title}
                                    </h3>
                                    <span className="text-sm text-black">
                                      #{chapter.order_num}
                                    </span>
                                  </div>

                                  {percentage !== null && (
                                    <div className="mt-4">
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-black">前回の結果</span>
                                        <span
                                          className={`font-semibold ${
                                            percentage >= 80
                                              ? 'text-green-600'
                                              : percentage >= 60
                                                ? 'text-yellow-600'
                                                : 'text-red-600'
                                          }`}
                                        >
                                          {percentage}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            percentage >= 80
                                              ? 'bg-green-500'
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
                                    <p className="text-sm text-black mt-4">未挑戦</p>
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around">
            {/* ホームタブ */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                activeTab === 'home'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg
                className="w-6 h-6 mb-1"
                fill={activeTab === 'home' ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-xs font-medium">ホーム</span>
            </button>

            {/* クエストタブ */}
            <button
              onClick={() => setActiveTab('quest')}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                activeTab === 'quest'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg
                className="w-6 h-6 mb-1"
                fill={activeTab === 'quest' ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs font-medium">クエスト</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
