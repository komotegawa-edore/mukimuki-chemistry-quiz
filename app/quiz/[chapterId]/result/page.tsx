'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Coins } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7] px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border-2 border-[#E0F7F1]">
          {/* Roopyキャラクター */}
          <Image
            src="/Roopy.png"
            alt="Roopy"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />

          <h1 className="text-3xl font-bold mb-6 text-[#3A405A]">テスト完了！</h1>

          <div className="mb-8">
            <div
              className={`text-6xl font-bold mb-4 ${
                percentage >= 80
                  ? 'text-[#5DDFC3]'
                  : percentage >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {percentage}%
            </div>
            <p className="text-xl text-[#3A405A]">
              {score} / {total} 問正解
            </p>
          </div>

          {pointsAwarded && (
            <div className="mb-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white p-4 rounded-lg shadow-md animate-bounce">
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-6 h-6" />
                <span className="font-bold text-lg">+1pt 獲得！</span>
              </div>
            </div>
          )}

          {percentage >= 80 && (
            <p className="text-[#5DDFC3] font-semibold mb-6">素晴らしい成績です！</p>
          )}
          {percentage >= 60 && percentage < 80 && (
            <p className="text-yellow-600 font-semibold mb-6">もう少し復習しましょう。</p>
          )}
          {percentage < 60 && (
            <p className="text-red-600 font-semibold mb-6">
              しっかり復習して再挑戦しましょう。
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/quiz/${params.chapterId}`)}
              className="w-full py-3 bg-[#5DDFC3] text-white rounded-lg font-semibold hover:bg-[#4ECFB3] transition-colors"
            >
              もう一度挑戦
            </button>
            <Link
              href="/"
              className="block w-full py-3 bg-[#E0F7F1] rounded-lg font-semibold hover:bg-[#F4F9F7] text-[#3A405A] transition-colors"
            >
              章一覧に戻る
            </Link>
            <Link
              href="/history"
              className="block w-full py-3 text-[#5DDFC3] hover:bg-[#F4F9F7] rounded-lg font-semibold transition-colors"
            >
              履歴を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
