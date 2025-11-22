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
                      <Link
                        key={chapter.id}
                        href={`/dashboard/questions/${chapter.id}`}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-black">{chapter.title}</h3>
                          <span className="text-sm text-gray-600">#{chapter.order_num}</span>
                        </div>
                        <p className="text-sm text-blue-600 mt-2">問題を管理 →</p>
                      </Link>
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
