'use client'

import { LPPricingContent } from '@/app/juku/types'
import { Check, Flame, Users, Clock } from 'lucide-react'

interface Props {
  content: LPPricingContent
  primaryColor: string
  accentColor: string
}

export function LPPricingSection({ content, primaryColor, accentColor }: Props) {
  return (
    <section className="py-16 md:py-24" style={{ background: `${primaryColor}08` }}>
      <div className="max-w-5xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: primaryColor }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
        </div>

        {/* 締切バナー */}
        {content.deadline && (
          <div
            className="text-center mb-8 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2"
            style={{ background: accentColor }}
          >
            <Clock className="w-5 h-5" />
            {content.deadline}
          </div>
        )}

        {/* 料金プラン */}
        <div className={`grid gap-8 ${content.plans.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2'}`}>
          {content.plans.map((plan, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl p-8 shadow-lg"
              style={{
                boxShadow: plan.isRecommended
                  ? `0 0 0 4px ${primaryColor}`
                  : undefined,
              }}
            >
              {/* おすすめバッジ */}
              {plan.isRecommended && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold flex items-center gap-1"
                  style={{ background: primaryColor }}
                >
                  <Flame className="w-4 h-4" />
                  おすすめ
                </div>
              )}

              {/* プラン名 */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
              <p className="text-gray-500 mb-4">{plan.target}</p>

              {/* 価格 */}
              <div className="mb-6">
                <span className="text-gray-400 line-through text-lg">
                  {plan.originalPrice}
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl md:text-5xl font-black"
                    style={{ color: primaryColor }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-gray-500 text-sm">(税込)</span>
                </div>
              </div>

              {/* 残席数 */}
              {plan.remainingSeats !== undefined && (
                <div
                  className="mb-6 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-bold"
                  style={{
                    background: plan.remainingSeats <= 5 ? `${accentColor}20` : '#f3f4f6',
                    color: plan.remainingSeats <= 5 ? accentColor : '#6b7280',
                  }}
                >
                  <Users className="w-5 h-5" />
                  残り{plan.remainingSeats}名
                </div>
              )}

              {/* 特徴リスト */}
              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${accentColor}20` }}
                    >
                      <Check className="w-3 h-3" style={{ color: accentColor }} />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 申込ボタン */}
              <a
                href="#contact"
                className="mt-8 block w-full py-4 text-center rounded-lg font-bold text-white transition-transform hover:scale-105"
                style={{ background: plan.isRecommended ? primaryColor : '#6b7280' }}
              >
                このコースで申し込む
              </a>
            </div>
          ))}
        </div>

        {/* 注意書き */}
        {content.note && (
          <p className="text-center text-sm text-gray-500 mt-8">{content.note}</p>
        )}
      </div>
    </section>
  )
}
