'use client'

import { BeforeAfterContent } from '@/app/juku/types'
import { ArrowRight, TrendingUp } from 'lucide-react'

interface Props {
  content: BeforeAfterContent
  primaryColor: string
  accentColor: string
}

export function BeforeAfterSection({ content, primaryColor, accentColor }: Props) {
  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      style={{
        background: content.backgroundImage
          ? `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${content.backgroundImage})`
          : 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: primaryColor }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
        </div>

        {/* ビフォーアフターカード */}
        <div className="grid md:grid-cols-3 gap-6">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              {/* ラベル */}
              <p className="text-center font-bold text-gray-600 mb-6">{item.label}</p>

              {/* ビフォーアフター */}
              <div className="flex items-center justify-center gap-4">
                {/* Before */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">BEFORE</p>
                  <p className="text-2xl md:text-3xl font-black text-gray-400">
                    {item.before}
                  </p>
                </div>

                {/* 矢印 */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${accentColor}20` }}
                >
                  <ArrowRight className="w-5 h-5" style={{ color: accentColor }} />
                </div>

                {/* After */}
                <div className="text-center">
                  <p className="text-xs mb-1" style={{ color: accentColor }}>
                    AFTER
                  </p>
                  <p
                    className="text-2xl md:text-3xl font-black"
                    style={{ color: accentColor }}
                  >
                    {item.after}
                  </p>
                </div>
              </div>

              {/* 期間 */}
              {item.period && (
                <div className="text-center mt-4">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: `${primaryColor}10`,
                      color: primaryColor,
                    }}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {item.period}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
