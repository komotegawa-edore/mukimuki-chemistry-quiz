'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import KoreanQuizRunner from '@/components/KoreanQuizRunner'
import type { KoreanPhrase, KoreanCategory } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'

function QuizContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') as KoreanCategory | null

  const [phrases, setPhrases] = useState<KoreanPhrase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhrases = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category) {
          params.set('category', category)
        }
        params.set('count', '10')

        const res = await fetch(`/api/korean/phrases?${params}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch phrases')
        }

        if (data.phrases.length === 0) {
          setError('まだ問題がありません')
        } else {
          setPhrases(data.phrases)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPhrases()
  }, [category])

  const handleComplete = (score: number, total: number) => {
    console.log(`Quiz completed: ${score}/${total}`)
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

  return (
    <KoreanQuizRunner
      phrases={phrases}
      onComplete={handleComplete}
      onHome={handleHome}
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
