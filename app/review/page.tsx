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
    subject_id: number
    subject?: {
      id: number
      name: string
      media_type: 'text' | 'image' | 'audio' | 'mixed'
    }
  }
}

const REVIEW_QUESTION_LIMIT = 20

// Fisher-Yatesシャッフルアルゴリズム
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ReviewPage() {
  const router = useRouter()
  const [allQuestions, setAllQuestions] = useState<QuestionWithChapter[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionWithChapter[]>([])
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

        const data = await response.json() as QuestionWithChapter[]
        setAllQuestions(data)

        // ランダムに20問（またはそれ以下）を選択
        const shuffled = shuffleArray(data)
        const selected = shuffled.slice(0, Math.min(REVIEW_QUESTION_LIMIT, data.length))
        setSelectedQuestions(selected)
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

  const handleReshuffle = () => {
    // 新しくランダムに20問を選択
    const shuffled = shuffleArray(allQuestions)
    const selected = shuffled.slice(0, Math.min(REVIEW_QUESTION_LIMIT, allQuestions.length))
    setSelectedQuestions(selected)
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

  if (isReviewMode && selectedQuestions.length > 0) {
    return (
      <QuizRunner
        questions={selectedQuestions}
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
          {allQuestions.length === 0 ? (
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
                <div className="flex items-center gap-3 text-gray-600">
                  <p>
                    過去に間違えた問題が <span className="font-bold text-black">{allQuestions.length}</span> 問あります
                  </p>
                  {allQuestions.length > REVIEW_QUESTION_LIMIT && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded font-semibold">
                      ランダムで{REVIEW_QUESTION_LIMIT}問を選択
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">
                  復習モードについて
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 過去のテストで間違えた問題からランダムに{REVIEW_QUESTION_LIMIT}問を選択します</li>
                  <li>• 問題はランダムな順序で表示されます</li>
                  <li>• 復習の結果は記録されません（何度でも挑戦できます）</li>
                </ul>
              </div>

              {/* 科目・章ごとの内訳（選択された問題のみ） */}
              <div className="mb-6">
                <h3 className="font-semibold text-black mb-3">
                  選択された問題の内訳（{selectedQuestions.length}問）
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    selectedQuestions.reduce(
                      (acc, q) => {
                        if (q.mukimuki_chapters?.subject) {
                          const subjectId = q.mukimuki_chapters.subject.id
                          const chapterId = q.mukimuki_chapters.id

                          if (!acc[subjectId]) {
                            acc[subjectId] = {
                              name: q.mukimuki_chapters.subject.name,
                              displayOrder: subjectId,
                              chapters: {},
                            }
                          }

                          if (!acc[subjectId].chapters[chapterId]) {
                            acc[subjectId].chapters[chapterId] = {
                              title: q.mukimuki_chapters.title,
                              count: 0,
                              orderNum: q.mukimuki_chapters.order_num,
                            }
                          }

                          acc[subjectId].chapters[chapterId].count++
                        }
                        return acc
                      },
                      {} as Record<
                        number,
                        {
                          name: string
                          displayOrder: number
                          chapters: Record<
                            number,
                            { title: string; count: number; orderNum: number }
                          >
                        }
                      >
                    )
                  )
                    .sort(([, a], [, b]) => a.displayOrder - b.displayOrder)
                    .map(([subjectId, { name, chapters }]) => (
                      <div key={subjectId} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2">
                          <h4 className="font-semibold text-black">{name}</h4>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(chapters)
                            .sort(([, a], [, b]) => a.orderNum - b.orderNum)
                            .map(([chapterId, { title, count }]) => (
                              <div
                                key={chapterId}
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
                    ))}
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {allQuestions.length > REVIEW_QUESTION_LIMIT && (
                  <button
                    onClick={handleReshuffle}
                    className="px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-lg shadow-md flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    別の問題を選択
                  </button>
                )}
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
