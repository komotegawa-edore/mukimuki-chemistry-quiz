'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizRunner from '@/components/QuizRunner'
import { Question, Answer } from '@/lib/types/database'

export default function QuizPage({
  params,
}: {
  params: { chapterId: string }
}) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [chapterTitle, setChapterTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/questions?chapterId=${params.chapterId}`
        )
        if (!response.ok) throw new Error('Failed to fetch questions')

        const data = await response.json()
        setQuestions(data)

        // 章タイトルも取得（簡易的にfetchで取得）
        const chaptersResponse = await fetch('/api/chapters')
        if (chaptersResponse.ok) {
          const chapters = await chaptersResponse.json()
          const chapter = chapters.find(
            (c: { id: number }) => c.id === parseInt(params.chapterId)
          )
          if (chapter) {
            setChapterTitle(chapter.title)
          }
        }
      } catch (err) {
        setError('問題の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [params.chapterId])

  const handleComplete = async (
    score: number,
    total: number,
    answers: Record<number, Answer>
  ) => {
    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapter_id: parseInt(params.chapterId),
          score,
          total,
          answers,
        }),
      })

      // 結果ページへ
      router.push(
        `/quiz/${params.chapterId}/result?score=${score}&total=${total}`
      )
    } catch (err) {
      console.error('Failed to save result:', err)
      alert('結果の保存に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <QuizRunner
      questions={questions}
      chapterId={parseInt(params.chapterId)}
      chapterTitle={chapterTitle || `第${params.chapterId}章`}
      onComplete={handleComplete}
    />
  )
}
