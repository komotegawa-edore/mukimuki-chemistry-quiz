'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Volume2, Play, CheckCircle, XCircle, ArrowRight, Headphones } from 'lucide-react'

type Answer = 'A' | 'B' | 'C' | 'D'

interface Question {
  id: number
  question_text: string
  choice_a: string
  choice_b: string
  choice_c: string
  choice_d: string
  correct_answer: Answer
  question_audio_url: string | null
  explanation: string | null
}

// お試し用のサンプル問題（セット1の3問）
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question_text: 'この電車は何時に出発しますか？',
    choice_a: '9:15',
    choice_b: '9:45',
    choice_c: '10:15',
    choice_d: '10:45',
    correct_answer: 'B',
    question_audio_url: '/audio/listening/L001.mp3',
    explanation: '乗客の皆様にお知らせします。東京行きの急行電車は3番ホームから9時45分に出発します。ご乗車前にお忘れ物がないかご確認ください。\n\n📝 英文スクリプト:\nAttention passengers. The express train to Tokyo will depart from platform 3 at 9:45. Please make sure you have all your belongings before boarding.',
  },
  {
    id: 2,
    question_text: 'バスの運賃はいくらですか？',
    choice_a: '120円',
    choice_b: '200円',
    choice_c: '220円',
    choice_d: '250円',
    correct_answer: 'C',
    question_audio_url: '/audio/listening/L002.mp3',
    explanation: '渋谷行きの次のバスは約12分後に到着します。運賃は220円です。おつりのないようご用意ください。\n\n📝 英文スクリプト:\nThe next bus to Shibuya will arrive in approximately 12 minutes. The fare is 220 yen. Please have exact change ready.',
  },
  {
    id: 3,
    question_text: '校門に何時までに集合する必要がありますか？',
    choice_a: '8:00',
    choice_b: '8:15',
    choice_c: '8:30',
    choice_d: '8:45',
    correct_answer: 'B',
    question_audio_url: '/audio/listening/L003.mp3',
    explanation: '皆さん、おはようございます。本日の遠足は8時30分に始まります。遅くとも8時15分までに校門に集合してください。\n\n📝 英文スクリプト:\nGood morning everyone. Today\'s field trip will begin at 8:30. Please gather at the school gate by 8:15 at the latest.',
  },
]

