'use client'

import { useEffect, useState } from 'react'
import { Gift, Sparkles, Coins } from 'lucide-react'
import Link from 'next/link'

interface GachaData {
  currentPoints: number
  canDraw: boolean
  isExcluded?: boolean
  isDisabled?: boolean
}

export default function GachaCard() {
  const [data, setData] = useState<GachaData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGachaData()
  }, [])

  const fetchGachaData = async () => {
    try {
      const response = await fetch('/api/gacha')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch gacha data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  // 無効または除外の場合は表示しない
  if (!data || data.isExcluded || data.isDisabled) {
    return null
  }

  const drawsAvailable = Math.floor(data.currentPoints / 50)

  return (
    <Link href="/gacha">
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
        <div className="bg-white/95 backdrop-blur rounded-xl p-5">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#3A405A]">ポイントガチャ</h3>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>

          {/* 景品情報 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-purple-700 mb-2">Amazonギフト券が当たる!</p>
            <div className="flex gap-2 text-xs">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                A賞 5,000円
              </span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                B賞 3,000円
              </span>
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                C賞 1,000円
              </span>
            </div>
          </div>

          {/* ポイント表示 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-[#3A405A]">
                <span className="font-bold text-lg">{data.currentPoints}</span> pt
              </span>
            </div>
            {drawsAvailable > 0 ? (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-bounce">
                {drawsAvailable}回引ける!
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                あと{50 - (data.currentPoints % 50)}ptで1回
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
