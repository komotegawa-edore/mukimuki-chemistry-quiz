'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizRunner from '@/components/QuizRunner'
import { Question, Answer } from '@/lib/types/database'
import Link from 'next/link'
import { CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react'
import RoopyLoader from '@/components/RoopyLoader'

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
      <div className="min-h-screen bg-[#F4F9F7]">
        <RoopyLoader message="復習問題を読み込み中..." fullScreen />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F9F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/"
            className="px-6 py-2 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] font-medium transition-colors"
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
    <div className="min-h-screen bg-[#F4F9F7]">
      <header className="bg-white shadow-sm border-b-2 border-[#E0F7F1]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[#5DDFC3] hover:text-[#4ECFB3] font-medium flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              ホームに戻る
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-[#3A405A]">
              復習モード
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 border-2 border-[#E0F7F1]">
          {allQuestions.length === 0 ? (
            <div className="text-center">
              <div className="mb-4">
                <CheckCircle2 className="mx-auto h-16 w-16 text-[#5DDFC3]" />
              </div>
              <h2 className="text-2xl font-bold text-[#3A405A] mb-4">
                素晴らしい！
              </h2>
              <p className="text-[#3A405A] opacity-70 mb-6">
                現在、復習が必要な問題はありません。
                <br />
                新しい章に挑戦してみましょう！
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] font-semibold transition-colors"
              >
                ホームに戻る
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#3A405A] mb-2">
                  間違えた問題を復習しましょう
                </h2>
                <div className="flex items-center gap-3 text-[#3A405A] opacity-70">
                  <p>
                    過去に間違えた問題が <span className="font-bold text-[#3A405A] opacity-100">{allQuestions.length}</span> 問あります
                  </p>
                  {allQuestions.length > REVIEW_QUESTION_LIMIT && (
                    <span className="px-2 py-1 bg-[#E0F7F1] text-[#5DDFC3] text-sm rounded font-semibold">
                      ランダムで{REVIEW_QUESTION_LIMIT}問を選択
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6 bg-[#F4F9F7] border-l-4 border-[#5DDFC3] p-4 rounded">
                <h3 className="font-semibold text-[#3A405A] mb-2">
                  復習モードについて
                </h3>
                <ul className="text-sm text-[#3A405A] opacity-70 space-y-1">
                  <li>• 過去のテストで間違えた問題からランダムに{REVIEW_QUESTION_LIMIT}問を選択します</li>
                  <li>• 問題はランダムな順序で表示されます</li>
                  <li>• 復習の結果は記録されません（何度でも挑戦できます）</li>
                </ul>
              </div>

              {/* 科目・章ごとの内訳（選択された問題のみ） */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#3A405A] mb-3">
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
                      <div key={subjectId} className="border-2 border-[#E0F7F1] rounded-lg overflow-hidden">
                        <div className="bg-[#F4F9F7] px-4 py-2">
                          <h4 className="font-semibold text-[#3A405A]">{name}</h4>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(chapters)
                            .sort(([, a], [, b]) => a.orderNum - b.orderNum)
                            .map(([chapterId, { title, count }]) => (
                              <div
                                key={chapterId}
                                className="flex justify-between items-center p-3 bg-white rounded border border-[#E0F7F1]"
                              >
                                <span className="text-sm text-[#3A405A]">{title}</span>
                                <span className="text-sm font-semibold text-[#5DDFC3]">
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
                    className="px-6 py-4 bg-[#E0F7F1] text-[#3A405A] rounded-lg hover:bg-[#F4F9F7] font-semibold text-lg shadow-md flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    別の問題を選択
                  </button>
                )}
                <button
                  onClick={handleStartReview}
                  className="px-8 py-4 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] font-semibold text-lg shadow-md transition-colors"
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
