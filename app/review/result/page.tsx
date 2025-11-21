'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ResultContent() {
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get('score') || '0')
  const total = parseInt(searchParams.get('total') || '0')
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  const getMessage = () => {
    if (percentage >= 80) {
      return {
        title: '素晴らしい！',
        message: '復習の成果が出ています！',
        color: 'text-green-600',
      }
    } else if (percentage >= 60) {
      return {
        title: '良い調子です！',
        message: 'もう少し練習すれば完璧です！',
        color: 'text-yellow-600',
      }
    } else {
      return {
        title: 'もう一度挑戦！',
        message: '繰り返し復習することで理解が深まります！',
        color: 'text-blue-600',
      }
    }
  }

  const result = getMessage()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-black">
            復習結果
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${result.color}`}>
              {result.title}
            </h2>
            <p className="text-gray-600">{result.message}</p>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-5xl font-bold text-black mb-2">
                {percentage}%
              </div>
              <div className="text-gray-600">
                {score} / {total} 問正解
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
            <p className="text-sm text-blue-800">
              ※ 復習モードの結果は記録されません。何度でも挑戦できます！
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/review"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-center"
            >
              もう一度復習する
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 font-semibold text-center"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ReviewResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-black">読み込み中...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
