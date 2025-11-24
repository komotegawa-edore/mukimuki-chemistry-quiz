'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Beaker, Trophy, Coins, RotateCcw } from 'lucide-react'

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // 初回ログイン判定（localStorageで管理）
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] p-6 rounded-t-2xl relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <Image
              src="/Roopy.png"
              alt="Roopy"
              width={80}
              height={80}
              className="flex-shrink-0"
            />
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">ようこそ、Roopyへ！</h2>
              <p className="text-sm opacity-90">
                一緒に大学受験の森を冒険しましょう🌱
              </p>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 使い方セクション */}
          <div>
            <h3 className="text-xl font-bold text-[#3A405A] mb-4">
              Roopyの使い方
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-[#F4F9F7] p-4 rounded-xl">
                <div className="bg-[#5DDFC3] p-2 rounded-lg flex-shrink-0">
                  <Beaker className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#3A405A] mb-1">1. 章を選んでクイズに挑戦</h4>
                  <p className="text-sm text-[#3A405A] opacity-70">
                    無機化学の全33章から好きな章を選んで、1問1答形式で学習できます。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#F4F9F7] p-4 rounded-xl">
                <div className="bg-[#FFD700] p-2 rounded-lg flex-shrink-0">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#3A405A] mb-1">2. ポイントを貯めよう</h4>
                  <p className="text-sm text-[#3A405A] opacity-70">
                    問題を解くとポイント獲得！毎日ログインでボーナスもあります。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#F4F9F7] p-4 rounded-xl">
                <div className="bg-[#FF8C42] p-2 rounded-lg flex-shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#3A405A] mb-1">3. ランキングで競争</h4>
                  <p className="text-sm text-[#3A405A] opacity-70">
                    全国のライバルとポイントで競い合って、モチベーションUP！
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#F4F9F7] p-4 rounded-xl">
                <div className="bg-[#5DDFC3] p-2 rounded-lg flex-shrink-0">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#3A405A] mb-1">4. 間違えた問題を復習</h4>
                  <p className="text-sm text-[#3A405A] opacity-70">
                    復習モードで苦手な問題を効率的に克服できます。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roopyからのメッセージ */}
          <div className="bg-gradient-to-br from-[#E0F7F1] to-white border-2 border-[#5DDFC3] rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Image
                src="/Roopy.png"
                alt="Roopy"
                width={50}
                height={50}
                className="flex-shrink-0"
              />
              <div>
                <p className="text-[#3A405A] font-semibold mb-2">
                  Roopyより
                </p>
                <p className="text-sm text-[#3A405A] leading-relaxed">
                  毎日コツコツ続けることが大切だよ！小さな積み重ねが、大きな成果につながるんだ。一緒に頑張ろう！🌟
                </p>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] text-white text-lg font-bold py-4 rounded-xl hover:shadow-lg transition-all"
          >
            さっそく始める！
          </button>
        </div>
      </div>
    </div>
  )
}
