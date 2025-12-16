'use client'

import { useState } from 'react'
import { FAQContent, JukuSite } from '../../types'

interface Props {
  content: FAQContent
  site: JukuSite
}

export function FAQSection({ content, site }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const items = content.items || []

  if (items.length === 0) return null

  return (
    <section id="faq" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: site.primary_color }}>
          {content.title}
        </h2>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: site.primary_color }}
                  >
                    Q
                  </span>
                  <span className="font-medium text-gray-800 pt-1">
                    {item.question}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="flex items-start gap-4 pt-2 border-t border-gray-100">
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mt-3"
                      style={{ backgroundColor: site.secondary_color }}
                    >
                      A
                    </span>
                    <p className="text-gray-600 leading-relaxed pt-4 whitespace-pre-wrap">
                      {item.answer}
                    </p>
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
