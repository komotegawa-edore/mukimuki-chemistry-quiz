'use client'

import { useState, useRef } from 'react'
import { TeachersContent } from '../../types'

interface Props {
  content: TeachersContent
  primaryColor: string
  secondaryColor: string
}

export function TeachersSection({ content, primaryColor }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScroll, 300)
    }
  }

  const layout = content.layout || 'grid'

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
          <div
            className="w-20 h-1 mx-auto mt-6 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* グリッドレイアウト */}
        {layout === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.teachers.map((teacher, index) => (
              <TeacherCard key={index} teacher={teacher} primaryColor={primaryColor} />
            ))}
          </div>
        )}

        {/* カルーセルレイアウト */}
        {layout === 'carousel' && (
          <div className="relative">
            {/* ナビボタン */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* スクロールコンテナ */}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {content.teachers.map((teacher, index) => (
                <div key={index} className="flex-shrink-0 w-80 snap-center">
                  <TeacherCard teacher={teacher} primaryColor={primaryColor} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// 講師カードコンポーネント
function TeacherCard({ teacher, primaryColor }: { teacher: TeachersContent['teachers'][0]; primaryColor: string }) {
  return (
    <div className="bg-gray-50 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow h-full">
      {/* 写真 */}
      <div
        className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: teacher.photo ? 'transparent' : `${primaryColor}15`,
        }}
      >
        {teacher.photo ? (
          <img
            src={teacher.photo}
            alt={teacher.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-16 h-16"
            style={{ color: primaryColor }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </div>

      {/* 名前 */}
      <h3 className="text-xl font-bold text-gray-800 mb-1">
        {teacher.name}
      </h3>

      {/* 役職 */}
      <p
        className="text-sm font-medium mb-4"
        style={{ color: primaryColor }}
      >
        {teacher.role}
      </p>

      {/* 担当科目 */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {(teacher.subjects || []).map((subject, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-600 border border-gray-200"
          >
            {subject}
          </span>
        ))}
      </div>

      {/* メッセージ */}
      <p className="text-gray-600 text-sm leading-relaxed">
        「{teacher.message}」
      </p>
    </div>
  )
}
