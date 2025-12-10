'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, Target, Sparkles, Star } from 'lucide-react'

interface DailyMission {
  id: number
  chapter_id: number
  chapter_title: string
  subject_id?: number
  subject_name: string
  time_limit_seconds: number
  reward_points: number
  time_limit_minutes: number
}

const SUBJECT_ORDER = [3, 1] // 3: リスニング, 1: 無機化学

export default function DailyMissionCard() {
  const router = useRouter()
  const [missions, setMissions] = useState<DailyMission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDailyMission()
  }, [])

  const fetchDailyMission = async () => {
    try {
      const response = await fetch('/api/daily-mission')
      if (response.ok) {
        const data = await response.json()
        const missionList: DailyMission[] = data.missions || (data.mission ? [data.mission] : [])
        setMissions(missionList)
      }
    } catch (error) {
      console.error('Failed to fetch daily mission:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedMissions = useMemo(() => {
    return [...missions].sort((a, b) => {
      const idxA = SUBJECT_ORDER.indexOf(a.subject_id ?? -1)
      const idxB = SUBJECT_ORDER.indexOf(b.subject_id ?? -1)
      const orderA = idxA === -1 ? SUBJECT_ORDER.length : idxA
      const orderB = idxB === -1 ? SUBJECT_ORDER.length : idxB
      if (orderA !== orderB) return orderA - orderB
      return a.chapter_title.localeCompare(b.chapter_title)
    })
  }, [missions])

  const handleStartMission = (chapterId: number) => {
    router.push(`/quiz/${chapterId}?mission=1`)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-6 shadow-md">
        <div className="text-white">読み込み中...</div>
      </div>
    )
  }

  if (sortedMissions.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {sortedMissions.map((mission) => (
        <div
          key={mission.id}
          className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-10">
            <Sparkles className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-white" />
                <div>
                  <p className="text-white/80 text-xs">デイリーミッション</p>
                  <h3 className="text-xl font-bold text-white">
                    {mission.subject_name || '教科'}
                  </h3>
                </div>
              </div>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold">
                +{mission.reward_points}pt
              </span>
            </div>

            <div className="bg-white/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
              <div className="text-white font-bold text-lg mb-3">{mission.chapter_title}</div>
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

            <button
              onClick={() => handleStartMission(mission.chapter_id)}
              className="w-full bg-white text-[#5DDFC3] py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Target className="w-5 h-5" />
              ミッションに挑戦
            </button>

            <p className="text-white/70 text-xs mt-3 text-center">
              時間内にクリアしてボーナスポイントをゲット！
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
