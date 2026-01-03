'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  Play,
  Pause,
  Volume2,
  Home,
  CheckCircle,
  XCircle,
  ChevronRight,
  Headphones,
  RotateCcw,
} from 'lucide-react'

// セッションID取得（localStorageに保存）
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('korean_session_id')
  if (!sessionId) {
    sessionId = `ks_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    localStorage.setItem('korean_session_id', sessionId)
  }
  return sessionId
}

interface ListeningSet {
  id: string
  set_number: number
  korean_script: string
  japanese_translation: string
  romanization: string | null
  audio_url: string | null
  category: string
}

interface Question {
  id: string
  set_id: string
  question_number: number
  question_text: string
  choice_a: string
  choice_b: string
  choice_c: string
  choice_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string | null
}

type Answer = 'A' | 'B' | 'C' | 'D'

// サウンドエフェクト
function useSoundEffects() {
  const playSound = useCallback((src: string) => {
    const audio = new Audio(src)
    audio.play().catch(() => {})
  }, [])

  const playSelectSound = useCallback(() => {
    playSound('/korean/sounds/select.mp3')
  }, [playSound])

  const playCorrectSound = useCallback(() => {
    playSound('/korean/sounds/correct.mp3')
  }, [playSound])

  const playWrongSound = useCallback(() => {
    playSound('/korean/sounds/wrong.mp3')
  }, [playSound])

  const playCompleteSound = useCallback(() => {
    playSound('/korean/sounds/complete.mp3')
  }, [playSound])

  return { playSelectSound, playCorrectSound, playWrongSound, playCompleteSound }
}

function SetSelector({ onSelect }: { onSelect: (setId: string) => void }) {
  const router = useRouter()
  const [sets, setSets] = useState<{ id: string; set_number: number; category: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSets() {
      try {
        const res = await fetch('/api/korean/listening')
        const data = await res.json()
        setSets(data.sets || [])
      } catch (error) {
        console.error('Failed to fetch sets:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSets()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-pink-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <nav className="bg-white border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/korean')} className="flex items-center gap-2 text-pink-600">
            <Home className="w-5 h-5" />
            <span className="font-medium">ホーム</span>
          </button>
          <div className="flex items-center gap-2">
            <Image src="/korean/Roopy-Korean-icon.png" alt="Roopy Korean" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-gray-800">リスニング</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Headphones className="w-6 h-6 text-pink-500" />
          セットを選ぶ
        </h1>

        {sets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-md">
            <Headphones className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">リスニング問題はまだありません</p>
            <p className="text-sm text-gray-400 mt-2">近日公開予定</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sets.map((set) => (
              <button
                key={set.id}
                onClick={() => onSelect(set.id)}
                className="w-full bg-white rounded-xl p-4 shadow-md border border-pink-100 hover:border-pink-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center shrink-0">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">{set.category}</p>
                    <p className="text-xs text-gray-500">3問</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function QuizRunner({
  set,
  questions,
  onComplete,
  onHome,
}: {
  set: ListeningSet
  questions: Question[]
  onComplete: (score: number, answers: { questionId: string; correct: boolean; selected: string }[]) => void
  onHome: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { playSelectSound, playCorrectSound, playWrongSound, playCompleteSound } = useSoundEffects()

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const replay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleAnswerSelect = (answer: Answer) => {
    if (!showAnswer) {
      playSelectSound()
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    setShowAnswer(true)

    if (selectedAnswer === currentQuestion.correct_answer) {
      playCorrectSound()
    } else {
      playWrongSound()
    }
  }

  const handleNext = () => {
    if (!selectedAnswer) return

    const newAnswers = { ...answers, [currentQuestion.id]: selectedAnswer }
    setAnswers(newAnswers)

    if (isLastQuestion) {
      const score = questions.reduce((acc, q) => {
        return acc + (newAnswers[q.id] === q.correct_answer ? 1 : 0)
      }, 0)
      playCompleteSound()

      // 回答データを整形
      const answersData = questions.map(q => ({
        questionId: q.id,
        correct: newAnswers[q.id] === q.correct_answer,
        selected: newAnswers[q.id],
      }))
      onComplete(score, answersData)
    } else {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowAnswer(false)
    }
  }

  const getChoiceLabel = (choice: Answer): string => {
    switch (choice) {
      case 'A': return currentQuestion.choice_a
      case 'B': return currentQuestion.choice_b
      case 'C': return currentQuestion.choice_c
      case 'D': return currentQuestion.choice_d
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <nav className="bg-white border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onHome} className="flex items-center gap-2 text-pink-600">
            <Home className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{set.category}</span>
          <span className="text-sm text-gray-500">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-1 bg-pink-100">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Audio Player */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-pink-100">
          {set.audio_url && (
            <audio
              ref={audioRef}
              src={set.audio_url}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={(e) => {
                e.currentTarget.playbackRate = playbackRate
              }}
            />
          )}

          <div className="flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-pink-500" />
            <span className="font-medium text-gray-700">音声を聞いて答えてください</span>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={replay}
              className="p-3 text-gray-600 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            {/* バランス用のスペーサー */}
            <div className="w-11 h-11" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">速度:</span>
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  playbackRate === rate
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-100 text-gray-700 hover:bg-pink-200'
                }`}
              >
                {rate === 1.0 ? '標準' : `${rate}x`}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-pink-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {currentQuestion.question_text}
          </h2>

          {/* Choices */}
          <div className="space-y-3 mb-6">
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
                borderColor = 'border-pink-500'
                bgColor = 'bg-pink-50'
              }

              return (
                <button
                  key={choice}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${borderColor} ${bgColor} ${
                    !showAnswer && !isSelected ? 'hover:border-pink-300 hover:bg-pink-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold mr-2">{choice}.</span>
                      {getChoiceLabel(choice)}
                    </div>
                    {showAnswer && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {showAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showAnswer && (
            <div className="mb-6 p-4 bg-pink-50 border-l-4 border-pink-500 rounded-r-lg">
              <h3 className="font-semibold text-gray-800 mb-2">スクリプト</h3>
              <p className="text-gray-700 whitespace-pre-line text-sm mb-2">{set.korean_script}</p>
              <p className="text-gray-600 text-sm">{set.japanese_translation}</p>
              {currentQuestion.explanation && (
                <p className="text-gray-500 text-sm mt-2 pt-2 border-t border-pink-200">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end">
            {!showAnswer ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`px-8 py-3 rounded-full font-semibold transition-colors ${
                  selectedAnswer
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full font-semibold bg-pink-500 text-white hover:bg-pink-600 transition-colors flex items-center gap-2"
              >
                {isLastQuestion ? '結果を見る' : '次へ'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ResultScreen({
  set,
  score,
  total,
  onRetry,
  onHome,
  onSelectOther,
}: {
  set: ListeningSet
  score: number
  total: number
  onRetry: () => void
  onHome: () => void
  onSelectOther: () => void
}) {
  const percentage = Math.round((score / total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Image
          src="/korean/Roopy-Korean-icon.png"
          alt="Roopy"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{set.category}</h1>
        <p className="text-gray-500 mb-4">完了!</p>

        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-6 mb-6">
          <div className="text-5xl font-bold text-pink-600 mb-2">{score} / {total}</div>
          <div className="text-lg text-gray-700">正答率 {percentage}%</div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors"
          >
            もう一度挑戦
          </button>
          <button
            onClick={onSelectOther}
            className="w-full bg-white border-2 border-pink-300 text-pink-600 py-3 rounded-xl font-bold hover:bg-pink-50 transition-colors"
          >
            別のセットを選ぶ
          </button>
          <button
            onClick={onHome}
            className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  )
}

function KoreanListeningContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSetId = searchParams.get('set')

  const [selectedSetId, setSelectedSetId] = useState<string | null>(initialSetId)
  const [set, setSet] = useState<ListeningSet | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    if (selectedSetId) {
      setLoading(true)
      fetch(`/api/korean/listening?setId=${selectedSetId}`)
        .then((res) => res.json())
        .then((data) => {
          setSet(data.set)
          setQuestions(data.questions || [])
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [selectedSetId])

  const handleComplete = async (finalScore: number, answers: { questionId: string; correct: boolean; selected: string }[]) => {
    setScore(finalScore)

    // 結果を保存
    if (set) {
      try {
        await fetch('/api/korean/listening/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: getSessionId(),
            setId: set.id,
            category: set.category,
            score: finalScore,
            total: questions.length,
            answers,
          }),
        })
      } catch (err) {
        console.error('Failed to save listening result:', err)
      }
    }
  }

  const handleRetry = () => {
    setScore(null)
  }

  const handleHome = () => {
    router.push('/korean')
  }

  const handleSelectOther = () => {
    setSelectedSetId(null)
    setSet(null)
    setQuestions([])
    setScore(null)
  }

  if (!selectedSetId) {
    return <SetSelector onSelect={setSelectedSetId} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-pink-500">Loading...</div>
      </div>
    )
  }

  if (score !== null && set) {
    return (
      <ResultScreen
        set={set}
        score={score}
        total={questions.length}
        onRetry={handleRetry}
        onHome={handleHome}
        onSelectOther={handleSelectOther}
      />
    )
  }

  if (set && questions.length > 0) {
    return (
      <QuizRunner
        set={set}
        questions={questions}
        onComplete={handleComplete}
        onHome={handleHome}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">セットが見つかりません</p>
        <button
          onClick={() => setSelectedSetId(null)}
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          セット選択に戻る
        </button>
      </div>
    </div>
  )
}

export default function KoreanListeningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
          <div className="animate-pulse text-pink-500">Loading...</div>
        </div>
      }
    >
      <KoreanListeningContent />
    </Suspense>
  )
}
