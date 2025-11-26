'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, Target, Sparkles, Star, CheckCircle } from 'lucide-react'

interface DailyMission {
  id: number
  mission_number: number
  chapter_id: number
  chapter_title: string
  subject_name: string
  time_limit_seconds: number
  reward_points: number
  time_limit_minutes: number
  status: string
}

export default function DailyMissionCard() {
  const router = useRouter()
  const [missions, setMissions] = useState<DailyMission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDailyMissions()
  }, [])

  const fetchDailyMissions = async () => {
    try {
      const response = await fetch('/api/daily-mission')
      if (response.ok) {
        const data = await response.json()
        setMissions(data.missions || (data.mission ? [data.mission] : []))
      }
    } catch (error) {
      console.error('Failed to fetch daily missions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartMission = (mission: DailyMission) => {
    router.push(`/quiz/${mission.chapter_id}?mission=1`)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-6 shadow-md">
        <div className="text-white">読み込み中...</div>
      </div>
    )
  }

  if (missions.length === 0) {
    return null
  }

  const activeMissions = missions.filter(m => m.status === 'active')
  const completedMissions = missions.filter(m => m.status === 'completed')

  return (
    <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 opacity-10">
        <Sparkles className="w-32 h-32 text-white" />
      </div>

      <div className="relative z-10">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">デイリーミッション</h3>
          </div>
          {missions.length > 1 && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
              {completedMissions.length}/{missions.length} 達成
            </div>
          )}
        </div>

        {/* ミッション一覧 */}
        <div className="space-y-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`rounded-xl p-4 backdrop-blur-sm ${
                mission.status === 'completed'
                  ? 'bg-white/10'
                  : 'bg-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {missions.length > 1 && (
                      <span className="text-white/60 text-xs">
                        #{mission.mission_number}
                      </span>
                    )}
                    <span className="text-white/80 text-sm truncate">
                      {mission.subject_name}
                    </span>
                  </div>
                  <div className="text-white font-bold text-lg mb-2 truncate">
                    {mission.chapter_title}
                  </div>

                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      <span>{mission.time_limit_minutes}分以内</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      <span>+{mission.reward_points}pt</span>
                    </div>
                  </div>
                </div>

                {mission.status === 'completed' ? (
                  <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartMission(mission)}
                    className="flex-shrink-0 bg-white text-[#5DDFC3] px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all text-sm"
                  >
                    挑戦
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 注意書き */}
        <p className="text-white/70 text-xs mt-4 text-center">
          時間内にクリアしてボーナスポイントをゲット！
        </p>
      </div>
    </div>
  )
}
