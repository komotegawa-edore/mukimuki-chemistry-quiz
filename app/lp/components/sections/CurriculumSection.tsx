'use client'

import { CurriculumContent } from '@/app/juku/types'
import { Calendar, Clock, Target } from 'lucide-react'

interface Props {
  content: CurriculumContent
  primaryColor: string
  accentColor: string
}

export function CurriculumSection({ content, primaryColor, accentColor }: Props) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: primaryColor }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
        </div>

        {/* タイムライン */}
        <div className="relative">
          {/* 縦線 */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
            style={{ background: `${primaryColor}30` }}
          />

          {content.days.map((day, index) => (
            <div
              key={index}
              className={`relative flex items-start gap-6 mb-8 ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* ドット */}
              <div
                className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 z-10"
                style={{ background: primaryColor }}
              />

              {/* コンテンツ */}
              <div
                className={`ml-12 md:ml-0 md:w-5/12 p-6 rounded-xl shadow-lg ${
                  index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
                }`}
                style={{ background: index === 0 ? primaryColor : 'white' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar
                    className="w-5 h-5"
                    style={{ color: index === 0 ? 'white' : primaryColor }}
                  />
                  <span
                    className="font-bold"
                    style={{ color: index === 0 ? 'white' : primaryColor }}
                  >
                    {day.date}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Clock
                    className="w-4 h-4"
                    style={{ color: index === 0 ? 'white/80' : '#6b7280' }}
                  />
                  <span style={{ color: index === 0 ? 'white/80' : '#6b7280' }}>
                    {day.time}
                  </span>
                </div>

                <p
                  className="font-bold text-lg mb-2"
                  style={{ color: index === 0 ? 'white' : '#1f2937' }}
                >
                  {day.content}
                </p>

                {day.target && (
                  <div className="flex items-center gap-1">
                    <Target
                      className="w-4 h-4"
                      style={{ color: index === 0 ? accentColor : accentColor }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: index === 0 ? accentColor : accentColor }}
                    >
                      {day.target}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 注意書き */}
        {content.note && (
          <p className="text-center text-sm text-gray-500 mt-8">{content.note}</p>
        )}
      </div>
    </section>
  )
}
