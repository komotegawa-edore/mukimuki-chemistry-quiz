'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResultPage({
  params,
}: {
  params: { chapterId: string }
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const score = parseInt(searchParams.get('score') || '0')
  const total = parseInt(searchParams.get('total') || '1')
  const percentage = Math.round((score / total) * 100)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold mb-6 text-black">テスト完了！</h1>

          <div className="mb-8">
            <div
              className={`text-6xl font-bold mb-4 ${
                percentage >= 80
                  ? 'text-green-600'
                  : percentage >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {percentage}%
            </div>
            <p className="text-xl text-black">
              {score} / {total} 問正解
            </p>
          </div>

          {percentage >= 80 && (
            <p className="text-green-600 mb-6">素晴らしい成績です！</p>
          )}
          {percentage >= 60 && percentage < 80 && (
            <p className="text-yellow-600 mb-6">もう少し復習しましょう。</p>
          )}
          {percentage < 60 && (
            <p className="text-red-600 mb-6">
              しっかり復習して再挑戦しましょう。
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/quiz/${params.chapterId}`)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              もう一度挑戦
            </button>
            <Link
              href="/"
              className="block w-full py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 text-black"
            >
              章一覧に戻る
            </Link>
            <Link
              href="/history"
              className="block w-full py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
            >
              履歴を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
