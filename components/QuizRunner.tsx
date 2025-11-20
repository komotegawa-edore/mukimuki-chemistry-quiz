'use client'

import { useState } from 'react'
import { Question, Answer } from '@/lib/types/database'

interface QuizRunnerProps {
  questions: Question[]
  chapterId: number
  chapterTitle: string
  onComplete: (score: number, total: number, answers: Record<number, Answer>) => void
  onQuit?: () => void
}

export default function QuizRunner({
  questions,
  chapterId,
  chapterTitle,
  onComplete,
  onQuit,
}: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  const handleAnswerSelect = (answer: Answer) => {
    if (!showAnswer) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    setShowAnswer(true)
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
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-black">この章にはまだ問題がありません。</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-black">クイズ完了！</h2>
          <p className="text-black mb-6">結果を保存しています...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-black">{chapterTitle}</h1>
          {onQuit && (
            <button
              onClick={handleQuit}
              className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 whitespace-nowrap"
            >
              終了
            </button>
          )}
        </div>
        <div className="flex justify-between text-sm text-black">
          <span>
            問題 {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-black">{currentQuestion.question_text}</h2>

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
                borderColor = 'border-blue-500'
                bgColor = 'bg-blue-50'
              }

              return (
                <button
                  key={choice}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors text-black ${borderColor} ${bgColor} ${
                    !showAnswer && !isSelected ? 'hover:border-gray-300' : ''
                  } ${showAnswer ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold mr-2">{choice}.</span>
                      {getChoiceLabel(choice)}
                    </div>
                    {showAnswer && isCorrect && (
                      <span className="text-green-600 font-semibold">✓ 正解</span>
                    )}
                    {showAnswer && isSelected && !isCorrect && (
                      <span className="text-red-600 font-semibold">✗ 不正解</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {showAnswer && currentQuestion.explanation && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">解説</h3>
            <p className="text-blue-800">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          {!showAnswer ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className={`px-6 py-3 rounded-lg font-semibold ${
                selectedAnswer
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              回答する
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLastQuestion ? '完了' : '次へ'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
