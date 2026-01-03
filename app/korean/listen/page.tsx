'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Home,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react'
import type { KoreanPhrase } from '@/lib/types/database'

type DisplayMode = 'all' | 'korean' | 'japanese' | 'none'

export default function KoreanListenPage() {
  const router = useRouter()
  const [phrases, setPhrases] = useState<KoreanPhrase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('all')
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentPhrase = phrases[currentIndex]

  // フレーズを取得
  useEffect(() => {
    async function fetchPhrases() {
      try {
        const res = await fetch('/api/korean/phrases?count=20&audioOnly=true')
        const data = await res.json()
        setPhrases(data.phrases || [])
      } catch (error) {
        console.error('Failed to fetch phrases:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPhrases()
  }, [])

  // 再生速度の変更
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, currentIndex])

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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsPlaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-pink-500">Loading...</div>
      </div>
    )
  }

  if (!currentPhrase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-lg mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/korean')}
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-8"
          >
            <Home className="w-5 h-5" />
            ホームへ
          </button>
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              フレーズがありません
            </h2>
            <p className="text-gray-600">
              音声付きのフレーズがまだ登録されていません
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <nav className="bg-white border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/korean')}
            className="flex items-center gap-2 text-pink-600"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">ホーム</span>
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/korean/Roopy-Korean-icon.png"
              alt="Roopy Korean"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-gray-800">リスニング</span>
          </div>
          <div className="text-sm text-gray-500">
            {currentIndex + 1} / {phrases.length}
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Audio Player */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-pink-100">
          {currentPhrase.audioUrl && (
            <audio
              ref={audioRef}
              src={currentPhrase.audioUrl}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={(e) => {
                e.currentTarget.playbackRate = playbackRate
              }}
            />
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 text-gray-600 hover:text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-full hover:bg-pink-50 transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={replay}
              className="p-3 text-gray-600 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === phrases.length - 1}
              className="p-3 text-gray-600 hover:text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-full hover:bg-pink-50 transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">速度:</span>
            {[0.7, 0.85, 1.0, 1.2].map((rate) => (
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

        {/* Display Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-gray-600 font-medium">表示:</span>
          {[
            { mode: 'all' as const, label: '全て' },
            { mode: 'korean' as const, label: '韓国語のみ' },
            { mode: 'japanese' as const, label: '日本語のみ' },
            { mode: 'none' as const, label: '非表示' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setDisplayMode(mode)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                displayMode === mode
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Script Display */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-pink-100">
          {displayMode !== 'none' ? (
            <div className="space-y-6">
              {/* Korean Text */}
              {(displayMode === 'all' || displayMode === 'korean') && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800 leading-relaxed mb-2">
                    {currentPhrase.koreanText}
                  </p>
                  {currentPhrase.romanization && displayMode === 'all' && (
                    <p className="text-sm text-gray-500">
                      {currentPhrase.romanization}
                    </p>
                  )}
                </div>
              )}

              {displayMode === 'all' && <hr className="border-pink-100" />}

              {/* Japanese Translation */}
              {(displayMode === 'all' || displayMode === 'japanese') && (
                <div className="text-center">
                  <p className="text-lg text-gray-700">
                    {currentPhrase.japaneseMeaning}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <EyeOff className="w-12 h-12 mx-auto mb-2" />
              <p>スクリプトを非表示にしています</p>
              <p className="text-sm mt-1">リスニングに集中!</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack className="w-5 h-5" />
            前へ
          </button>

          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {phrases.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === phrases.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            次へ
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  )
}
