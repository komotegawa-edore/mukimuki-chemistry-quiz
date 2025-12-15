'use client'

import { TeachersContent } from '../../types'

interface Props {
  content: TeachersContent
  primaryColor: string
  secondaryColor: string
}

export function TeachersSection({ content, primaryColor }: Props) {
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

        {/* 講師カード */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.teachers.map((teacher, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow"
            >
              {/* 写真 */}
              <div
                className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl"
                style={{
                  backgroundColor: teacher.photo ? 'transparent' : `${primaryColor}20`,
                  backgroundImage: teacher.photo ? `url(${teacher.photo})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!teacher.photo && '👨‍🏫'}
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
                {teacher.subjects.map((subject, i) => (
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
          ))}
        </div>
      </div>
    </section>
  )
}
