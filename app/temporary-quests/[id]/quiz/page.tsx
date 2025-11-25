'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, X, Zap, Trophy, Coins } from 'lucide-react'

interface Question {
  id: number
  question_text: string
  choices: string[]
  correct_answer: number
  points: number
  explanation: string | null
  order_num: number
}

interface Quest {
  id: number
  title: string
  reward_points: number
  passing_score: number
}

interface Answer {
  question_id: number
  answer: number
}

interface Result {
  score: number
  total_points: number
  percentage: number
  is_cleared: boolean
  is_first_clear: boolean
  reward_points_awarded: number
  answers: Array<{
    question_id: number
    answer: number | null
    correct: boolean
    correct_answer: number
    points: number
    earned_points: number
  }>
}

export default function TemporaryQuestQuizPage() {
  const params = useParams()
  const router = useRouter()
  const questId = params.id as string

  const [quest, setQuest] = useState<Quest | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    fetchData()
  }, [questId])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [questRes, questionsRes] = await Promise.all([
        fetch(`/api/temporary-quests/${questId}`),
        fetch(`/api/temporary-quests/${questId}/questions`)
      ])

      if (!questRes.ok || !questionsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const questData = await questRes.json()
      const questionsData = await questionsRes.json()

      setQuest(questData.quest)
      setQuestions(questionsData.questions || [])
    } catch (err) {
      console.error('Failed to fetch quiz data:', err)
      alert('クイズデータの取得に失敗しました')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.question_id === questionId)
      if (existing >= 0) {
        const newAnswers = [...prev]
        newAnswers[existing] = { question_id: questionId, answer: answerIndex }
        return newAnswers
      }
      return [...prev, { question_id: questionId, answer: answerIndex }]
    })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (answers.length < questions.length) {
      if (!confirm(`未回答の問題が${questions.length - answers.length}問あります。このまま提出しますか？`)) {
        return
      }
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/temporary-quests/${questId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answers')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      console.error('Failed to submit answers:', err)
      alert('回答の提出に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">問題が設定されていません</p>
          <button
            onClick={() => router.push('/')}
            className="text-purple-600 hover:text-purple-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  // 結果表示
  if (result && quest) {
    const totalQuestions = questions.length
    const correctCount = result.answers.filter(a => a.correct).length

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 結果ヘッダー */}
            <div className={`p-8 text-white ${result.is_cleared ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
              <div className="text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">
                  {result.is_cleared ? 'クリア！' : '未クリア'}
                </h1>
                <p className="text-xl mb-4">{quest.title}</p>
                <div className="text-5xl font-bold mb-2">
                  {result.percentage}%
                </div>
                <p className="text-lg opacity-90">
                  {result.score}点 / {result.total_points}点満点
                </p>
              </div>
            </div>

            {/* 詳細結果 */}
            <div className="p-8">
              {/* クリア判定 */}
              <div className={`mb-6 p-4 rounded-lg ${result.is_cleared ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">クリア基準</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {quest.passing_score}%以上
                    </p>
                  </div>
                  {result.is_cleared ? (
                    <Check className="h-12 w-12 text-green-500" />
                  ) : (
                    <X className="h-12 w-12 text-gray-400" />
                  )}
                </div>
              </div>

              {/* 報酬表示 */}
              {result.is_first_clear && result.reward_points_awarded > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Coins className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600">初回クリア報酬</p>
                      <p className="text-2xl font-bold text-gray-900">
                        +{result.reward_points_awarded}pt 獲得！
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 統計 */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">正解数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {correctCount} / {totalQuestions}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">獲得点数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {result.score} / {result.total_points}
                  </p>
                </div>
              </div>

              {/* 問題別結果 */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">問題別結果</h3>
                <div className="space-y-3">
                  {result.answers.map((answer, index) => {
                    const question = questions.find(q => q.id === answer.question_id)
                    if (!question) return null

                    return (
                      <div
                        key={answer.question_id}
                        className={`p-4 rounded-lg border-2 ${
                          answer.correct
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            answer.correct ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {answer.correct ? (
                              <Check className="h-4 w-4 text-white" />
                            ) : (
                              <X className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">
                              問{index + 1}. {question.question_text}
                              <span className="ml-2 text-sm text-gray-600">
                                ({answer.earned_points}/{answer.points}点)
                              </span>
                            </p>
                            {answer.answer !== null && (
                              <p className={`text-sm ${answer.correct ? 'text-green-700' : 'text-red-700'}`}>
                                あなたの回答: {String.fromCharCode(65 + answer.answer)}. {question.choices[answer.answer]}
                              </p>
                            )}
                            {!answer.correct && (
                              <p className="text-sm text-green-700 font-medium">
                                正解: {String.fromCharCode(65 + answer.correct_answer)}. {question.choices[answer.correct_answer]}
                              </p>
                            )}
                            {question.explanation && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>解説:</strong> {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  ホームに戻る
                </button>
                <button
                  onClick={() => {
                    setResult(null)
                    setAnswers([])
                    setCurrentIndex(0)
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  もう一度挑戦
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // クイズ実行画面
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.find(a => a.question_id === currentQuestion.id)
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push(`/temporary-quests/${questId}`)}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          クエスト詳細に戻る
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* プログレスバー */}
          <div className="h-2 bg-gray-200">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-purple-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {quest?.title}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                問{currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* 問題 */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentQuestion.question_text}
                </h2>
                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 font-semibold rounded text-sm whitespace-nowrap">
                  {currentQuestion.points}点
                </span>
              </div>

              <div className="space-y-3">
                {currentQuestion.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      currentAnswer?.answer === index
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        currentAnswer?.answer === index
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {currentAnswer?.answer === index && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-600">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-gray-900">{choice}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                前の問題
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? '提出中...' : '回答を提出'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  次の問題
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* 回答状況 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">回答状況</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, i) => {
                  const answered = answers.some(a => a.question_id === q.id)
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                        i === currentIndex
                          ? 'bg-purple-600 text-white'
                          : answered
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
