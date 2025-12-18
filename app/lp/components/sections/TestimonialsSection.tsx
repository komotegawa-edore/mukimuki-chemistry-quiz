'use client'

import { TestimonialsContent } from '@/app/juku/types'
import { Quote, TrendingUp, GraduationCap } from 'lucide-react'

interface Props {
  content: TestimonialsContent
  primaryColor: string
  accentColor: string
}

export function TestimonialsSection({ content, primaryColor, accentColor }: Props) {
  return (
    <section className="py-16 md:py-24" style={{ background: `${primaryColor}08` }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: primaryColor }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
        </div>

        {/* 体験談カード */}
        <div className="grid md:grid-cols-2 gap-8">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg relative overflow-hidden"
            >
              {/* 引用符アイコン */}
              <div
                className="absolute -top-4 -left-4 w-20 h-20 rounded-full flex items-center justify-center opacity-10"
                style={{ background: primaryColor }}
              >
                <Quote className="w-10 h-10" style={{ color: primaryColor }} />
              </div>

              {/* コンテンツ */}
              <div className="relative z-10">
                {/* 名前・写真 */}
                <div className="flex items-center gap-4 mb-4">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ background: primaryColor }}
                    >
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    {item.school && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {item.school}
                      </p>
                    )}
                  </div>
                </div>

                {/* テキスト */}
                <p className="text-gray-600 leading-relaxed mb-4">{item.text}</p>

                {/* 結果バッジ */}
                {item.result && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold"
                    style={{
                      background: `${accentColor}20`,
                      color: accentColor,
                    }}
                  >
                    <TrendingUp className="w-5 h-5" />
                    {item.result}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
