'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizRunner from '@/components/QuizRunner'
import { Question, Answer } from '@/lib/types/database'
import Link from 'next/link'

interface QuestionWithChapter extends Question {
  mukimuki_chapters?: {
    id: number
    title: string
    order_num: number
  }
}

export default function ReviewPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuestionWithChapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReviewMode, setIsReviewMode] = useState(false)

  useEffect(() => {
    const fetchIncorrectQuestions = async () => {
      try {
        const response = await fetch('/api/questions/incorrect')
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch incorrect questions')
        }

        const data = await response.json()
        setQuestions(data)
      } catch (err) {
        setError('間違えた問題の読み込みに失敗しました')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIncorrectQuestions()
  }, [router])

  const handleStartReview = () => {
    setIsReviewMode(true)
  }

  const handleComplete = async (
    score: number,
    total: number,
    answers: Record<number, Answer>
  ) => {
    // 復習結果は保存しない（または別途保存する場合はここに実装）
    router.push(`/review/result?score=${score}&total=${total}`)
  }

  const handleQuit = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (isReviewMode && questions.length > 0) {
    return (
      <QuizRunner
        questions={questions}
        chapterId={0}
        chapterTitle="復習モード"
        onComplete={handleComplete}
        onQuit={handleQuit}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← ホームに戻る
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-black">
              復習モード
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {questions.length === 0 ? (
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4">
                素晴らしい！
              </h2>
              <p className="text-gray-600 mb-6">
                現在、復習が必要な問題はありません。
                <br />
                新しい章に挑戦してみましょう！
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                ホームに戻る
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-2">
                  間違えた問題を復習しましょう
                </h2>
                <p className="text-gray-600">
                  過去に間違えた問題が {questions.length} 問あります。
                </p>
              </div>

              <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">
                  復習モードについて
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 過去のテストで間違えた問題のみが出題されます</li>
                  <li>• 問題はランダムな順序で表示されます</li>
                  <li>• 復習の結果は記録されません（何度でも挑戦できます）</li>
                </ul>
              </div>

              {/* 章ごとの内訳 */}
              <div className="mb-6">
                <h3 className="font-semibold text-black mb-3">章ごとの内訳</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(
                    questions.reduce(
                      (acc, q) => {
                        if (q.mukimuki_chapters) {
                          const key = q.mukimuki_chapters.id
                          if (!acc[key]) {
                            acc[key] = {
                              title: q.mukimuki_chapters.title,
                              count: 0,
                              orderNum: q.mukimuki_chapters.order_num,
                            }
                          }
                          acc[key].count++
                        }
                        return acc
                      },
                      {} as Record<
                        number,
                        { title: string; count: number; orderNum: number }
                      >
                    )
                  )
                    .sort(([, a], [, b]) => a.orderNum - b.orderNum)
                    .map(([id, { title, count }]) => (
                      <div
                        key={id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200"
                      >
                        <span className="text-sm text-black">{title}</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {count}問
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleStartReview}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-md"
                >
                  復習を開始する
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
