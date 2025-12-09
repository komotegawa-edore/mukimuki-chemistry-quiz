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
    choices: [
      { label: '1人で黙々', type: 'I' as const },
      { label: '誰かと一緒に', type: 'E' as const },
    ],
  },
  {
    id: 2,
    question: '勉強中のエネルギー源は？',
    choices: [
      { label: '静かな集中', type: 'I' as const },
      { label: '人との刺激', type: 'E' as const },
    ],
  },
  {
    id: 3,
    question: 'モチベが上がるのは？',
    choices: [
      { label: '自分との戦い', type: 'I' as const },
      { label: 'ライバルの存在', type: 'E' as const },
    ],
  },
  {
    id: 4,
    question: '勉強する時どっちが得意？',
    choices: [
      { label: '具体例から理解', type: 'S' as const },
      { label: '全体像から理解', type: 'N' as const },
    ],
  },
  {
    id: 5,
    question: '参考書の選び方は？',
    choices: [
      { label: '実績・定番', type: 'S' as const },
      { label: '新しさ・独自性', type: 'N' as const },
    ],
  },
  {
    id: 6,
    question: '問題を解く時は？',
    choices: [
      { label: '今ある条件重視', type: 'S' as const },
      { label: '先を予測して解く', type: 'N' as const },
    ],
  },
  {
    id: 7,
    question: '解き方を選ぶ基準は？',
    choices: [
      { label: '論理的に正しいか', type: 'T' as const },
      { label: '気持ち的にしっくりくるか', type: 'F' as const },
    ],
  },
  {
    id: 8,
    question: '模試の結果を見るときは？',
    choices: [
      { label: '点数と偏差値重視', type: 'T' as const },
      { label: '判定や気分重視', type: 'F' as const },
    ],
  },
  {
    id: 9,
    question: '勉強の判断基準は？',
    choices: [
      { label: '効率と結果', type: 'T' as const },
      { label: 'やりたい気持ち', type: 'F' as const },
    ],
  },
  {
    id: 10,
    question: '勉強計画は？',
    choices: [
      { label: '事前にきっちり立てる', type: 'J' as const },
      { label: 'その日の気分で決める', type: 'P' as const },
    ],
  },
  {
    id: 11,
    question: '課題の取り組み方は？',
    choices: [
      { label: '早めに終わらせる', type: 'J' as const },
      { label: 'ギリギリまで粘る', type: 'P' as const },
    ],
  },
  {
    id: 12,
    question: '予定変更があったら？',
    choices: [
      { label: 'ストレスになる', type: 'J' as const },
      { label: 'むしろ燃える', type: 'P' as const },
    ],
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
  const [isAnimating, setIsAnimating] = useState(false)

  const calculateResult = (finalScores: Scores): string => {
    const e_i = finalScores.E >= finalScores.I ? 'E' : 'I'
    const s_n = finalScores.S >= finalScores.N ? 'S' : 'N'
    const t_f = finalScores.T >= finalScores.F ? 'T' : 'F'
    const j_p = finalScores.J >= finalScores.P ? 'J' : 'P'
    return `${e_i}${s_n}${t_f}${j_p}`
  }

  const handleAnswer = useCallback(
    (type: MBTIType) => {
      if (isAnimating) return

      setIsAnimating(true)
      const newScores = { ...scores, [type]: scores[type] + 1 }
      setScores(newScores)

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1)
          setIsAnimating(false)
        } else {
          // 結果を計算して結果ページへリダイレクト
          const mbtiResult = calculateResult(newScores)
          router.push(`/mbti/result/${mbtiResult.toLowerCase()}`)
        }
      }, 300)
    },
    [currentQuestion, scores, isAnimating, router]
  )

  const progress = ((currentQuestion + 1) / questions.length) * 100

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
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-4">
            {questions[currentQuestion].choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(choice.type)}
                disabled={isAnimating}
                className="w-full p-5 bg-[#F4F9F7] hover:bg-[#E0F7F1] border-2 border-transparent hover:border-[#5DDFC3] rounded-xl text-left transition-all duration-200 flex items-center justify-between group"
              >
                <span className="text-lg font-medium">{choice.label}</span>
                <ChevronRight className="w-5 h-5 text-[#5DDFC3] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
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
