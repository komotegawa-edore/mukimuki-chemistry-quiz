'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Crown, Check, Loader2, Sparkles } from 'lucide-react'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

interface EarlyDiscount {
  available: boolean
  remaining: number
  discountedPrice: number
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const [earlyDiscount, setEarlyDiscount] = useState<EarlyDiscount | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      fetch('/api/english/early-discount')
        .then(res => res.json())
        .then(data => setEarlyDiscount(data))
        .catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

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
        router.push(`/english/login?plan=${priceType}`)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-8 text-white text-center rounded-t-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-3">
            <Crown className="w-4 h-4" />
            プレミアムプラン
          </div>
          <h2 className="text-2xl font-black mb-2">
            全てのニュースを聴き放題
          </h2>
          <p className="text-sm opacity-90">
            過去記事・日本語字幕・重要単語リストにアクセス
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Features */}
          <div className="mb-6">
            <h3 className="font-bold text-[#3A405A] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              プレミアム特典
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" />
                毎朝約20本のニュース見放題
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" />
                過去のニュースも全てアクセス可能
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" />
                日本語字幕で内容を確認
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" />
                重要単語リストで語彙力UP
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" />
                再生速度調整機能
              </li>
            </ul>
          </div>

          {/* Plans */}
          <div className="space-y-3">
            {/* Yearly - Recommended */}
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading !== null}
              className="w-full p-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg">
                おすすめ
              </div>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-bold">年間プラン</div>
                  <div className="text-xs opacity-80">2ヶ月分お得！</div>
                </div>
                <div className="text-right">
                  {loading === 'yearly' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-black">¥9,800</div>
                      <div className="text-xs opacity-80">月あたり¥817</div>
                    </>
                  )}
                </div>
              </div>
            </button>

            {/* Monthly */}
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading !== null}
              className={`w-full p-4 rounded-xl transition-all disabled:opacity-50 relative overflow-hidden ${
                earlyDiscount?.available
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600'
                  : 'bg-gray-100 text-[#3A405A] hover:bg-gray-200'
              }`}
            >
              {earlyDiscount?.available && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg">
                  {earlyDiscount.remaining <= 20 ? `残り${earlyDiscount.remaining}名` : '先着100名'}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-bold">月額プラン</div>
                  <div className={`text-xs ${earlyDiscount?.available ? 'opacity-80' : 'text-gray-500'}`}>
                    {earlyDiscount?.available ? 'ずっとこの価格！' : 'いつでも解約可能'}
                  </div>
                </div>
                <div className="text-right">
                  {loading === 'monthly' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : earlyDiscount?.available ? (
                    <>
                      <div className="text-sm line-through opacity-60">¥980</div>
                      <div className="text-2xl font-black">¥{earlyDiscount.discountedPrice}</div>
                      <div className="text-xs opacity-80">/月（ずっと）</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-black">¥980</div>
                      <div className="text-xs text-gray-500">/月</div>
                    </>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            解約後も契約期間終了まで利用可能です
          </p>
        </div>
      </div>
    </div>
  )
}
