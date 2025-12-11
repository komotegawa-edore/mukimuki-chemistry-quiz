'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface PricingButtonsProps {
  monthlyClassName?: string
  yearlyClassName?: string
  monthlyLabel?: string
  yearlyLabel?: string
}

export default function PricingButtons({
  monthlyClassName = 'block w-full py-4 bg-gray-100 text-[#3A405A] text-center rounded-full font-bold hover:bg-gray-200 transition-colors',
  yearlyClassName = 'block w-full py-4 bg-white text-cyan-600 text-center rounded-full font-bold hover:bg-opacity-90 transition-colors shadow-lg',
  monthlyLabel = '月額プランで始める',
  yearlyLabel = '年間プランで始める',
}: PricingButtonsProps) {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const router = useRouter()

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
        // 未ログインの場合はログインページへ
        router.push('/english/login')
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
    <>
      <button
        onClick={() => handleSubscribe('monthly')}
        disabled={loading !== null}
        className={monthlyClassName}
      >
        {loading === 'monthly' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            処理中...
          </span>
        ) : (
          monthlyLabel
        )}
      </button>
      <button
        onClick={() => handleSubscribe('yearly')}
        disabled={loading !== null}
        className={yearlyClassName}
      >
        {loading === 'yearly' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            処理中...
          </span>
        ) : (
          yearlyLabel
        )}
      </button>
    </>
  )
}
