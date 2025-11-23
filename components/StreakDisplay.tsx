'use client'

import { useEffect, useState } from 'react'
import { Trophy, Flame } from 'lucide-react'
import RoopyLoader from './RoopyLoader'

export default function StreakDisplay() {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/streak')
        if (response.ok) {
          const data = await response.json()
          setCurrentStreak(data.currentStreak)
          setLongestStreak(data.longestStreak)
        }
      } catch (error) {
        console.error('Failed to fetch streak:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreak()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border-2 border-[#E0F7F1]">
        <RoopyLoader message="連続ログイン情報を読み込み中..." size="small" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-[#FFB84D] to-[#FF8C42] rounded-lg shadow-md p-6 border-2 border-[#FFD700]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 炎アイコン */}
          <div className="bg-white/20 p-3 rounded-full">
            <Flame className="w-10 h-10 text-white animate-pulse" />
          </div>

          <div className="text-white">
            <p className="text-sm font-medium opacity-90">連続ログイン</p>
            <p className="text-4xl font-bold">{currentStreak}</p>
            <p className="text-sm opacity-80">日間</p>
          </div>
        </div>

        <div className="text-right text-white">
          <p className="text-xs opacity-75 mb-1">最長記録</p>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <span className="text-2xl font-bold">{longestStreak}</span>
          </div>
          <p className="text-xs opacity-75">日間</p>
        </div>
      </div>

      {/* 進捗バー（次のマイルストーンまで） */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/80">次の目標まで</span>
          {currentStreak < 3 && (
            <span className="text-xs text-white/80 font-semibold">
              3日連続ログイン
            </span>
          )}
          {currentStreak >= 3 && currentStreak < 7 && (
            <span className="text-xs text-white/80 font-semibold">
              7日連続ログイン
            </span>
          )}
          {currentStreak >= 7 && currentStreak < 30 && (
            <span className="text-xs text-white/80 font-semibold">
              30日連続ログイン
            </span>
          )}
          {currentStreak >= 30 && currentStreak < 100 && (
            <span className="text-xs text-white/80 font-semibold">
              100日連続ログイン
            </span>
          )}
          {currentStreak >= 100 && (
            <span className="text-xs text-white/80 font-semibold">
              素晴らしい！
            </span>
          )}
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{
              width: `${
                currentStreak < 3
                  ? (currentStreak / 3) * 100
                  : currentStreak < 7
                    ? ((currentStreak - 3) / 4) * 100
                    : currentStreak < 30
                      ? ((currentStreak - 7) / 23) * 100
                      : currentStreak < 100
                        ? ((currentStreak - 30) / 70) * 100
                        : 100
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
