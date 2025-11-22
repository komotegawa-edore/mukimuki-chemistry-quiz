'use client'

import { useState } from 'react'
import Link from 'next/link'

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

interface DashboardContentProps {
  subjects: Subject[]
  chapters: Chapter[]
}

export default function DashboardContent({
  subjects,
  chapters,
}: DashboardContentProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(
    new Set([1]) // デフォルトで無機化学を展開
  )
  const [localChapters, setLocalChapters] = useState<Chapter[]>(chapters)

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

  const handleToggleChapterPublish = async (chapter: Chapter) => {
    try {
      const response = await fetch(`/api/chapters/${chapter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_published: !chapter.is_published,
        }),
      })
      if (!response.ok) throw new Error('Failed to toggle publish status')

      // ローカルステートを更新
      setLocalChapters((prev) =>
        prev.map((ch) =>
          ch.id === chapter.id
            ? { ...ch, is_published: !ch.is_published }
            : ch
        )
      )
    } catch (err) {
      alert('公開状態の切り替えに失敗しました')
      console.error(err)
    }
  }

  // 教科ごとに章をグループ化
  const chaptersBySubject = localChapters.reduce(
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
                    {subjectChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-black">{chapter.title}</h3>
                            {chapter.is_published ? (
                              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                公開中
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                                非公開
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">#{chapter.order_num}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleToggleChapterPublish(chapter)}
                            className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                              chapter.is_published
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {chapter.is_published ? '非公開にする' : '公開する'}
                          </button>
                          <Link
                            href={`/dashboard/questions/${chapter.id}`}
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 text-center"
                          >
                            問題を管理
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
