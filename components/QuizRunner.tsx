'use client'

import { useState } from 'react'
import { Question, Answer } from '@/lib/types/database'

interface QuizRunnerProps {
  questions: Question[]
  chapterId: number
  chapterTitle: string
  onComplete: (score: number, total: number, answers: Record<number, Answer>) => void
}

export default function QuizRunner({
  questions,
  chapterId,
  chapterTitle,
  onComplete,
}: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  const handleAnswerSelect = (answer: Answer) => {
    setSelectedAnswer(answer)
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
          <p className="text-gray-600">この章にはまだ問題がありません。</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">クイズ完了！</h2>
          <p className="text-gray-600 mb-6">結果を保存しています...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{chapterTitle}</h1>
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            問題 {currentIndex + 1} / {questions.length}
          </span>
          <span>章ID: {chapterId}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question_text}</h2>

          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as Answer[]).map((choice) => (
              <button
                key={choice}
                onClick={() => handleAnswerSelect(choice)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswer === choice
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-semibold mr-2">{choice}.</span>
                {getChoiceLabel(choice)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`px-6 py-3 rounded-lg font-semibold ${
              selectedAnswer
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? '完了' : '次へ'}
          </button>
        </div>
      </div>
    </div>
  )
}
