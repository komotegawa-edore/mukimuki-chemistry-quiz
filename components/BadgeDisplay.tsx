'use client'

import { useEffect, useState } from 'react'

interface Badge {
  id: number
  name: string
  description: string
  icon: string
  color: string
  requirement_value: number
  earned: boolean
  earned_at: string | null
  progress: number
}

export default function BadgeDisplay() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch('/api/badges')
        if (response.ok) {
          const data = await response.json()
          setBadges(data.badges)
        }
      } catch (error) {
        console.error('Failed to fetch badges:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBadges()
  }, [])

  if (isLoading) {
    return null
  }

  if (badges.length === 0) {
    return null
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      bronze: 'from-amber-600 to-amber-800',
      silver: 'from-gray-300 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-blue-300 to-blue-500',
      diamond: 'from-purple-400 to-purple-600',
    }
    return colorMap[color] || 'from-gray-400 to-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-[#E0F7F1]">
      <h2 className="text-xl font-bold text-[#3A405A] mb-4">バッジコレクション</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="relative"
          >
            <div
              className={`bg-gradient-to-br ${getColorClass(
                badge.color
              )} rounded-lg p-4 shadow-md hover:shadow-lg transition-all ${
                !badge.earned && 'opacity-60 grayscale'
              }`}
            >
              {/* ロックアイコン */}
              {!badge.earned && (
                <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="text-4xl flex-shrink-0">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base mb-1">
                    {badge.name}
                  </p>
                  <p className="text-white/90 text-sm mb-1">
                    {badge.description}
                  </p>
                  <p className="text-white/70 text-xs font-mono">
                    {badge.requirement_value}pt
                  </p>
                </div>
              </div>
            </div>

            {/* 進捗バー（未獲得の場合のみ） */}
            {!badge.earned && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[#3A405A] opacity-70">進捗</span>
                  <span className="text-xs font-bold text-[#3A405A]">
                    {badge.progress}%
                  </span>
                </div>
                <div className="w-full bg-[#E0F7F1] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 獲得日時（獲得済みの場合のみ） */}
            {badge.earned && badge.earned_at && (
              <p className="text-xs text-[#3A405A] opacity-70 mt-2 text-center">
                獲得: {new Date(badge.earned_at).toLocaleDateString('ja-JP')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
