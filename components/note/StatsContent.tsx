'use client'

import { useMemo } from 'react'
import { BookOpen, MessageCircle, Trophy, Flame, Clock, TrendingUp } from 'lucide-react'

interface Entry {
  id: string
  entry_date: string
  study_hours: number | null
  mood: number | null
  subjects: string[]
}

interface StatsContentProps {
  entries: Entry[]
  totalEntries: number
  totalPosts: number
  completedGoals: number
}

export default function StatsContent({
  entries,
  totalEntries,
  totalPosts,
  completedGoals,
}: StatsContentProps) {
  // 統計計算
  const stats = useMemo(() => {
    // 総学習時間
    const totalHours = entries.reduce((sum, e) => sum + (e.study_hours || 0), 0)

    // 平均学習時間
    const entriesWithHours = entries.filter((e) => e.study_hours)
    const avgHours =
      entriesWithHours.length > 0
        ? totalHours / entriesWithHours.length
        : 0

    // 連続学習日数（ストリーク）
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const entryDates = new Set(entries.map((e) => e.entry_date))

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]

      if (entryDates.has(dateStr)) {
        currentStreak++
      } else if (i > 0) {
        // 今日はまだ記録してなくてもOK
        break
      }
    }

    // 最長ストリーク（簡易計算）
    let maxStreak = currentStreak

    // 科目別学習回数
    const subjectCounts: Record<string, number> = {}
    entries.forEach((e) => {
      if (e.subjects) {
        e.subjects.forEach((s) => {
          subjectCounts[s] = (subjectCounts[s] || 0) + 1
        })
      }
    })

    const topSubjects = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // 週別データ
    const weeklyData: { week: string; hours: number }[] = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekEntries = entries.filter((e) => {
        const date = new Date(e.entry_date)
        return date >= weekStart && date <= weekEnd
      })

      const hours = weekEntries.reduce((sum, e) => sum + (e.study_hours || 0), 0)

      weeklyData.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}〜`,
        hours,
      })
    }

    return {
      totalHours,
      avgHours,
      currentStreak,
      maxStreak,
      topSubjects,
      weeklyData,
    }
  }, [entries])

  // 週別グラフの最大値
  const maxWeeklyHours = Math.max(...stats.weeklyData.map((w) => w.hours), 1)

  return (
    <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">総学習時間</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {stats.totalHours.toFixed(1)}
            <span className="text-sm font-normal text-gray-500 ml-1">時間</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">連続記録</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {stats.currentStreak}
            <span className="text-sm font-normal text-gray-500 ml-1">日</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">平均学習</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {stats.avgHours.toFixed(1)}
            <span className="text-sm font-normal text-gray-500 ml-1">時間/日</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">目標達成</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {completedGoals}
            <span className="text-sm font-normal text-gray-500 ml-1">回</span>
          </p>
        </div>
      </div>

      {/* 週別学習時間グラフ */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">週別学習時間</h2>
        <div className="space-y-3">
          {stats.weeklyData.map((week, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-16">{week.week}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(week.hours / maxWeeklyHours) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                {week.hours.toFixed(1)}h
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* よく勉強した科目 */}
      {stats.topSubjects.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">よく勉強した科目</h2>
          <div className="flex flex-wrap gap-2">
            {stats.topSubjects.map(([subject, count]) => (
              <div
                key={subject}
                className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg"
              >
                <span className="text-sm text-gray-800">{subject}</span>
                <span className="text-xs text-amber-600 font-medium">
                  {count}回
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 活動サマリー */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">全期間の活動</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-gray-800">{totalEntries}</p>
            <p className="text-xs text-gray-500">学習記録</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xl font-bold text-gray-800">{totalPosts}</p>
            <p className="text-xs text-gray-500">つぶやき</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xl font-bold text-gray-800">{completedGoals}</p>
            <p className="text-xs text-gray-500">目標達成</p>
          </div>
        </div>
      </div>

      {/* モチベーションメッセージ */}
      {stats.currentStreak > 0 && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8" />
            <div>
              <p className="font-bold">
                {stats.currentStreak}日連続で記録中！
              </p>
              <p className="text-sm text-white/80">
                {stats.currentStreak >= 7
                  ? 'すごい！この調子で続けよう！'
                  : 'いい調子！毎日続けよう！'}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
