'use client'

import { LPCTAContent } from '@/app/juku/types'
import { Phone, ArrowRight, Zap } from 'lucide-react'

interface Props {
  content: LPCTAContent
  primaryColor: string
  accentColor: string
}

export function LPCTASection({ content, primaryColor, accentColor }: Props) {
  if (content.style === 'floating') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-2xl md:hidden">
        <a
          href={content.buttonLink}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-lg font-bold text-white"
          style={{ background: primaryColor }}
        >
          {content.buttonText}
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    )
  }

  return (
    <section
      className={`py-12 md:py-16 ${content.style === 'urgent' ? 'animate-pulse-slow' : ''}`}
      style={{
        background:
          content.style === 'urgent'
            ? `linear-gradient(135deg, ${primaryColor} 0%, #dc2626 100%)`
            : primaryColor,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* 緊急アイコン */}
        {content.style === 'urgent' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-bold">今すぐお申し込み</span>
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
        )}

        {/* タイトル */}
        <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
          {content.title}
        </h2>

        {/* サブタイトル */}
        {content.subtitle && (
          <p className="text-white/80 text-lg mb-8">{content.subtitle}</p>
        )}

        {/* ボタン・電話 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <a
            href={content.buttonLink}
            className="inline-flex items-center gap-2 px-10 py-5 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
            style={{ background: accentColor, color: 'white' }}
          >
            {content.buttonText}
            <ArrowRight className="w-5 h-5" />
          </a>

          {content.phone && (
            <>
              <span className="text-white/60">または</span>
              <a
                href={`tel:${content.phone.replace(/-/g, '')}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <Phone className="w-5 h-5" />
                {content.phone}
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
