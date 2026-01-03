'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Pause, RotateCcw, Volume2, Check, X, ChevronRight, Home } from 'lucide-react'
import type { KoreanPhrase } from '@/lib/types/database'

interface KoreanQuizRunnerProps {
  phrases: KoreanPhrase[]
  onComplete: (score: number, total: number) => void
  onHome: () => void
  onAnswer?: (phraseId: string, correct: boolean, selectedIndex: number) => void
}

type PlaybackSpeed = 0.8 | 1.0 | 1.2

export default function KoreanQuizRunner({ phrases, onComplete, onHome, onAnswer }: KoreanQuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentPhrase = phrases[currentIndex]
  const isCorrect = selectedAnswer === currentPhrase?.correctIndex

  // 再生/停止
  const togglePlay = () => {
    if (!audioRef.current || !currentPhrase?.audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // リプレイ
  const replay = () => {
    if (!audioRef.current || !currentPhrase?.audioUrl) return
    audioRef.current.currentTime = 0
    audioRef.current.play()
    setIsPlaying(true)
  }

  // 再生速度変更
  const changeSpeed = () => {
    const speeds: PlaybackSpeed[] = [0.8, 1.0, 1.2]
    const currentIdx = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
  }

  // 回答選択
  const handleAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
    setShowResult(true)

    const isAnswerCorrect = index === currentPhrase.correctIndex
    if (isAnswerCorrect) {
      setScore((prev) => prev + 1)
    }

    // 回答をトラッキング
    onAnswer?.(currentPhrase.id, isAnswerCorrect, index)

    // 音声を停止
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  // 次の問題へ
  const nextQuestion = () => {
    if (currentIndex + 1 >= phrases.length) {
      setIsFinished(true)
      onComplete(score + (isCorrect ? 0 : 0), phrases.length) // scoreは既に更新済み
    } else {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  // 音声再生終了時
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setIsPlaying(false)
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

  // 再生速度の反映
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  if (isFinished) {
    const percentage = Math.round((score / phrases.length) * 100)
    const getMessage = () => {
      if (percentage === 100) return '완벽해요! (完璧!)'
      if (percentage >= 80) return '잘했어요! (よくできた!)'
      if (percentage >= 60) return '좋아요! (いいね!)'
      return '화이팅! (ファイト!)'
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Image
            src="/korean/Roopy-Korean-icon.png"
            alt="Roopy"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
          <p className="text-lg text-pink-500 font-bold mb-2">{getMessage()}</p>
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">{percentage}%</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">クイズ完了!</h2>
          <p className="text-gray-600 mb-6">
            {phrases.length}問中 <span className="font-bold text-pink-500">{score}問</span> 正解
          </p>
          <button
            onClick={onHome}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  if (!currentPhrase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <p className="text-gray-500">問題がありません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onHome} className="text-gray-500 hover:text-gray-700">
            <Home className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium text-gray-600">
            {currentIndex + 1} / {phrases.length}
          </div>
          <div className="w-5" /> {/* スペーサー */}
        </div>
        {/* プログレスバー */}
        <div className="h-1 bg-pink-100">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all"
            style={{ width: `${((currentIndex + 1) / phrases.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* 音声プレイヤー */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-1">韓国語を聞いて</p>
            <p className="text-lg font-bold text-gray-700">日本語の意味を選ぼう</p>
          </div>

          {currentPhrase.audioUrl ? (
            <>
              <audio ref={audioRef} src={currentPhrase.audioUrl} preload="auto" />

              <div className="flex items-center justify-center gap-4">
                {/* リプレイ */}
                <button
                  onClick={replay}
                  className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-200 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* 再生/停止 */}
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </button>

                {/* 速度 */}
                <button
                  onClick={changeSpeed}
                  className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-200 transition-colors text-sm font-bold"
                >
                  {playbackSpeed}x
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-20">
              <div className="flex items-center gap-2 text-gray-400">
                <Volume2 className="w-5 h-5" />
                <span className="text-sm">音声なし</span>
              </div>
            </div>
          )}
        </div>

        {/* 選択肢 */}
        <div className="space-y-3">
          {currentPhrase.choices.map((choice, index) => {
            let buttonClass = 'bg-white border-pink-200 hover:border-pink-400'
            let iconElement = null

            if (showResult) {
              if (index === currentPhrase.correctIndex) {
                buttonClass = 'bg-green-50 border-green-400'
                iconElement = <Check className="w-5 h-5 text-green-500" />
              } else if (index === selectedAnswer) {
                buttonClass = 'bg-red-50 border-red-400'
                iconElement = <X className="w-5 h-5 text-red-500" />
              } else {
                buttonClass = 'bg-gray-50 border-gray-200 opacity-50'
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${buttonClass}`}
              >
                <span className="text-gray-800">{choice}</span>
                {iconElement}
              </button>
            )
          })}
        </div>

        {/* 結果表示 */}
        {showResult && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-4">
              {isCorrect ? (
                <p className="text-xl font-bold text-green-500">正解!</p>
              ) : (
                <p className="text-xl font-bold text-red-500">不正解...</p>
              )}
            </div>

            {/* 韓国語テキスト */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-4">
              <p className="text-2xl font-bold text-gray-800 text-center mb-2">
                {currentPhrase.koreanText}
              </p>
              {currentPhrase.romanization && (
                <p className="text-sm text-gray-500 text-center">
                  {currentPhrase.romanization}
                </p>
              )}
            </div>

            {/* 日本語訳 */}
            <p className="text-center text-gray-600">
              {currentPhrase.japaneseMeaning}
            </p>

            {/* 次へボタン */}
            <button
              onClick={nextQuestion}
              className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {currentIndex + 1 >= phrases.length ? '結果を見る' : '次の問題'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
