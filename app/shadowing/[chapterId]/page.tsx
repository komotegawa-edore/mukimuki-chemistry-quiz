'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Pause, RotateCcw, Volume2, Mic, ChevronLeft } from 'lucide-react'

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

interface AudioPlayerProps {
  question: Question
  index: number
  playbackRate: number
  isActive: boolean
  onPlay: (index: number) => void
  highlightIndex: number
}

function AudioPlayer({ question, index, playbackRate, isActive, onPlay, highlightIndex }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [localHighlight, setLocalHighlight] = useState(-1)
  const audioRef = useRef<HTMLAudioElement>(null)

  const script = parseScript(question.explanation)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  useEffect(() => {
    if (!isPlaying || !script) {
      setLocalHighlight(-1)
      return
    }

    const words = script.english.split(' ')
    const wordsPerSecond = words.length / (duration || 10)
    const currentWordIndex = Math.floor(currentTime * wordsPerSecond)
    setLocalHighlight(Math.min(currentWordIndex, words.length - 1))
  }, [currentTime, isPlaying, duration, script])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        onPlay(index)
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      setLocalHighlight(-1)
      audioRef.current.play()
      setIsPlaying(true)
      onPlay(index)
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
    setLocalHighlight(-1)
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border-2 border-indigo-100">
      {/* Question Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
          Q{index + 1}
        </span>
        <span className="text-[#3A405A] font-medium text-sm">{question.question_text}</span>
      </div>

      {/* Audio Element */}
      {question.question_audio_url && (
        <audio
          ref={audioRef}
          src={question.question_audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Script Display */}
      {script && (
        <div className="mb-4">
          {/* English with Karaoke */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-3">
            <div className="text-base leading-relaxed">
              {script.english.split(' ').map((word, wordIndex) => (
                <span
                  key={wordIndex}
                  className={`inline-block mr-1 transition-all duration-100 ${
                    wordIndex <= localHighlight
                      ? 'text-indigo-600 font-semibold'
                      : 'text-[#3A405A] opacity-50'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Japanese */}
          <div className="text-sm text-[#3A405A] opacity-70 px-2">
            {script.japanese}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Restart */}
        <button
          onClick={handleRestart}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          title="最初から"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Progress */}
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value)
              if (audioRef.current) {
                audioRef.current.currentTime = time
                setCurrentTime(time)
              }
            }}
            className="w-full h-1.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Time */}
        <span className="text-xs text-[#3A405A] opacity-70 w-16 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default function ShadowingPage({
  params,
}: {
  params: { chapterId: string }
}) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(0.85)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showJapanese, setShowJapanese] = useState(true)

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
            href="/"
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            戻る
          </Link>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-[#3A405A]">シャドーイング</span>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Playback Rate Control */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-[#3A405A]">再生速度</span>
            </div>
            <div className="flex items-center gap-2">
              {[0.5, 0.7, 0.85, 1.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
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
        </div>

        {/* All Questions */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <AudioPlayer
              key={question.id}
              question={question}
              index={index}
              playbackRate={playbackRate}
              isActive={activeIndex === index}
              onPlay={setActiveIndex}
              highlightIndex={-1}
            />
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-indigo-50 rounded-xl p-4">
          <h3 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            シャドーイングのコツ
          </h3>
          <ul className="text-sm text-[#3A405A] opacity-80 space-y-1">
            <li>・音声を聞きながら、少し遅れて真似して発音する</li>
            <li>・最初はゆっくり（0.5x）から始めて徐々に速く</li>
            <li>・完璧を目指さず、リズムと抑揚を意識する</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
