'use client'

import { CampaignContent } from '@/app/juku/types'
import { Gift, BookOpen, Users, Star, Zap, Heart } from 'lucide-react'

interface Props {
  content: CampaignContent
  primaryColor: string
  accentColor: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  gift: Gift,
  book: BookOpen,
  users: Users,
  star: Star,
  zap: Zap,
  heart: Heart,
}

export function CampaignSection({ content, primaryColor, accentColor }: Props) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1 rounded-full text-sm font-bold text-white mb-4"
            style={{ background: accentColor }}
          >
            期間限定
          </span>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: primaryColor }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
        </div>

        {/* 特典カード */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {content.items.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Gift
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-opacity-50 transition-all hover:shadow-xl"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: `${primaryColor}15`, color: primaryColor }}
                >
                  <IconComponent className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
                  {item.title}
                </h3>

                <p className="text-gray-600 mb-4">{item.description}</p>

                {/* 価格表示 */}
                {item.originalPrice && item.campaignPrice && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through text-sm">
                      {item.originalPrice}
                    </span>
                    <span
                      className="text-xl font-black"
                      style={{ color: accentColor }}
                    >
                      {item.campaignPrice}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 締め切り */}
        {content.deadline && (
          <div className="text-center">
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold"
              style={{ background: primaryColor }}
            >
              <Zap className="w-5 h-5" />
              <span>{content.deadline}</span>
            </div>
          </div>
        )}

        {/* 注意書き */}
        {content.note && (
          <p className="text-center text-sm text-gray-500 mt-6">{content.note}</p>
        )}
      </div>
    </section>
  )
}
