'use client'

import { useEffect, useState } from 'react'

interface PointsInfo {
  totalPoints: number
  rank: number | null
  pointsNeeded: number
  weeklyPoints: number
  weeklyRank: number | null
}

export default function PointsDisplay() {
  const [pointsInfo, setPointsInfo] = useState<PointsInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showWeekly, setShowWeekly] = useState(false)

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch('/api/points')
        if (response.ok) {
          const data = await response.json()
          setPointsInfo(data)
        }
      } catch (error) {
        console.error('Failed to fetch points:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPoints()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm opacity-90">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!pointsInfo) {
    return null
  }

  const displayPoints = showWeekly ? pointsInfo.weeklyPoints : pointsInfo.totalPoints
  const displayRank = showWeekly ? pointsInfo.weeklyRank : pointsInfo.rank

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md p-4">
      {/* タブ切り替え */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowWeekly(false)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            !showWeekly
              ? 'bg-white text-orange-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          総合
        </button>
        <button
          onClick={() => setShowWeekly(true)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            showWeekly
              ? 'bg-white text-orange-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          今週
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-2xl font-bold text-white">
              {displayPoints}
              <span className="text-sm ml-1">pt</span>
            </span>
          </div>
          <div className="text-white text-sm space-y-1">
            {displayRank ? (
              <>
                <p className="font-semibold">
                  {showWeekly ? '今週' : '総合'}順位: {displayRank}位
                </p>
                {!showWeekly && pointsInfo.pointsNeeded > 0 && (
                  <p className="text-xs opacity-90">
                    あと{pointsInfo.pointsNeeded}ptでランクアップ！
                  </p>
                )}
              </>
            ) : (
              <p className="font-semibold">
                {showWeekly ? '今週はまだポイントがありません' : 'まだランキングに参加していません'}
              </p>
            )}
          </div>
        </div>
        <div className="text-white opacity-75">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
