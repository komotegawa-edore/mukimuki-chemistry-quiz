'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2, Mic, ChevronLeft, ChevronRight } from 'lucide-react'

interface Question {
  id: number
  question_text: string
  question_audio_url: string | null
  explanation: string | null
}

interface ScriptLine {
  japanese: string
  english: string
}

function parseScript(explanation: string | null): ScriptLine | null {
  if (!explanation) return null

  // 英文スクリプトを抽出
  const scriptMatch = explanation.match(/📝 英文スクリプト:\n([\s\S]+)$/)
  if (!scriptMatch) return null

  const english = scriptMatch[1].trim()

  // 日本語部分を抽出（英文スクリプト前の部分）
  const japanesePart = explanation.split('📝 英文スクリプト:')[0].trim()

  return {
    japanese: japanesePart,
    english: english,
  }
}

export default function ShadowingPage({
  params,
}: {
  params: { chapterId: string }
}) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(0.85)
  const [showJapanese, setShowJapanese] = useState(true)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentQuestion = questions[currentIndex]
  const script = currentQuestion ? parseScript(currentQuestion.explanation) : null

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questions?chapterId=${params.chapterId}`)
        if (!response.ok) throw new Error('Failed to fetch questions')
        const data = await response.json()
        // 音声があるものだけフィルタ
        const audioQuestions = data.filter((q: Question) => q.question_audio_url)
        setQuestions(audioQuestions)
      } catch (err) {
        console.error('Failed to fetch questions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [params.chapterId])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, currentIndex])

  // 音声の進行に合わせてハイライト（簡易版：時間ベース）
  useEffect(() => {
    if (!isPlaying || !script) {
      setHighlightIndex(-1)
      return
    }

    const words = script.english.split(' ')
    const wordsPerSecond = words.length / (duration || 10)
    const currentWordIndex = Math.floor(currentTime * wordsPerSecond)
    setHighlightIndex(Math.min(currentWordIndex, words.length - 1))
  }, [currentTime, isPlaying, duration, script])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      audioRef.current.playbackRate = playbackRate
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setHighlightIndex(-1)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      setHighlightIndex(-1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsPlaying(false)
      setCurrentTime(0)
      setHighlightIndex(-1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsPlaying(false)
      setCurrentTime(0)
      setHighlightIndex(-1)
    }
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7]">
        <p className="text-[#3A405A]">読み込み中...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7] px-4">
        <div className="text-center">
          <Image
            src="/Roopy.png"
            alt="Roopy"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <p className="text-[#3A405A] mb-4">シャドーイング用の音声がありません</p>
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/quiz/${params.chapterId}/result?score=0&total=0`}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            戻る
          </Link>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-[#3A405A]">シャドーイング</span>
          </div>
          <div className="text-sm text-[#3A405A] opacity-70">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Question Info */}
        <div className="mb-6 text-center">
          <p className="text-sm text-indigo-600 font-medium mb-1">問題 {currentIndex + 1}</p>
          <h1 className="text-lg font-bold text-[#3A405A]">{currentQuestion?.question_text}</h1>
        </div>

        {/* Script Display */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-indigo-100">
          {script ? (
            <>
              {/* English Script with Karaoke Effect */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-[#3A405A] flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                    English Script
                  </h2>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 text-lg leading-relaxed">
                  {script.english.split(' ').map((word, index) => (
                    <span
                      key={index}
                      className={`inline-block mr-1 transition-all duration-150 ${
                        index <= highlightIndex
                          ? 'text-indigo-600 font-semibold scale-105'
                          : 'text-[#3A405A] opacity-60'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Japanese Translation Toggle */}
              <div>
                <button
                  onClick={() => setShowJapanese(!showJapanese)}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-3"
                >
                  {showJapanese ? '日本語を隠す' : '日本語を表示'}
                </button>
                {showJapanese && (
                  <div className="bg-gray-50 rounded-xl p-4 text-[#3A405A] opacity-80">
                    {script.japanese}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-[#3A405A] opacity-70">
              スクリプトがありません
            </p>
          )}
        </div>

        {/* Audio Player */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100">
          {currentQuestion?.question_audio_url && (
            <audio
              ref={audioRef}
              src={currentQuestion.question_audio_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
            />
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-[#3A405A] opacity-70 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full transition-colors ${
                currentIndex === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={handleRestart}
              className="p-3 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className={`p-3 rounded-full transition-colors ${
                currentIndex === questions.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Playback Rate */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-[#3A405A] opacity-70">再生速度:</span>
            {[0.5, 0.7, 0.85, 1.0].map((rate) => (
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

        {/* Tips */}
        <div className="mt-6 bg-indigo-50 rounded-xl p-4">
          <h3 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            シャドーイングのコツ
          </h3>
          <ul className="text-sm text-[#3A405A] opacity-80 space-y-1">
            <li>・音声を聞きながら、少し遅れて真似して発音する</li>
            <li>・最初はゆっくり（0.7x）から始めて徐々に速く</li>
            <li>・完璧を目指さず、リズムと抑揚を意識する</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentIndex === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            前の問題
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentIndex === questions.length - 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            次の問題
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  )
}
