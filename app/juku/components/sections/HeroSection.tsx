'use client'

import { HeroContent } from '../../types'

interface Props {
  content: HeroContent
  primaryColor: string
  secondaryColor: string
  siteName: string
}

export function HeroSection({ content, primaryColor, secondaryColor, siteName }: Props) {
  return (
    <section
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      style={{
        background: content.backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${content.backgroundImage}) center/cover`
          : `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`
      }}
    >
      {/* 装飾 */}
      {!content.backgroundImage && (
        <>
          <div
            className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 blur-xl"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-15 blur-2xl"
            style={{ backgroundColor: secondaryColor }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full opacity-10 blur-lg"
            style={{ backgroundColor: primaryColor }}
          />
        </>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* ロゴ/塾名 */}
        <div className="mb-6">
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${primaryColor}20`,
              color: primaryColor
            }}
          >
            {siteName}
          </span>
        </div>

        {/* メインタイトル */}
        <h1
          className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
            content.backgroundImage ? 'text-white' : 'text-gray-800'
          }`}
        >
          {content.title}
        </h1>

        {/* サブタイトル */}
        <p
          className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto ${
            content.backgroundImage ? 'text-gray-100' : 'text-gray-600'
          }`}
        >
          {content.subtitle}
        </p>

        {/* CTA */}
        {content.ctaText && (
          <a
            href={content.ctaLink || '#contact'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            style={{ backgroundColor: primaryColor }}
          >
            {content.ctaText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>

      {/* 波形の装飾 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
