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
  const pointsAwarded = searchParams.get('points') === '1'

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

          {pointsAwarded && (
            <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-md animate-bounce">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-lg">+1pt 獲得！</span>
              </div>
            </div>
          )}

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
