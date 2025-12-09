'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Noto_Sans_JP } from 'next/font/google'
import { ChevronRight } from 'lucide-react'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

// 質問データ
const questions = [
  {
    id: 1,
    question: '自習時間はどちらが多い？',
    leftLabel: '1人で黙々',
    rightLabel: '誰かと一緒に',
    leftType: 'I' as const,
    rightType: 'E' as const,
  },
  {
    id: 2,
    question: '勉強中のエネルギー源は？',
    leftLabel: '静かな集中',
    rightLabel: '人との刺激',
    leftType: 'I' as const,
    rightType: 'E' as const,
  },
  {
    id: 3,
    question: 'モチベが上がるのは？',
    leftLabel: '自分との戦い',
    rightLabel: 'ライバルの存在',
    leftType: 'I' as const,
    rightType: 'E' as const,
  },
  {
    id: 4,
    question: '勉強する時どっちが得意？',
    leftLabel: '具体例から理解',
    rightLabel: '全体像から理解',
    leftType: 'S' as const,
    rightType: 'N' as const,
  },
  {
    id: 5,
    question: '参考書の選び方は？',
    leftLabel: '実績・定番',
    rightLabel: '新しさ・独自性',
    leftType: 'S' as const,
    rightType: 'N' as const,
  },
  {
    id: 6,
    question: '問題を解く時は？',
    leftLabel: '今ある条件重視',
    rightLabel: '先を予測して解く',
    leftType: 'S' as const,
    rightType: 'N' as const,
  },
  {
    id: 7,
    question: '解き方を選ぶ基準は？',
    leftLabel: '論理的に正しいか',
    rightLabel: '気持ち的にしっくりくるか',
    leftType: 'T' as const,
    rightType: 'F' as const,
  },
  {
    id: 8,
    question: '模試の結果を見るときは？',
    leftLabel: '点数と偏差値重視',
    rightLabel: '判定や気分重視',
    leftType: 'T' as const,
    rightType: 'F' as const,
  },
  {
    id: 9,
    question: '勉強の判断基準は？',
    leftLabel: '効率と結果',
    rightLabel: 'やりたい気持ち',
    leftType: 'T' as const,
    rightType: 'F' as const,
  },
  {
    id: 10,
    question: '勉強計画は？',
    leftLabel: '事前にきっちり立てる',
    rightLabel: 'その日の気分で決める',
    leftType: 'J' as const,
    rightType: 'P' as const,
  },
  {
    id: 11,
    question: '課題の取り組み方は？',
    leftLabel: '早めに終わらせる',
    rightLabel: 'ギリギリまで粘る',
    leftType: 'J' as const,
    rightType: 'P' as const,
  },
  {
    id: 12,
    question: '予定変更があったら？',
    leftLabel: 'ストレスになる',
    rightLabel: 'むしろ燃える',
    leftType: 'J' as const,
    rightType: 'P' as const,
  },
]

type MBTIType = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'

interface Scores {
  E: number
  I: number
  S: number
  N: number
  T: number
  F: number
  J: number
  P: number
}

export default function MBTIPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Scores>({
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  })
  const [sliderValue, setSliderValue] = useState(3) // 1-5, 3 is center
  const [isAnimating, setIsAnimating] = useState(false)

  const calculateResult = (finalScores: Scores): string => {
    const e_i = finalScores.E >= finalScores.I ? 'E' : 'I'
    const s_n = finalScores.S >= finalScores.N ? 'S' : 'N'
    const t_f = finalScores.T >= finalScores.F ? 'T' : 'F'
    const j_p = finalScores.J >= finalScores.P ? 'J' : 'P'
    return `${e_i}${s_n}${t_f}${j_p}`
  }

  const handleNext = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)

    const question = questions[currentQuestion]
    const newScores = { ...scores }

    // スライダー値に基づいてスコアを計算
    // 1: left +2, 2: left +1, 3: both +0.5, 4: right +1, 5: right +2
    if (sliderValue === 1) {
      newScores[question.leftType] += 2
    } else if (sliderValue === 2) {
      newScores[question.leftType] += 1
    } else if (sliderValue === 3) {
      newScores[question.leftType] += 0.5
      newScores[question.rightType] += 0.5
    } else if (sliderValue === 4) {
      newScores[question.rightType] += 1
    } else if (sliderValue === 5) {
      newScores[question.rightType] += 2
    }

    setScores(newScores)

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSliderValue(3) // リセット
        setIsAnimating(false)
      } else {
        // 結果を計算して結果ページへリダイレクト
        const mbtiResult = calculateResult(newScores)
        router.push(`/mbti/result/${mbtiResult.toLowerCase()}`)
      }
    }, 300)
  }, [currentQuestion, scores, sliderValue, isAnimating, router])

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  // スライダーのラベル
  const sliderLabels = ['', '強め', 'やや', 'どちらも', 'やや', '強め', '']

  return (
    <div
      className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}
    >
      {/* Navigation Header */}
      <nav className="bg-white border-b border-[#E0F7F1] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-xl text-[#3A405A]">Roopy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[#3A405A] hover:text-[#5DDFC3] font-medium transition-colors"
            >
              ログイン
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="text-[#5DDFC3]">受験生</span>タイプ診断
          </h1>
          <p className="text-sm text-[#3A405A] opacity-70">
            12問の質問であなたの勉強スタイルを診断
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Q{currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm text-[#5DDFC3] font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-300 ${
            isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8">
            {question.question}
          </h2>

          {/* Slider Section */}
          <div className="space-y-6">
            {/* Labels */}
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <span className="text-sm md:text-base font-medium text-[#5DDFC3]">
                  {question.leftLabel}
                </span>
              </div>
              <div className="text-center flex-1">
                <span className="text-sm md:text-base font-medium text-[#F97316]">
                  {question.rightLabel}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="relative px-2">
              {/* Track background */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full -translate-y-1/2" />

              {/* Gradient track */}
              <div
                className="absolute top-1/2 left-0 h-2 rounded-full -translate-y-1/2 transition-all"
                style={{
                  width: `${((sliderValue - 1) / 4) * 100}%`,
                  background: sliderValue <= 3
                    ? 'linear-gradient(to right, #5DDFC3, #5DDFC3)'
                    : 'linear-gradient(to right, #5DDFC3, #F97316)',
                }}
              />

              {/* Dots */}
              <div className="relative flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSliderValue(value)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all z-10 flex items-center justify-center ${
                      sliderValue === value
                        ? 'bg-white border-[#5DDFC3] shadow-lg scale-110'
                        : 'bg-white border-gray-300 hover:border-[#5DDFC3]'
                    }`}
                  >
                    <span className={`text-xs font-medium ${
                      sliderValue === value ? 'text-[#5DDFC3]' : 'text-gray-400'
                    }`}>
                      {value}
                    </span>
                  </button>
                ))}
              </div>

              {/* Slider labels */}
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>強め</span>
                <span>やや</span>
                <span>どちらも</span>
                <span>やや</span>
                <span>強め</span>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="w-full mt-6 p-4 bg-[#5DDFC3] hover:bg-[#4ECFB3] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {currentQuestion < questions.length - 1 ? '次へ' : '結果を見る'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-sm text-[#3A405A] opacity-50 mt-6">
          直感で選んでください
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0F7F1] py-8 px-4 mt-12">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-lg text-[#3A405A]">Roopy</span>
          </div>
          <p className="text-sm text-[#3A405A] opacity-70 mb-4">
            大学受験を"毎日つづけられる"ゲームにする
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
            >
              利用規約
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#3A405A] opacity-50">
            &copy; 2025 Edore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
