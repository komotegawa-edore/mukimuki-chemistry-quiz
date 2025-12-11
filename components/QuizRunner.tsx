'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Timer, Volume2 } from 'lucide-react'
import { Question, Answer } from '@/lib/types/database'

interface QuizRunnerProps {
  questions: Question[]
  chapterId: number
  chapterTitle: string
  onComplete: (score: number, total: number, answers: Record<number, Answer>) => void
  onQuit?: () => void
  isMissionMode?: boolean
  timeLimit?: number // 秒数
}

export default function QuizRunner({
  questions,
  chapterId,
  chapterTitle,
  onComplete,
  onQuit,
  isMissionMode = false,
  timeLimit = 300,
}: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [remainingTime, setRemainingTime] = useState(timeLimit)
  const [playbackRate, setPlaybackRate] = useState(0.85) // デフォルト0.85倍速
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  // 音声のプリロード
  useEffect(() => {
    if (currentQuestion.question_audio_url) {
      const audio = new Audio(currentQuestion.question_audio_url)
      audio.preload = 'auto'
    }
  }, [currentQuestion])

  // 再生速度の適用
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, currentIndex])

  // ミッションモード用タイマー
  useEffect(() => {
    if (!isMissionMode || isCompleted) return

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isMissionMode, isCompleted])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answer: Answer) => {
    if (!showAnswer) {
      setSelectedAnswer(answer)
    }
  }

  const getChoiceImageUrl = (choice: Answer): string | null => {
    switch (choice) {
      case 'A':
        return currentQuestion.choice_a_image_url
      case 'B':
        return currentQuestion.choice_b_image_url
      case 'C':
        return currentQuestion.choice_c_image_url
      case 'D':
        return currentQuestion.choice_d_image_url
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
      // クイズ完了
      const score = questions.reduce((acc, q) => {
        return acc + (newAnswers[q.id] === q.correct_answer ? 1 : 0)
      }, 0)
      setIsCompleted(true)
      onComplete(score, questions.length, newAnswers)
    } else {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowAnswer(false)
    }
  }

  const handleQuit = () => {
    if (confirm('クイズを途中で終了しますか？進捗は保存されません。')) {
      if (onQuit) {
        onQuit()
      }
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

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border-2 border-[#E0F7F1]">
          <Image
            src="/Roopy.png"
            alt="Roopy"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <p className="text-[#3A405A]">この章にはまだ問題がありません。</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border-2 border-[#E0F7F1]">
          <Image
            src="/Roopy.png"
            alt="Roopy"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold mb-4 text-[#3A405A]">クイズ完了！</h2>
          <p className="text-[#3A405A] opacity-70 mb-6">結果を保存しています...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-[#3A405A]">{chapterTitle}</h1>
          <div className="flex items-center gap-2">
            {isMissionMode && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                  remainingTime <= 60
                    ? 'bg-red-100 text-red-600'
                    : remainingTime <= 180
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] text-white'
                }`}
              >
                <Timer className="w-5 h-5" />
                <span className="text-lg">{formatTime(remainingTime)}</span>
              </div>
            )}
            {onQuit && (
              <button
                onClick={handleQuit}
                className="px-3 py-2 text-sm text-red-600 border-2 border-red-600 rounded hover:bg-red-50 whitespace-nowrap font-medium transition-colors"
              >
                終了
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-between text-sm text-[#3A405A] opacity-70">
          <span>
            問題 {currentIndex + 1} / {questions.length}
          </span>
          {isMissionMode && remainingTime === 0 && (
            <span className="text-red-600 font-semibold">時間切れ（ボーナスなし）</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 border-2 border-[#E0F7F1]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#3A405A]">{currentQuestion.question_text}</h2>

          {/* 問題文の画像 */}
          {currentQuestion.question_image_url && (
            <div className="mb-6 relative w-full bg-[#F4F9F7] rounded-lg border-2 border-[#E0F7F1] overflow-hidden" style={{ minHeight: '300px' }}>
              <Image
                src={currentQuestion.question_image_url}
                alt="問題の画像"
                fill
                className="object-contain p-4"
              />
            </div>
          )}

          {/* 問題文の音声 */}
          {currentQuestion.question_audio_url && (
            <div className="mb-6 space-y-2">
              <audio
                ref={audioRef}
                src={currentQuestion.question_audio_url}
                controls
                className="w-full"
                onLoadedMetadata={(e) => {
                  (e.target as HTMLAudioElement).playbackRate = playbackRate
                }}
              />
              <div className="flex items-center justify-center gap-2">
                <Volume2 className="w-4 h-4 text-[#3A405A] opacity-70" />
                <span className="text-sm text-[#3A405A] opacity-70">再生速度:</span>
                {[0.7, 0.85, 1.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      playbackRate === rate
                        ? 'bg-[#5DDFC3] text-white'
                        : 'bg-[#E0F7F1] text-[#3A405A] hover:bg-[#d0ede5]'
                    }`}
                  >
                    {rate === 1.0 ? '標準' : `${rate}x`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as Answer[]).map((choice) => {
              const isCorrect = choice === currentQuestion.correct_answer
              const isSelected = selectedAnswer === choice
              let borderColor = 'border-[#E0F7F1]'
              let bgColor = ''

              if (showAnswer) {
                if (isCorrect) {
                  borderColor = 'border-[#5DDFC3]'
                  bgColor = 'bg-[#E0F7F1]'
                } else if (isSelected) {
                  borderColor = 'border-red-500'
                  bgColor = 'bg-red-50'
                }
              } else if (isSelected) {
                borderColor = 'border-[#5DDFC3]'
                bgColor = 'bg-[#F4F9F7]'
              }

              const choiceImageUrl = getChoiceImageUrl(choice)

              return (
                <button
                  key={choice}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors text-[#3A405A] ${borderColor} ${bgColor} ${
                    !showAnswer && !isSelected ? 'hover:border-[#5DDFC3] hover:bg-[#F4F9F7]' : ''
                  } ${showAnswer ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="font-semibold mr-2">{choice}.</span>
                        {getChoiceLabel(choice)}
                      </div>

                      {/* 選択肢の画像 */}
                      {choiceImageUrl && (
                        <div className="relative w-full bg-white rounded border-2 border-[#E0F7F1] overflow-hidden" style={{ height: '150px' }}>
                          <Image
                            src={choiceImageUrl}
                            alt={`選択肢${choice}の画像`}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {showAnswer && isCorrect && (
                        <span className="text-[#5DDFC3] font-semibold">✓ 正解</span>
                      )}
                      {showAnswer && isSelected && !isCorrect && (
                        <span className="text-red-600 font-semibold">✗ 不正解</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {showAnswer && (currentQuestion.explanation || currentQuestion.explanation_image_url) && (
          <div className="mb-6 p-4 bg-[#F4F9F7] border-l-4 border-[#5DDFC3] rounded">
            <h3 className="font-semibold text-[#3A405A] mb-2">解説</h3>
            {currentQuestion.explanation && (
              <p className="text-[#3A405A] opacity-70 mb-3">{currentQuestion.explanation}</p>
            )}
            {currentQuestion.explanation_image_url && (
              <div className="relative w-full bg-white rounded border-2 border-[#E0F7F1] overflow-hidden" style={{ minHeight: '200px' }}>
                <Image
                  src={currentQuestion.explanation_image_url}
                  alt="解説の画像"
                  fill
                  className="object-contain p-2"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          {!showAnswer ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedAnswer
                  ? 'bg-[#5DDFC3] text-white hover:bg-[#4ECFB3]'
                  : 'bg-[#E0F7F1] text-[#3A405A] opacity-50 cursor-not-allowed'
              }`}
            >
              回答する
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-semibold bg-[#5DDFC3] text-white hover:bg-[#4ECFB3] transition-colors"
            >
              {isLastQuestion ? '完了' : '次へ'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
