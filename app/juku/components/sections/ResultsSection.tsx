'use client'

import { ResultsContent } from '../../types'

interface Props {
  content: ResultsContent
  primaryColor: string
  secondaryColor: string
}

export function ResultsSection({ content, primaryColor, secondaryColor }: Props) {
  // 学校ごとにグループ化
  const items = content.items || []
  const groupedResults = items.reduce((acc, item) => {
    if (!acc[item.school]) {
      acc[item.school] = 0
    }
    acc[item.school] += item.count
    return acc
  }, {} as Record<string, number>)

  const totalCount = Object.values(groupedResults).reduce((a, b) => a + b, 0)

  return (
    <section
      className="py-20 px-6"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}10 100%)`
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {content.title}
          </h2>
          {content.subtitle && (
            <p
              className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white mb-4"
              style={{ backgroundColor: primaryColor }}
            >
              {content.subtitle}
            </p>
          )}
          <div
            className="w-20 h-1 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* 合計 */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white rounded-3xl px-12 py-8 shadow-lg">
            <p className="text-gray-500 text-sm mb-2">合格者数</p>
            <p
              className="text-6xl font-bold"
              style={{ color: primaryColor }}
            >
              {totalCount}
              <span className="text-2xl text-gray-600 ml-2">名</span>
            </p>
          </div>
        </div>

        {/* 学校別 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(groupedResults).map(([school, count], index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <p className="text-gray-600 font-medium mb-2 text-sm">{school}</p>
              <p
                className="text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                {count}
                <span className="text-lg text-gray-500 ml-1">名</span>
              </p>
            </div>
          ))}
        </div>

        {/* 合格者の声 */}
        {content.testimonials && content.testimonials.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
              合格者の声
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {content.testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-md"
                >
                  <p className="text-gray-600 leading-relaxed mb-4">
                    「{testimonial.text}」
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.school} 合格</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
