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
  const [isFlipped, setIsFlipped] = useState(false)

  // 今週の月曜日と日曜日を計算（月曜始まり）
  const getWeekRange = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=日, 1=月, ..., 6=土

    // 今週の月曜日を計算
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)

    // 今週の日曜日を計算
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`
    }

    return `${formatDate(monday)} - ${formatDate(sunday)}`
  }

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
    <div
      className="cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`grid transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 表面：ポイント表示 */}
        <div
          className="col-start-1 row-start-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md p-8 backface-hidden relative flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
      {/* タブ切り替え - 左上固定 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowWeekly(false)
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            !showWeekly
              ? 'bg-white text-orange-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          総合
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowWeekly(true)
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            showWeekly
              ? 'bg-white text-orange-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          今週
        </button>
      </div>

      {/* メインコンテンツ - 縦方向に配置 */}
      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* ポイント表示セクション */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-5xl font-bold text-white">
              {displayPoints}
            </span>
          </div>
          <p className="text-white text-xl opacity-90">ポイント</p>
        </div>

        {/* ランキング情報カード */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          {displayRank ? (
            <div className="text-center text-white">
              <p className="text-sm opacity-90 mb-1">
                {showWeekly ? '今週の順位' : '総合順位'}
              </p>
              <p className="text-4xl font-bold mb-2">{displayRank}位</p>
              {showWeekly ? (
                <p className="text-xs opacity-75">
                  {getWeekRange()}
                </p>
              ) : (
                pointsInfo.pointsNeeded > 0 && (
                  <p className="text-sm opacity-90">
                    次のランクまで残り {pointsInfo.pointsNeeded}pt
                  </p>
                )
              )}
            </div>
          ) : (
            <div className="text-center text-white">
              <p className="text-sm opacity-90 mb-1">
                {showWeekly ? '今週はまだポイントがありません' : 'まだランキングに参加していません'}
              </p>
              {showWeekly && (
                <p className="text-xs opacity-75">
                  {getWeekRange()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
        </div>

        {/* 裏面：ポイントシステムの説明 */}
        <div
          className="col-start-1 row-start-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg shadow-md p-8 backface-hidden rotate-y-180"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex flex-col text-white py-6">
            <h3 className="text-2xl font-bold mb-8 text-center">ポイントシステム</h3>
            <div className="space-y-6 text-base">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📚</span>
                <div>
                  <p className="font-semibold text-lg mb-1">章クリアボーナス</p>
                  <p className="text-sm opacity-90">100%正解で1ポイント獲得</p>
                  <p className="text-sm opacity-90">（1日1回まで）</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl">🎁</span>
                <div>
                  <p className="font-semibold text-lg mb-1">ログインボーナス</p>
                  <p className="text-sm opacity-90">毎日ログインで3ポイント</p>
                  <p className="text-sm opacity-90">（1日1回まで）</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="font-semibold text-lg mb-1">ランキング</p>
                  <p className="text-sm opacity-90">総合順位と週間順位で競おう</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
