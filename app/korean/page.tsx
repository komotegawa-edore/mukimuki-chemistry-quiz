'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Headphones, BookOpen, Play, ChevronRight } from 'lucide-react'

export default function KoreanHomePage() {
  const router = useRouter()

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
            <p className="text-xs text-pink-100">韓国語リスニング</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* キャラクター紹介 */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 shadow-lg mb-6 text-center text-white">
          <Image
            src="/korean/Roopy-Korean-icon.png"
            alt="Roopy"
            width={80}
            height={80}
            className="mx-auto mb-3"
          />
          <p className="text-pink-100 text-sm">韓国語を聞いて楽しく学ぼう!</p>
        </div>

        {/* メイン機能: リスニング */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-pink-500" />
            リスニング
          </h2>
          <button
            onClick={() => router.push('/korean/listening')}
            className="w-full bg-white rounded-2xl p-5 shadow-lg border-2 border-pink-200 hover:border-pink-400 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center shrink-0">
                <Play className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-lg">リスニング問題</p>
                <p className="text-sm text-gray-500">韓国語を聞いて内容を理解しよう</p>
                <p className="text-xs text-pink-500 mt-1">3問×10セット</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-pink-500 transition-colors" />
            </div>
          </button>
        </div>

        {/* サブ機能: 単文聞き取り練習 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            単文聞き取り練習
          </h2>
          <button
            onClick={() => router.push('/korean/quiz')}
            className="w-full bg-white rounded-2xl p-5 shadow-md border border-pink-100 hover:border-pink-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-7 h-7 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">単文クイズ</p>
                <p className="text-sm text-gray-500">1文を聞いて意味を当てよう</p>
                <p className="text-xs text-purple-500 mt-1">5問ランダム出題</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </button>
        </div>

        {/* 説明 */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-pink-100">
          <h3 className="font-bold text-gray-700 mb-3">学習の流れ</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 shrink-0">1</span>
              <div>
                <p className="font-medium text-gray-800">リスニング</p>
                <p className="text-gray-500">2-3行の韓国語を聞いて内容を把握</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 shrink-0">2</span>
              <div>
                <p className="font-medium text-gray-800">単文練習</p>
                <p className="text-gray-500">短いフレーズで語彙力アップ</p>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer className="mt-8 pt-6 border-t border-pink-100 text-center text-sm text-gray-400">
          <a href="/korean/privacy" className="hover:text-pink-500 transition-colors">
            プライバシーポリシー
          </a>
          <p className="mt-2">&copy; 2025 Edore</p>
        </footer>
      </main>
    </div>
  )
}
