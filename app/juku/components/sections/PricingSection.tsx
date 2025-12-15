'use client'

import { PricingContent } from '../../types'

interface Props {
  content: PricingContent
  primaryColor: string
  secondaryColor: string
}

export function PricingSection({ content, primaryColor }: Props) {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
          <div
            className="w-20 h-1 mx-auto mt-6 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* 料金カード */}
        <div className="grid md:grid-cols-3 gap-6">
          {content.plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl bg-white transition-all duration-300 ${
                plan.isPopular
                  ? 'shadow-2xl scale-105 border-2'
                  : 'shadow-lg hover:shadow-xl border border-gray-100'
              }`}
              style={{
                borderColor: plan.isPopular ? primaryColor : undefined
              }}
            >
              {/* 人気バッジ */}
              {plan.isPopular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  人気No.1
                </div>
              )}

              {/* コース名 */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {plan.name}
              </h3>

              {/* 対象 */}
              <p className="text-gray-500 text-sm mb-6">{plan.target}</p>

              {/* 価格 */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">
                  ¥{parseInt(plan.price).toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  /{plan.period}
                </span>
              </div>

              {/* 特徴 */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: primaryColor }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* ボタン */}
              <a
                href="#contact"
                className={`block w-full py-3 rounded-xl text-center font-bold transition-colors ${
                  plan.isPopular
                    ? 'text-white'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: plan.isPopular ? primaryColor : undefined
                }}
              >
                詳しく見る
              </a>
            </div>
          ))}
        </div>

        {/* 注意書き */}
        {content.note && (
          <p className="text-center text-gray-500 text-sm mt-8">
            {content.note}
          </p>
        )}
      </div>
    </section>
  )
}
