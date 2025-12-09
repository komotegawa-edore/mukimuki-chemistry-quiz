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

const QUESTIONS_PER_PAGE = 3
const TOTAL_PAGES = Math.ceil(questions.length / QUESTIONS_PER_PAGE)

export default function MBTIPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isAnimating, setIsAnimating] = useState(false)

  // 現在のページの質問を取得
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  )

  // 現在のページの全質問が回答済みかチェック
  const isPageComplete = currentQuestions.every((q) => answers[q.id] !== undefined)

  const calculateResult = (finalAnswers: Record<number, number>): string => {
    const scores: Scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

    questions.forEach((question) => {
      const value = finalAnswers[question.id] || 3

      if (value === 1) {
        scores[question.leftType] += 2
      } else if (value === 2) {
        scores[question.leftType] += 1
      } else if (value === 3) {
        scores[question.leftType] += 0.5
        scores[question.rightType] += 0.5
      } else if (value === 4) {
        scores[question.rightType] += 1
      } else if (value === 5) {
        scores[question.rightType] += 2
      }
    })

    const e_i = scores.E >= scores.I ? 'E' : 'I'
    const s_n = scores.S >= scores.N ? 'S' : 'N'
    const t_f = scores.T >= scores.F ? 'T' : 'F'
    const j_p = scores.J >= scores.P ? 'J' : 'P'
    return `${e_i}${s_n}${t_f}${j_p}`
  }

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = useCallback(() => {
    if (isAnimating || !isPageComplete) return

    setIsAnimating(true)

    setTimeout(() => {
      if (currentPage < TOTAL_PAGES - 1) {
        setCurrentPage(currentPage + 1)
        setIsAnimating(false)
        // ページトップにスクロール
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // 結果を計算して結果ページへリダイレクト
        const mbtiResult = calculateResult(answers)
        router.push(`/mbti/result/${mbtiResult.toLowerCase()}`)
      }
    }, 300)
  }, [currentPage, answers, isAnimating, isPageComplete, router])

  const progress = ((currentPage + 1) / TOTAL_PAGES) * 100
  const answeredCount = Object.keys(answers).length

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
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="text-[#5DDFC3]">受験生</span>タイプ診断
          </h1>
          <p className="text-sm text-[#3A405A] opacity-70">
            12問の質問であなたの勉強スタイルを診断
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {currentPage + 1} / {TOTAL_PAGES} ページ
            </span>
            <span className="text-sm text-[#5DDFC3] font-medium">
              {answeredCount} / {questions.length} 回答済み
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div
          className={`space-y-6 transition-all duration-300 ${
            isAnimating ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {currentQuestions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-2xl shadow-lg p-5 md:p-6"
            >
              {/* Question Number & Text */}
              <div className="flex items-start gap-3 mb-5">
                <span className="flex-shrink-0 w-8 h-8 bg-[#5DDFC3] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {question.id}
                </span>
                <h2 className="text-lg font-bold pt-1">{question.question}</h2>
              </div>

              {/* Labels */}
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-xs md:text-sm font-medium text-[#5DDFC3]">
                  {question.leftLabel}
                </span>
                <span className="text-xs md:text-sm font-medium text-[#F97316]">
                  {question.rightLabel}
                </span>
              </div>

              {/* Slider */}
              <div className="relative px-1">
                {/* Track background */}
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full -translate-y-1/2" />

                {/* Center-based track */}
                {answers[question.id] !== undefined && answers[question.id] !== 3 && (
                  <div
                    className="absolute top-1/2 h-1.5 rounded-full -translate-y-1/2 transition-all"
                    style={{
                      left: answers[question.id] < 3 ? `${((answers[question.id] - 1) / 4) * 100}%` : '50%',
                      width: `${Math.abs((answers[question.id] || 3) - 3) * 25}%`,
                      background: answers[question.id] < 3 ? '#5DDFC3' : '#F97316',
                    }}
                  />
                )}

                {/* Dots */}
                <div className="relative flex justify-between items-center">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isSelected = answers[question.id] === value
                    return (
                      <button
                        key={value}
                        onClick={() => handleAnswerChange(question.id, value)}
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-all z-10 flex items-center justify-center ${
                          isSelected
                            ? value < 3
                              ? 'bg-[#5DDFC3] border-[#5DDFC3] shadow-lg scale-110'
                              : value > 3
                                ? 'bg-[#F97316] border-[#F97316] shadow-lg scale-110'
                                : 'bg-gray-400 border-gray-400 shadow-lg scale-110'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span
                          className={`text-xs font-medium ${
                            isSelected ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {value === 3 ? '−' : value < 3 ? 4 - value : value - 2}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={isAnimating || !isPageComplete}
          className="w-full mt-6 p-4 bg-[#5DDFC3] hover:bg-[#4ECFB3] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentPage < TOTAL_PAGES - 1 ? '次へ' : '結果を見る'}
          <ChevronRight className="w-5 h-5" />
        </button>

        {!isPageComplete && (
          <p className="text-center text-sm text-[#3A405A] opacity-50 mt-3">
            全ての質問に回答してください
          </p>
        )}
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
