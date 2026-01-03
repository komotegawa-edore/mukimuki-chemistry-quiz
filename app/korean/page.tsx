'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, HeartCrack, Users, Sparkles, Sun, Play } from 'lucide-react'
import { KOREAN_CATEGORIES, type KoreanCategory } from '@/lib/types/database'

// アイコンマッピング
const iconMap = {
  Heart,
  HeartCrack,
  Users,
  Sparkles,
  Sun,
}

export default function KoreanHomePage() {
  const router = useRouter()

  const handleStartQuiz = (category?: KoreanCategory) => {
    const url = category ? `/korean/quiz?category=${category}` : '/korean/quiz'
    router.push(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Image
            src="/korean/Roopy-Korean-icon.png"
            alt="Roopy Korean"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold">Roopy Korean</h1>
            <p className="text-xs text-pink-100">韓国語リスニングクイズ</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* キャラクター＆スタートボタン */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <Image
              src="/korean/Roopy-Korean-icon.png"
              alt="Roopy"
              width={80}
              height={80}
              className="shrink-0"
            />
            <div className="flex-1">
              <p className="text-pink-100 text-sm">韓国語を聞いて答えよう!</p>
              <button
                onClick={() => handleStartQuiz()}
                className="mt-2 bg-white text-pink-500 font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                クイズスタート
              </button>
            </div>
          </div>
        </div>

        {/* カテゴリ選択 */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">カテゴリから選ぶ</h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(KOREAN_CATEGORIES) as [KoreanCategory, typeof KOREAN_CATEGORIES[KoreanCategory]][]).map(
            ([key, category]) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap]
              return (
                <button
                  key={key}
                  onClick={() => handleStartQuiz(key)}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-pink-100 hover:border-pink-300"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-pink-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{category.japanese}</p>
                      <p className="text-sm text-gray-500">{category.korean}</p>
                    </div>
                  </div>
                </button>
              )
            }
          )}
        </div>

        {/* 説明 */}
        <div className="mt-8 bg-white rounded-xl p-4 shadow-md border border-pink-100">
          <h3 className="font-bold text-gray-700 mb-2">遊び方</h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 shrink-0">1</span>
              韓国語の音声を聞く
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 shrink-0">2</span>
              4つの日本語から正解を選ぶ
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 shrink-0">3</span>
              韓国語のテキストを確認して覚える
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}