export default function TryListeningPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(0.85)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentQuestion = SAMPLE_QUESTIONS[currentIndex]
  const isLastQuestion = currentIndex === SAMPLE_QUESTIONS.length - 1

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, currentIndex])

  const handleAnswerSelect = (answer: Answer) => {
    if (!showAnswer) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    setShowAnswer(true)

    // 正解時に効果音を再生
    if (selectedAnswer === currentQuestion.correct_answer) {
      const correctSound = new Audio('/正解6.mp3')
      correctSound.play().catch(() => {
        // 自動再生がブロックされた場合は無視
      })
    }
  }

  const handleNext = () => {
    if (!selectedAnswer) return

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedAnswer,
    }
    setAnswers(newAnswers)

    if (isLastQuestion) {
      setIsCompleted(true)
    } else {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowAnswer(false)
    }
  }

  const getChoiceLabel = (choice: Answer): string => {
    switch (choice) {
      case 'A':
        return currentQuestion.choice_a
      case 'B':
        return currentQuestion.choice_b
      case 'C':
        return currentQuestion.choice_c
      case 'D':
        return currentQuestion.choice_d
    }
  }

  const calculateScore = () => {
    return SAMPLE_QUESTIONS.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correct_answer ? 1 : 0)
    }, 0)
  }

  // 完了画面
  if (isCompleted) {
    const score = calculateScore()
    const percentage = Math.round((score / SAMPLE_QUESTIONS.length) * 100)

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        {/* Header */}
        <nav className="bg-white border-b border-indigo-100 sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
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
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-indigo-100">
            <div className="mb-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-[#3A405A] mb-2">お試し完了！</h1>
              <p className="text-[#3A405A] opacity-70">リスニングお試しセットを完了しました</p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6 mb-8">
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                {score} / {SAMPLE_QUESTIONS.length}
              </div>
              <div className="text-lg text-[#3A405A]">正答率 {percentage}%</div>
            </div>

            {/* 回答結果 */}
            <div className="mb-8 text-left">
              <h2 className="font-bold text-[#3A405A] mb-4">回答結果</h2>
              <div className="space-y-3">
                {SAMPLE_QUESTIONS.map((q, index) => {
                  const userAnswer = answers[q.id]
                  const isCorrect = userAnswer === q.correct_answer
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-[#3A405A] text-sm">
                            Q{index + 1}. {q.question_text}
                          </p>
                          <p className="text-sm mt-1">
                            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              あなたの回答: {userAnswer}
                            </span>
                            {!isCorrect && (
                              <span className="text-green-700 ml-2">
                                正解: {q.correct_answer}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white text-lg font-bold py-4 px-8 rounded-full hover:bg-indigo-700 transition-colors"
              >
                無料登録してもっと練習する
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-[#3A405A] opacity-60">
                登録すると90問すべてにアクセスできます
              </p>
              <Link
                href="/lp/listening"
                className="block text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                ← リスニングLPに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <nav className="bg-white border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
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
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
            お試しモード
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-bold text-[#3A405A]">リスニングお試し</h1>
            </div>
            <span className="text-sm text-[#3A405A] opacity-70">
              問題 {currentIndex + 1} / {SAMPLE_QUESTIONS.length}
            </span>
          </div>
          <div className="w-full bg-indigo-100 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-indigo-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#3A405A] mb-4">
              {currentQuestion.question_text}
            </h2>

            {/* Audio Player */}
            {currentQuestion.question_audio_url && (
              <div className="mb-6 space-y-3">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Play className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-[#3A405A]">音声を聞いて答えてください</span>
                  </div>
                  <audio
                    ref={audioRef}
                    src={currentQuestion.question_audio_url}
                    controls
                    className="w-full"
                    onLoadedMetadata={(e) => {
                      (e.target as HTMLAudioElement).playbackRate = playbackRate
                    }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#3A405A] opacity-70" />
                  <span className="text-sm text-[#3A405A] opacity-70">再生速度:</span>
                  {[0.7, 0.85, 1.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        playbackRate === rate
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-100 text-[#3A405A] hover:bg-indigo-200'
                      }`}
                    >
                      {rate === 1.0 ? '標準' : `${rate}x`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Choices */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as Answer[]).map((choice) => {
                const isCorrect = choice === currentQuestion.correct_answer
                const isSelected = selectedAnswer === choice
                let borderColor = 'border-gray-200'
                let bgColor = ''

                if (showAnswer) {
                  if (isCorrect) {
                    borderColor = 'border-green-500'
                    bgColor = 'bg-green-50'
                  } else if (isSelected) {
                    borderColor = 'border-red-500'
                    bgColor = 'bg-red-50'
                  }
                } else if (isSelected) {
                  borderColor = 'border-indigo-500'
                  bgColor = 'bg-indigo-50'
                }

                return (
                  <button
                    key={choice}
                    onClick={() => handleAnswerSelect(choice)}
                    disabled={showAnswer}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors text-[#3A405A] ${borderColor} ${bgColor} ${
                      !showAnswer && !isSelected ? 'hover:border-indigo-300 hover:bg-indigo-50' : ''
                    } ${showAnswer ? 'cursor-default' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold mr-2">{choice}.</span>
                        {getChoiceLabel(choice)}
                      </div>
                      {showAnswer && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {showAnswer && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Explanation */}
          {showAnswer && currentQuestion.explanation && (
            <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
              <h3 className="font-semibold text-[#3A405A] mb-2">解説</h3>
              <p className="text-[#3A405A] opacity-80 whitespace-pre-line text-sm">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end">
            {!showAnswer ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`px-8 py-3 rounded-full font-semibold transition-colors ${
                  selectedAnswer
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                {isLastQuestion ? '結果を見る' : '次へ'}
              </button>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#3A405A] opacity-70 mb-2">
            気に入りましたか？
          </p>
          <Link
            href="/signup"
            className="text-indigo-600 hover:text-indigo-700 font-bold"
          >
            無料登録して全90問にアクセス →
          </Link>
        </div>
      </div>
    </div>
  )
}
