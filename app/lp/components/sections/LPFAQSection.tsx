'use client'

import { useState } from 'react'
import { LPFAQContent } from '@/app/juku/types'
import { ChevronDown, MessageCircleQuestion } from 'lucide-react'

interface Props {
  content: LPFAQContent
  primaryColor: string
  accentColor: string
}

export function LPFAQSection({ content, primaryColor, accentColor }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `${primaryColor}15` }}
          >
            <MessageCircleQuestion className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black" style={{ color: primaryColor }}>
            {content.title}
          </h2>
        </div>

        {/* FAQ アコーディオン */}
        <div className="space-y-4">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: primaryColor }}
                  >
                    Q
                  </span>
                  <span className="font-bold text-gray-800">{item.question}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="flex items-start gap-3 pl-11">
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: `${accentColor}20`, color: accentColor }}
                    >
                      A
                    </span>
                    <p className="text-gray-600 leading-relaxed pt-1">{item.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
