'use client'

import {
  JukuLP,
  JukuLPSection,
  LPSectionType,
  LPHeroContent,
  CountdownContent,
  CampaignContent,
  CurriculumContent,
  TestimonialsContent,
  BeforeAfterContent,
  LPPricingContent,
  LPFAQContent,
  LPCTAContent,
  LPContactContent,
  LPGalleryContent,
} from '@/app/juku/types'
import {
  LPHeroSection,
  CountdownSection,
  CampaignSection,
  CurriculumSection,
  TestimonialsSection,
  BeforeAfterSection,
  LPPricingSection,
  LPFAQSection,
  LPCTASection,
  LPContactSection,
  LPGallerySection,
} from '../components/sections'

interface Props {
  lp: JukuLP
  sections: JukuLPSection[]
}

export function LPRenderer({ lp, sections }: Props) {
  const sortedSections = [...sections]
    .filter((s) => s.is_visible)
    .sort((a, b) => a.order_num - b.order_num)

  const renderSection = (section: JukuLPSection) => {
    const commonProps = {
      primaryColor: lp.primary_color,
      accentColor: lp.accent_color,
    }

    switch (section.type as LPSectionType) {
      case 'lp_hero':
        return (
          <LPHeroSection
            key={section.id}
            content={section.content as LPHeroContent}
            {...commonProps}
          />
        )
      case 'countdown':
        return (
          <CountdownSection
            key={section.id}
            content={section.content as CountdownContent}
            {...commonProps}
          />
        )
      case 'campaign':
        return (
          <CampaignSection
            key={section.id}
            content={section.content as CampaignContent}
            {...commonProps}
          />
        )
      case 'curriculum':
        return (
          <CurriculumSection
            key={section.id}
            content={section.content as CurriculumContent}
            {...commonProps}
          />
        )
      case 'testimonials':
        return (
          <TestimonialsSection
            key={section.id}
            content={section.content as TestimonialsContent}
            {...commonProps}
          />
        )
      case 'before_after':
        return (
          <BeforeAfterSection
            key={section.id}
            content={section.content as BeforeAfterContent}
            {...commonProps}
          />
        )
      case 'lp_pricing':
        return (
          <LPPricingSection
            key={section.id}
            content={section.content as LPPricingContent}
            {...commonProps}
          />
        )
      case 'lp_faq':
        return (
          <LPFAQSection
            key={section.id}
            content={section.content as LPFAQContent}
            {...commonProps}
          />
        )
      case 'lp_cta':
        return (
          <LPCTASection
            key={section.id}
            content={section.content as LPCTAContent}
            {...commonProps}
          />
        )
      case 'lp_contact':
        return (
          <LPContactSection
            key={section.id}
            content={section.content as LPContactContent}
            lpId={lp.id}
            {...commonProps}
          />
        )
      case 'lp_gallery':
        return (
          <LPGallerySection
            key={section.id}
            content={section.content as LPGalleryContent}
            {...commonProps}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー（ロゴ・塾名） */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {lp.logo_url && (
              <img src={lp.logo_url} alt={lp.juku_name} className="h-8" />
            )}
            <span className="font-bold text-gray-800">{lp.juku_name}</span>
          </div>
          {lp.phone && (
            <a
              href={`tel:${lp.phone.replace(/-/g, '')}`}
              className="text-sm font-bold px-4 py-2 rounded-full"
              style={{ background: lp.primary_color, color: 'white' }}
            >
              {lp.phone}
            </a>
          )}
        </div>
      </header>

      {/* セクション */}
      <main className="pt-14">
        {sortedSections.map(renderSection)}
      </main>

      {/* フッター */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {lp.juku_name}
          </p>
        </div>
      </footer>

      {/* フローティングCTA（モバイル） */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white border-t shadow-2xl md:hidden">
        <a
          href="#contact"
          className="flex items-center justify-center w-full py-4 rounded-lg font-bold text-white"
          style={{ background: lp.primary_color }}
        >
          今すぐ申し込む
        </a>
      </div>
    </div>
  )
}
