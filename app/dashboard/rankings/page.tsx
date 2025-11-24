'use client'

import { useEffect, useState } from 'react'
import { Trophy, Medal, Award, Calendar, Flame } from 'lucide-react'

interface RankingUser {
  rank: number
  user_id: string
  user_name: string
  email: string
  total_points: number
  chapter_clear_count: number
  chapter_clear_points: number
  login_count: number
  login_bonus_points: number
  current_streak: number
  last_login_date: string | null
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'all-time' | 'weekly'>('all-time')

  useEffect(() => {
    fetchRankings()
  }, [period])

  const fetchRankings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rankings?period=${period}`)

      if (!response.ok) {
        throw new Error('ランキングの取得に失敗しました')
      }

      const data = await response.json()
      setRankings(data.rankings || [])
    } catch (err) {
      console.error('Failed to fetch rankings:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-gray-500 font-semibold">{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-white text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              ユーザーランキング
            </h1>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              ユーザーランキング
            </h1>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-red-500">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Trophy className="h-7 w-7 text-yellow-500" />
            ユーザーランキング
          </h1>
          <p className="text-gray-600 mb-4">
            プレゼント企画用のランキング（生徒のみ表示）
          </p>

          {/* 期間切り替えタブ */}
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('all-time')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'all-time'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全期間
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              週間（過去7日間）
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4 text-sm text-gray-600">
            総ユーザー数: {rankings.length}名
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    順位
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    総ポイント
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    章クリア<br/>回数/PT
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ログイン<br/>回数/PT
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    連続日数
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    最終ログイン
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      ランキングデータがありません
                    </td>
                  </tr>
                ) : (
                  rankings.map((user) => (
                    <tr
                      key={user.user_id}
                      className={`${getRankBadgeColor(user.rank)} border-l-4 hover:bg-opacity-50 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center">
                          {getRankIcon(user.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium text-gray-900 ${user.rank <= 3 ? 'font-bold' : ''}`}>
                          {user.user_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-lg text-gray-900">
                        {user.total_points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        <div>{user.chapter_clear_count}回</div>
                        <div className="text-xs text-gray-500">{user.chapter_clear_points}pt</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        <div>{user.login_count}回</div>
                        <div className="text-xs text-gray-500">{user.login_bonus_points}pt</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="font-semibold">{user.current_streak}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {user.last_login_date ? (
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(user.last_login_date).toLocaleDateString('ja-JP')}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {rankings.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 space-y-1">
              <div>※ 総ポイント = 章クリアポイント + ログインボーナスポイント</div>
              <div>※ 章クリア: クイズを合格した回数とポイント</div>
              <div>※ ログイン: ログインした回数とボーナスポイント</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
