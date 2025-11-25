'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Zap, Coins, Target, Calendar, Users, Trophy } from 'lucide-react'
import Link from 'next/link'

interface Quest {
  id: number
  title: string
  description: string
  reward_points: number
  passing_score: number
  start_date: string
  end_date: string
}

interface UserResult {
  percentage: number
  is_cleared: boolean
  is_first_clear: boolean
}

export default function TemporaryQuestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questId = params.id as string

  const [quest, setQuest] = useState<Quest | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [bestResult, setBestResult] = useState<UserResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuestData()
  }, [questId])

  const fetchQuestData = async () => {
    try {
      setLoading(true)

      // クエスト情報取得
      const questResponse = await fetch(`/api/temporary-quests/${questId}`)
      if (!questResponse.ok) throw new Error('Quest not found')
      const questData = await questResponse.json()
      setQuest(questData.quest)

      // 問題数取得
      const questionsResponse = await fetch(`/api/temporary-quests/${questId}/questions`)
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestionCount(questionsData.questions?.length || 0)
      }

      // 自分の最高スコア取得（TODO: API実装後に有効化）
      // const resultsResponse = await fetch(`/api/temporary-quests/${questId}/my-results`)
      // if (resultsResponse.ok) {
      //   const resultsData = await resultsResponse.json()
      //   setBestResult(resultsData.bestResult)
      // }

    } catch (err) {
      console.error('Failed to fetch quest data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    router.push(`/temporary-quests/${questId}/quiz`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">クエストが見つかりません</p>
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  const isEnded = new Date(quest.end_date) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          ホームに戻る
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-8 text-white">
            <div className="flex items-start gap-3 mb-4">
              <Zap className="h-8 w-8 flex-shrink-0" />
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{quest.title}</h1>
                <p className="text-purple-100 text-lg">{quest.description}</p>
              </div>
            </div>

            {isEnded && (
              <div className="mt-4 bg-red-500 bg-opacity-50 border border-red-300 rounded-lg p-3">
                <p className="font-semibold">このクエストは終了しました</p>
              </div>
            )}
          </div>

          {/* 詳細情報 */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Coins className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">報酬</p>
                  <p className="text-2xl font-bold text-gray-900">{quest.reward_points}pt</p>
                  <p className="text-xs text-gray-500">初回クリア時のみ</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">クリア基準</p>
                  <p className="text-2xl font-bold text-gray-900">{quest.passing_score}%</p>
                  <p className="text-xs text-gray-500">以上で合格</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">開催期間</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(quest.start_date).toLocaleDateString('ja-JP')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    〜 {new Date(quest.end_date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Trophy className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">問題数</p>
                  <p className="text-2xl font-bold text-gray-900">{questionCount}問</p>
                  <p className="text-xs text-gray-500">全問挑戦</p>
                </div>
              </div>
            </div>

            {/* 最高スコア表示 */}
            {bestResult && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  あなたの最高スコア
                </h3>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-bold text-gray-900">{bestResult.percentage}%</p>
                  {bestResult.is_cleared && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 font-semibold rounded">
                      クリア済み
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 注意事項 */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">注意事項</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>報酬ポイントは初回クリア時のみ獲得できます</li>
                <li>2回目以降は練習として何度でも挑戦可能です</li>
                <li>全問回答後に結果が表示されます</li>
              </ul>
            </div>

            {/* 開始ボタン */}
            <button
              onClick={handleStartQuiz}
              disabled={isEnded || questionCount === 0}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                isEnded || questionCount === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isEnded
                ? 'クエストは終了しました'
                : questionCount === 0
                  ? '問題が設定されていません'
                  : 'クイズを開始する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
