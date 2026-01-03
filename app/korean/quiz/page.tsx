'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import KoreanQuizRunner from '@/components/KoreanQuizRunner'
import type { KoreanPhrase, KoreanCategory } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'

// セッションID取得（localStorageに保存）
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('korean_session_id')
  if (!sessionId) {
    sessionId = `ks_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    localStorage.setItem('korean_session_id', sessionId)
  }
  return sessionId
}

function QuizContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') as KoreanCategory | null

  const [phrases, setPhrases] = useState<KoreanPhrase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const answersRef = useRef<{ phraseId: string; correct: boolean; selectedIndex: number }[]>([])

  useEffect(() => {
    const fetchPhrases = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category) {
          params.set('category', category)
        }
        params.set('count', '10')
        params.set('audioOnly', 'true')  // リスニングモード

        const res = await fetch(`/api/korean/phrases?${params}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch phrases')
        }

        if (data.phrases.length === 0) {
          setError('音声付きの問題がまだありません')
        } else {
          setPhrases(data.phrases)
          answersRef.current = []
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPhrases()
  }, [category])

  const handleComplete = async (score: number, total: number) => {
    // 結果を保存
    try {
      await fetch('/api/korean/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          category: category || null,
          score,
          total,
          phraseIds: phrases.map(p => p.id),
          answers: answersRef.current,
        }),
      })
    } catch (err) {
      console.error('Failed to save result:', err)
    }
  }

  const handleHome = () => {
    router.push('/korean')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-500">問題を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleHome}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  const handleAnswer = (phraseId: string, correct: boolean, selectedIndex: number) => {
    answersRef.current.push({ phraseId, correct, selectedIndex })
  }

  return (
    <KoreanQuizRunner
      phrases={phrases}
      onComplete={handleComplete}
      onHome={handleHome}
      onAnswer={handleAnswer}
    />
  )
}

export default function KoreanQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  )
}
