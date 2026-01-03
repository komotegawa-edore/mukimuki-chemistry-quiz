'use client'

import { useRouter } from 'next/navigation'
import { Heart, HeartCrack, Users, Sparkles, Sun, Headphones, Play } from 'lucide-react'
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
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Headphones className="w-6 h-6" />
            <h1 className="text-xl font-bold">Roopy Korean</h1>
          </div>
          <p className="text-sm text-pink-100 mt-1">韓国語リスニングクイズ</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* 全問チャレンジ */}
        <button
          onClick={() => handleStartQuiz()}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-pink-100 text-sm">すべてのカテゴリ</p>
              <p className="text-2xl font-bold mt-1">クイズスタート</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 fill-current" />
            </div>
          </div>
        </button>

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
