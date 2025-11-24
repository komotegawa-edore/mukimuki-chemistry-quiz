'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, Target, Sparkles } from 'lucide-react'

interface DailyMission {
  id: number
  chapter_id: number
  chapter_title: string
  subject_name: string
  time_limit_seconds: number
  reward_points: number
  time_limit_minutes: number
}

export default function DailyMissionCard() {
  const router = useRouter()
  const [mission, setMission] = useState<DailyMission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDailyMission()
  }, [])

  const fetchDailyMission = async () => {
    try {
      const response = await fetch('/api/daily-mission')
      if (response.ok) {
        const data = await response.json()
        setMission(data.mission)
      }
    } catch (error) {
      console.error('Failed to fetch daily mission:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartMission = () => {
    if (mission) {
      router.push(`/quiz/${mission.chapter_id}`)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-6 shadow-md">
        <div className="text-white">読み込み中...</div>
      </div>
    )
  }

  if (!mission) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 opacity-10">
        <Sparkles className="w-32 h-32 text-white" />
      </div>

      <div className="relative z-10">
        {/* ヘッダー */}
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-white" />
          <h3 className="text-xl font-bold text-white">デイリーミッション</h3>
        </div>

        {/* ミッション内容 */}
        <div className="bg-white/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
          <div className="text-white/80 text-sm mb-1">{mission.subject_name}</div>
          <div className="text-white font-bold text-lg mb-3">{mission.chapter_title}</div>

          <div className="flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              <span>{mission.time_limit_minutes}分以内</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-300">⭐</span>
              <span>+{mission.reward_points}pt</span>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <button
          onClick={handleStartMission}
          className="w-full bg-white text-[#5DDFC3] py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Target className="w-5 h-5" />
          ミッションに挑戦
        </button>

        {/* 注意書き */}
        <p className="text-white/70 text-xs mt-3 text-center">
          時間内にクリアしてボーナスポイントをゲット！
        </p>
      </div>
    </div>
  )
}
