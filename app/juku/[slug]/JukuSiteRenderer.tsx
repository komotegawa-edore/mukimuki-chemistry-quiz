'use client'

import { JukuSite, JukuSection, SectionType, HeroContent, FeaturesContent, PricingContent, TeachersContent, ResultsContent, AccessContent, ContactContent, GalleryContent } from '../types'
import {
  HeroSection,
  FeaturesSection,
  PricingSection,
  TeachersSection,
  ResultsSection,
  AccessSection,
  ContactSection,
  GallerySection,
} from '../components/sections'

interface Props {
  site: JukuSite
  sections: JukuSection[]
  slug: string
}

export function JukuSiteRenderer({ site, sections, slug }: Props) {
  const renderSection = (section: JukuSection) => {
    const commonProps = {
      primaryColor: site.primary_color,
      secondaryColor: site.secondary_color,
      siteName: site.name,
    }

    switch (section.type as SectionType) {
      case 'hero':
        return (
          <HeroSection
            key={section.id}
            content={section.content as HeroContent}
            {...commonProps}
          />
        )
      case 'features':
        return (
          <FeaturesSection
            key={section.id}
            content={section.content as FeaturesContent}
            {...commonProps}
          />
        )
      case 'pricing':
        return (
          <PricingSection
            key={section.id}
            content={section.content as PricingContent}
            {...commonProps}
          />
        )
      case 'teachers':
        return (
          <TeachersSection
            key={section.id}
            content={section.content as TeachersContent}
            {...commonProps}
          />
        )
      case 'results':
        return (
          <ResultsSection
            key={section.id}
            content={section.content as ResultsContent}
            {...commonProps}
          />
        )
      case 'access':
        return (
          <AccessSection
            key={section.id}
            content={section.content as AccessContent}
            {...commonProps}
          />
        )
      case 'contact':
        return (
          <ContactSection
            key={section.id}
            content={section.content as ContactContent}
            {...commonProps}
          />
        )
      case 'gallery':
        return (
          <GallerySection
            key={section.id}
            content={section.content as GalleryContent}
            {...commonProps}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen" style={{ fontFamily: site.font_family }}>
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-gray-800">{site.name}</span>
            )}
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#access" className="text-gray-600 hover:text-gray-900 transition-colors">アクセス</a>
            <a href={`/juku/${slug}/blog`} className="text-gray-600 hover:text-gray-900 transition-colors">お知らせ</a>
            {site.phone && (
              <a
                href={`tel:${site.phone}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium"
                style={{ backgroundColor: site.primary_color }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {site.phone}
              </a>
            )}
          </nav>
          {/* モバイルメニュー */}
          <a
            href={`tel:${site.phone}`}
            className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium text-sm"
            style={{ backgroundColor: site.primary_color }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            電話
          </a>
        </div>
      </header>

      {/* ヘッダー分のスペース */}
      <div className="h-16" />

      {/* セクション */}
      {sections.map(renderSection)}

      {/* フッター */}
      <footer
        className="py-12 px-6 text-white"
        style={{ backgroundColor: site.primary_color }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* ロゴ・塾名 */}
            <div>
              {site.logo_url ? (
                <img
                  src={site.logo_url}
                  alt={site.name}
                  className="h-12 w-auto object-contain mb-4 brightness-0 invert"
                />
              ) : (
                <h3 className="text-xl font-bold mb-4">{site.name}</h3>
              )}
              {site.tagline && (
                <p className="text-white/80 text-sm">{site.tagline}</p>
              )}
            </div>

            {/* 連絡先 */}
            <div>
              <h4 className="font-bold mb-4">お問い合わせ</h4>
              <ul className="space-y-2 text-sm text-white/80">
                {site.phone && <li>TEL: {site.phone}</li>}
                {site.email && <li>Email: {site.email}</li>}
              </ul>
            </div>

            {/* SNS */}
            <div>
              <h4 className="font-bold mb-4">SNS</h4>
              <div className="flex gap-4">
                {site.line_url && (
                  <a href={site.line_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                    LINE
                  </a>
                )}
                {site.instagram_url && (
                  <a href={site.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/60">
            <p>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
            <p className="mt-2">
              Powered by <a href="https://edore-edu.com" className="underline hover:text-white">Edore</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
