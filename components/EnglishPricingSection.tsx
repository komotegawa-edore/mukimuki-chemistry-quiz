'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Check, Loader2, Smartphone, Sparkles } from 'lucide-react'

interface EarlyDiscount {
  available: boolean
  remaining: number
  discountedPrice: number
  originalPrice: number
}

export default function EnglishPricingSection() {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const [earlyDiscount, setEarlyDiscount] = useState<EarlyDiscount | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkEarlyDiscount() {
      try {
        const res = await fetch('/api/english/early-discount')
        const data = await res.json()
        setEarlyDiscount(data)
      } catch (error) {
        console.error('Failed to check early discount:', error)
      }
    }
    checkEarlyDiscount()
  }, [])

  const handleSubscribe = async (priceType: 'monthly' | 'yearly') => {
    setLoading(priceType)

    try {
      const response = await fetch('/api/english/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceType }),
      })

      const data = await response.json()

      if (response.status === 401) {
        // 未ログインの場合はログインページへ（プランタイプを保持）
        router.push(`/english/login?plan=${priceType}`)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Stripe Checkoutにリダイレクト
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <Crown className="w-4 h-4" />
            料金プラン
          </div>
          <h2 className="text-4xl font-black mb-4">
            シンプルな<span className="text-cyan-600">料金体系</span>
          </h2>
          <p className="text-lg opacity-70">
            お得な年間プランもご用意しています
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
          {/* 月額プラン */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8 relative">
            {/* 先着割引バッジ */}
            {earlyDiscount?.available && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-4 h-4" />
                  {earlyDiscount.remaining <= 20
                    ? `残り${earlyDiscount.remaining}名様！`
                    : '先着100名様限定！'}
                </div>
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#3A405A] mb-2">月額プラン</h3>
              {earlyDiscount?.available ? (
                <div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-2xl text-gray-400 line-through">¥980</span>
                    <span className="text-5xl font-black text-rose-500">¥450</span>
                    <span className="text-gray-500">/月</span>
                  </div>
                  <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <p className="text-sm text-rose-600 font-bold">
                      🎉 今入会で永久に月額450円！
                    </p>
                    <p className="text-xs text-rose-500 mt-1">
                      ※ 解約するまでずっとこの価格が適用されます
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-[#3A405A]">¥980</span>
                  <span className="text-gray-500">/月</span>
                </div>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-[#3A405A]">毎朝約20本のニュース配信</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-[#3A405A]">英語・日本語字幕</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-[#3A405A]">重要単語リスト</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-[#3A405A]">速度調整機能</span>
              </li>
              <li className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-[#3A405A]">バックグラウンド再生</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-[#3A405A]">いつでも解約可能</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading !== null}
              className="block w-full py-4 bg-gray-100 text-[#3A405A] text-center rounded-full font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading === 'monthly' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  処理中...
                </span>
              ) : (
                '月額プランで始める'
              )}
            </button>
          </div>

          {/* 年間プラン */}
          <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-3xl shadow-xl p-8 text-white relative">
            {/* おすすめバッジ */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                2ヶ月分お得！
              </div>
            </div>

            <div className="text-center mb-6 pt-4">
              <h3 className="text-xl font-bold mb-2">年間プラン</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black">¥9,800</span>
                <span className="opacity-80">/年</span>
              </div>
              <p className="text-sm opacity-80 mt-2">
                月あたり約¥817（17%OFF）
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-300 shrink-0" />
                <span>毎朝約20本のニュース配信</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-300 shrink-0" />
                <span>英語・日本語字幕</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-300 shrink-0" />
                <span>重要単語リスト</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-300 shrink-0" />
                <span>速度調整機能</span>
              </li>
              <li className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-yellow-300 shrink-0" />
                <span>バックグラウンド再生</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-300 shrink-0" />
                <span>いつでも解約可能</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading !== null}
              className="block w-full py-4 bg-white text-cyan-600 text-center rounded-full font-bold hover:bg-opacity-90 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading === 'yearly' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  処理中...
                </span>
              ) : (
                '年間プランで始める'
              )}
            </button>
          </div>
        </div>

        {/* 補足 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>※ 決済にはクレジットカードが必要です</p>
          <p>※ 解約後も契約期間終了まで利用可能です</p>
        </div>
      </div>
    </section>
  )
}
