'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Headphones, ChevronRight, Coins, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DailyListeningQuestProps {
  className?: string
}

export default function DailyListeningQuest({ className = '' }: DailyListeningQuestProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkCompletionStatus()
  }, [])

  const checkCompletionStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      // 今日のリスニングクエスト完了状態をチェック
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('mukimuki_listening_results')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .limit(1)

      setIsCompleted(!!(data && data.length > 0))
    } catch (error) {
      console.error('Failed to check listening completion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-r from-[#4ECFB3] to-[#3BB8A0] rounded-xl shadow-md p-6 animate-pulse ${className}`}>
        <div className="h-24"></div>
      </div>
    )
  }

  return (
    <Link
      href="/listening"
      className={`block bg-gradient-to-r from-[#4ECFB3] to-[#3BB8A0] rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-white/20 p-3 rounded-full">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            {isCompleted && (
              <CheckCircle className="w-5 h-5 text-white absolute -top-1 -right-1 bg-green-500 rounded-full" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                デイリーリスニング
              </h2>
              {isCompleted ? (
                <span className="inline-block px-2 py-0.5 bg-white/30 text-white text-xs font-semibold rounded">
                  完了
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400/90 text-yellow-900 text-xs font-bold rounded animate-pulse">
                  <Coins className="w-3 h-3" />
                  +3pt
                </span>
              )}
            </div>
            <p className="text-white/90 text-sm mt-1">
              {isCompleted
                ? '今日のクエストは達成済みです'
                : '1問解いて3ポイントゲット！'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/Roopy.png"
            alt="Roopy"
            width={48}
            height={48}
            className="hidden sm:block"
          />
          <ChevronRight className="w-6 h-6 text-white" />
        </div>
      </div>
    </Link>
  )
}
