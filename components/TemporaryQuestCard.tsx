'use client'

import { useEffect, useState } from 'react'
import { Zap, Coins, Target, Clock } from 'lucide-react'
import Link from 'next/link'

interface TemporaryQuest {
  id: number
  title: string
  description: string
  reward_points: number
  passing_score: number
  start_date: string
  end_date: string
}

export default function TemporaryQuestCard() {
  const [quests, setQuests] = useState<TemporaryQuest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/temporary-quests')
      if (!response.ok) throw new Error('Failed to fetch quests')
      const data = await response.json()
      // 開催中のクエストのみ、最大3件
      setQuests((data.quests || []).slice(0, 3))
    } catch (err) {
      console.error('Failed to fetch temporary quests:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRemainingTime = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return '終了'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `残り${days}日`
    if (hours > 0) return `残り${hours}時間`
    return 'まもなく終了'
  }

  if (loading || quests.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[#3A405A]">
        <Zap className="h-5 w-5 text-purple-500" />
        <h2 className="font-semibold text-lg">開催中の臨時クエスト</h2>
      </div>

      <div className="space-y-3">
        {quests.map((quest) => {
          const remainingTime = getRemainingTime(quest.end_date)
          const isEnding = remainingTime.includes('時間') || remainingTime.includes('まもなく')

          return (
            <Link
              key={quest.id}
              href={`/temporary-quests/${quest.id}`}
              className="block bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-5 w-5 text-white" />
                    <h3 className="font-bold text-white text-lg">
                      {quest.title}
                    </h3>
                  </div>
                  <p className="text-white opacity-90 text-sm mb-3">
                    {quest.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-white">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  <span className="font-semibold">{quest.reward_points}pt獲得</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{quest.passing_score}%でクリア</span>
                </div>
                <div className={`flex items-center gap-1 ml-auto ${isEnding ? 'text-yellow-300 font-bold' : ''}`}>
                  <Clock className="h-4 w-4" />
                  <span>{remainingTime}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
