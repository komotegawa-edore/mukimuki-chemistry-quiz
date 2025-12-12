'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  Headphones,
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

type SubtitleMode = 'english' | 'japanese' | 'both' | 'none'

export default function NewsPlayerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const date = params.date as string
  const initialIndex = parseInt(searchParams.get('index') || '0', 10)

  const [news, setNews] = useState<DailyNews[]>([])
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(0.85)
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('english')
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)

  const audioRef = useRef<HTMLAudioElement>(null)

  const currentNews = news[currentIndex]

  // ニュースを取得
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`/api/english/news?date=${date}`)
        const data = await res.json()
        setNews(data.news || [])
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [date])

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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < news.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsPlaying(false)
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading...</div>
      </div>
    )
  }

  if (!currentNews) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/english/news"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
            ニュース一覧へ
          </Link>
          <div className="bg-white rounded-2xl p-12 text-center">
            <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              ニュースが見つかりません
            </h2>
            <p className="text-gray-600">
              この日のニュースはまだ配信されていません
            </p>
          </div>
        </div>
      </div>
    )
  }

  const category = CATEGORY_LABELS[currentNews.category] || {
    label: currentNews.category,
    color: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <nav className="bg-white border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/english/news" className="flex items-center gap-2 text-blue-600">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">一覧へ</span>
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-gray-800">Roopy English</span>
          </div>
          <div className="text-sm text-gray-500">
            {currentIndex + 1} / {news.length}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Category & Title */}
        <div className="mb-6">
          <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-3 ${category.color}`}>
            {category.label}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
            {currentNews.original_title}
          </h1>
          {currentNews.source && (
            <a
              href={currentNews.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline mt-2"
            >
              元記事を読む →
            </a>
          )}
        </div>

        {/* Audio Player */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
          {currentNews.audio_url && (
            <audio
              ref={audioRef}
              src={currentNews.audio_url}
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
              className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === news.length - 1}
              className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">速度:</span>
            {[0.7, 0.85, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  playbackRate === rate
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-gray-700 hover:bg-blue-200'
                }`}
              >
                {rate === 1.0 ? '標準' : `${rate}x`}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-gray-600 font-medium">字幕:</span>
          {[
            { mode: 'english' as const, label: '英語' },
            { mode: 'japanese' as const, label: '日本語' },
            { mode: 'both' as const, label: '両方' },
            { mode: 'none' as const, label: 'なし' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setSubtitleMode(mode)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                subtitleMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Script Display */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          {subtitleMode !== 'none' && (
            <div className="space-y-6">
              {(subtitleMode === 'english' || subtitleMode === 'both') && (
                <div>
                  <h3 className="text-sm font-medium text-blue-600 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    English Script
                  </h3>
                  <div className="space-y-4">
                    {renderParagraphs(
                      currentNews.english_script,
                      "text-gray-800 leading-[1.9] text-[17px] tracking-wide"
                    )}
                  </div>
                </div>
              )}

              {subtitleMode === 'both' && (
                <hr className="border-gray-200 my-6" />
              )}

              {(subtitleMode === 'japanese' || subtitleMode === 'both') && (
                <div>
                  <h3 className="text-sm font-medium text-green-600 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    日本語訳
                  </h3>
                  <div className="space-y-4">
                    {renderParagraphs(
                      currentNews.japanese_translation,
                      "text-gray-700 leading-[1.9] text-[15px]"
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {subtitleMode === 'none' && (
            <div className="text-center py-8 text-gray-400">
              <EyeOff className="w-12 h-12 mx-auto mb-2" />
              <p>字幕を非表示にしています</p>
            </div>
          )}

          {/* 出典・免責事項 */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              ※このスクリプトは報道内容を基に作成した英語学習教材です。事実関係の詳細は元記事をご確認ください。
              {currentNews.source && (
                <>
                  {' '}
                  <a
                    href={currentNews.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    元記事はこちら
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Vocabulary */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowVocabulary(!showVocabulary)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="font-bold text-gray-800">
              重要単語 ({currentNews.key_vocabulary.length}語)
            </span>
            <ChevronRight
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showVocabulary ? 'rotate-90' : ''
              }`}
            />
          </button>

          {showVocabulary && (
            <div className="px-4 pb-4">
              <div className="grid gap-2">
                {currentNews.key_vocabulary.map((vocab, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg"
                  >
                    <span className="font-bold text-blue-700">{vocab.word}</span>
                    <span className="text-gray-600">{vocab.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            前のニュース
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === news.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
          >
            次のニュース
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  )
}
