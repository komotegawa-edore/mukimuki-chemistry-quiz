'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import QuizRunner from '@/components/QuizRunner'
import { Question, Answer } from '@/lib/types/database'

export default function QuizPage({
  params,
}: {
  params: { chapterId: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [chapterTitle, setChapterTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMissionMode, setIsMissionMode] = useState(false)
  const [timeLimit, setTimeLimit] = useState(300)

  useEffect(() => {
    // クイズ開始時刻を記録
    const startTime = Date.now()
    sessionStorage.setItem(`quiz_start_${params.chapterId}`, startTime.toString())

    // ミッションモードチェック
    const missionParam = searchParams.get('mission')
    const isMission = missionParam === '1'
    setIsMissionMode(isMission)

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/questions?chapterId=${params.chapterId}`
        )
        if (!response.ok) throw new Error('Failed to fetch questions')

        const data = await response.json()
        setQuestions(data)

        // ミッションモードの場合、ミッション情報を取得
        if (isMission) {
          const missionResponse = await fetch('/api/daily-mission')
          if (missionResponse.ok) {
            const missionData = await missionResponse.json()
            if (missionData.mission && missionData.mission.chapter_id === parseInt(params.chapterId)) {
              setTimeLimit(missionData.mission.time_limit_seconds)
            }
          }
        }

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
  }, [params.chapterId, searchParams])

  const handleComplete = async (
    score: number,
    total: number,
    answers: Record<number, Answer>
  ) => {
    try {
      console.log('Submitting quiz result:', {
        chapter_id: parseInt(params.chapterId),
        score,
        total,
        answersCount: Object.keys(answers).length,
      })

      const response = await fetch('/api/results', {
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

      const data = await response.json()
      console.log('Quiz result response:', data)

      if (!response.ok) {
        console.error('Server returned error:', response.status, data)
        throw new Error(data.error || 'Failed to save result')
      }

      // デイリーミッション達成チェック
      let missionCompleted = false
      try {
        const startTimeStr = sessionStorage.getItem(`quiz_start_${params.chapterId}`)
        if (startTimeStr) {
          const startTime = parseInt(startTimeStr)
          const completionTimeSeconds = Math.floor((Date.now() - startTime) / 1000)

          const missionResponse = await fetch('/api/daily-mission/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chapter_id: parseInt(params.chapterId),
              completion_time_seconds: completionTimeSeconds,
            }),
          })

          if (missionResponse.ok) {
            const missionData = await missionResponse.json()
            if (missionData.success) {
              missionCompleted = true
              console.log('Daily mission completed!', missionData.message)
            }
          }

          // 開始時刻をクリア
          sessionStorage.removeItem(`quiz_start_${params.chapterId}`)
        }
      } catch (missionErr) {
        console.error('Mission check failed:', missionErr)
        // ミッションのエラーはクイズ結果には影響させない
      }

      // 結果ページへ（ポイント獲得情報とミッション達成情報も渡す）
      const pointsParam = data.pointsAwarded ? '&points=1' : ''
      const missionParam = missionCompleted ? '&mission=1' : ''
      router.push(
        `/quiz/${params.chapterId}/result?score=${score}&total=${total}${pointsParam}${missionParam}`
      )
    } catch (err) {
      console.error('Failed to save result:', err)
      alert('結果の保存に失敗しました: ' + (err instanceof Error ? err.message : String(err)))
    }
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
      onQuit={handleQuit}
      isMissionMode={isMissionMode}
      timeLimit={timeLimit}
    />
  )
}
