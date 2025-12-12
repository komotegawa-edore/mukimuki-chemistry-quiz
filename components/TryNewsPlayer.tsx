'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Play,
  Pause,
  Volume2,
  BookOpen,
  ChevronRight,
  Headphones,
  ArrowRight,
} from 'lucide-react'

interface DailyNews {
  id: string
  news_date: string
  category: string
  original_title: string
  english_script: string
  japanese_translation: string
  key_vocabulary: { word: string; meaning: string }[]
  level: string
  audio_url: string | null
  source: string | null
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  technology: { label: 'テクノロジー', color: 'bg-blue-100 text-blue-700' },
  business: { label: 'ビジネス', color: 'bg-green-100 text-green-700' },
  sports: { label: 'スポーツ', color: 'bg-orange-100 text-orange-700' },
  entertainment: { label: 'エンタメ', color: 'bg-pink-100 text-pink-700' },
  world: { label: '国際', color: 'bg-purple-100 text-purple-700' },
  science: { label: '科学', color: 'bg-cyan-100 text-cyan-700' },
  health: { label: '健康', color: 'bg-red-100 text-red-700' },
  politics: { label: '政治', color: 'bg-slate-100 text-slate-700' },
  economy: { label: '経済', color: 'bg-emerald-100 text-emerald-700' },
  automotive: { label: '自動車', color: 'bg-amber-100 text-amber-700' },
}

type SubtitleMode = 'english' | 'japanese' | 'both'

// テキストを段落に分割してレンダリング
function renderParagraphs(text: string, className: string) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
  if (paragraphs.length <= 1) {
    // 段落分けがない場合は文単位で適度に区切る
    const sentences = text.split(/(?<=[.!?])\s+/)
    const chunks: string[] = []
    let current = ''
    for (const sentence of sentences) {
      if (current.length + sentence.length > 200 && current) {
        chunks.push(current.trim())
        current = sentence
      } else {
        current += (current ? ' ' : '') + sentence
      }
    }
    if (current) chunks.push(current.trim())
    return chunks.map((chunk, i) => (
      <p key={i} className={className}>{chunk}</p>
    ))
  }
  return paragraphs.map((p, i) => (
    <p key={i} className={className}>{p.trim()}</p>
  ))
}

export default function TryNewsPlayer() {
  const [news, setNews] = useState<DailyNews | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(0.85)
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('both')
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)

  const audioRef = useRef<HTMLAudioElement>(null)

  // 今日のニュースの1本目を取得
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/english/news')
        const data = await res.json()
        if (data.news && data.news.length > 0) {
          setNews(data.news[0])
        }
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  // 再生速度の変更
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-cyan-100 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          今日のニュースを準備中...
        </h3>
        <p className="text-gray-600">
          毎朝7時に新しいニュースが配信されます
        </p>
      </div>
    )
  }

  const category = CATEGORY_LABELS[news.category] || {
    label: news.category,
    color: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium opacity-90">今日のニュース（お試し）</span>
          <span className={`text-xs px-2 py-1 rounded-full bg-white/20`}>
            {category.label}
          </span>
        </div>
        <h3 className="font-bold text-lg leading-tight">
          {news.original_title}
        </h3>
      </div>

      <div className="p-6">
        {/* Audio Player */}
        {news.audio_url && (
          <audio
            ref={audioRef}
            src={news.audio_url}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = playbackRate
            }}
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
            className="w-full h-2 bg-cyan-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-600 [&::-webkit-slider-thumb]:rounded-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={togglePlay}
            className="w-14 h-14 bg-cyan-600 text-white rounded-full flex items-center justify-center hover:bg-cyan-700 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
        </div>

        {/* Playback Speed */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">速度:</span>
          {[0.7, 0.85, 1.0].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                playbackRate === rate
                  ? 'bg-cyan-600 text-white'
                  : 'bg-cyan-100 text-gray-700 hover:bg-cyan-200'
              }`}
            >
              {rate === 1.0 ? '標準' : `${rate}x`}
            </button>
          ))}
        </div>

        {/* Subtitle Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="text-sm text-gray-600">字幕:</span>
          {[
            { mode: 'english' as const, label: '英語' },
            { mode: 'japanese' as const, label: '日本語' },
            { mode: 'both' as const, label: '両方' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setSubtitleMode(mode)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                subtitleMode === mode
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-cyan-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Script Display */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-80 overflow-y-auto">
          <div className="space-y-4">
            {(subtitleMode === 'english' || subtitleMode === 'both') && (
              <div>
                <h4 className="text-xs font-medium text-cyan-600 mb-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  English
                </h4>
                <div className="space-y-3">
                  {renderParagraphs(
                    news.english_script,
                    "text-gray-800 text-sm leading-[1.8] tracking-wide"
                  )}
                </div>
              </div>
            )}

            {subtitleMode === 'both' && <hr className="border-gray-200 my-3" />}

            {(subtitleMode === 'japanese' || subtitleMode === 'both') && (
              <div>
                <h4 className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  日本語
                </h4>
                <div className="space-y-3">
                  {renderParagraphs(
                    news.japanese_translation,
                    "text-gray-700 text-sm leading-[1.8]"
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vocabulary Toggle */}
        <button
          onClick={() => setShowVocabulary(!showVocabulary)}
          className="w-full p-3 flex items-center justify-between text-left bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors mb-4"
        >
          <span className="font-medium text-gray-800 text-sm">
            重要単語 ({news.key_vocabulary.length}語)
          </span>
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform ${
              showVocabulary ? 'rotate-90' : ''
            }`}
          />
        </button>

        {showVocabulary && (
          <div className="grid gap-2 mb-4">
            {news.key_vocabulary.slice(0, 5).map((vocab, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 bg-cyan-50 rounded-lg text-sm"
              >
                <span className="font-bold text-cyan-700">{vocab.word}</span>
                <span className="text-gray-600">{vocab.meaning}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href="/english/news"
          className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-center rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          <span className="flex items-center justify-center gap-2">
            すべてのニュースを見る
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  )
}
