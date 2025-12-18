'use client'

import { LPHeroContent } from '@/app/juku/types'

interface Props {
  content: LPHeroContent
  primaryColor: string
  accentColor: string
}

export function LPHeroSection({ content, primaryColor, accentColor }: Props) {
  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={{
        background: content.backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${content.backgroundImage}) center/cover`
          : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
      }}
    >
      {/* 装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-20"
          style={{ background: accentColor }}
        />
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: '#fff' }}
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* バッジ */}
        {content.badge && (
          <div className="inline-block mb-6 animate-pulse">
            <span
              className="px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg"
              style={{ background: accentColor }}
            >
              {content.badge}
            </span>
          </div>
        )}

        {/* タイトル */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg">
          {content.title}
        </h1>

        {/* サブタイトル */}
        <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
          {content.subtitle}
        </p>

        {/* CTAボタン */}
        <a
          href={content.ctaLink}
          className="inline-block px-10 py-5 text-lg md:text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
          style={{
            background: accentColor,
            color: 'white',
          }}
        >
          {content.ctaText}
        </a>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-8 h-8 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}
