'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import Image from 'next/image'

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
    <div className="min-h-screen bg-[#F4F9F7]">
      <header className="bg-white shadow-sm border-b-2 border-[#E0F7F1]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#3A405A]">
            復習結果
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 border-2 border-[#E0F7F1]">
          {/* Roopyキャラクター */}
          <Image
            src="/Roopy.png"
            alt="Roopy"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />

          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${percentage >= 80 ? 'text-[#5DDFC3]' : percentage >= 60 ? 'text-yellow-600' : 'text-[#5DDFC3]'}`}>
              {result.title}
            </h2>
            <p className="text-[#3A405A] opacity-70">{result.message}</p>
          </div>

          <div className="mb-8 p-6 bg-[#F4F9F7] rounded-lg">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${percentage >= 80 ? 'text-[#5DDFC3]' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {percentage}%
              </div>
              <div className="text-[#3A405A] opacity-70">
                {score} / {total} 問正解
              </div>
            </div>
          </div>

          <div className="bg-[#F4F9F7] border-l-4 border-[#5DDFC3] p-4 rounded mb-6">
            <p className="text-sm text-[#3A405A] opacity-70">
              ※ 復習モードの結果は記録されません。何度でも挑戦できます！
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/review"
              className="block w-full px-6 py-3 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] font-semibold text-center transition-colors"
            >
              もう一度復習する
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-[#E0F7F1] text-[#3A405A] rounded-lg hover:bg-[#F4F9F7] font-semibold text-center transition-colors"
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
        <div className="min-h-screen bg-[#F4F9F7] flex items-center justify-center">
          <p className="text-[#3A405A]">読み込み中...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
