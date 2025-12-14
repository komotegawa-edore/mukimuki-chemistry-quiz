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
  Lock,
  Crown,
} from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import SubscriptionModal from '@/components/SubscriptionModal'

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
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('english')
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)

  const audioRef = useRef<HTMLAudioElement>(null)
  const { hasAccess, loading: subscriptionLoading } = useSubscription()

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

  // Media Session API（有料ユーザーのみバックグラウンド再生対応）
  useEffect(() => {
    if (!('mediaSession' in navigator) || !hasAccess || !currentNews) {
      return
    }

    // メタデータを設定
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentNews.original_title,
      artist: 'Roopy English',
      album: `${date} - News ${currentIndex + 1}/${news.length}`,
      artwork: [
        { src: '/english/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/english/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    })

    // アクションハンドラーを設定
    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play()
      setIsPlaying(true)
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause()
      setIsPlaying(false)
    })

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setIsPlaying(false)
      }
    })

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (currentIndex < news.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setIsPlaying(false)
      }
    })

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (audioRef.current && details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime
        setCurrentTime(details.seekTime)
      }
    })

    // クリーンアップ
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null)
        navigator.mediaSession.setActionHandler('pause', null)
        navigator.mediaSession.setActionHandler('previoustrack', null)
        navigator.mediaSession.setActionHandler('nexttrack', null)
        navigator.mediaSession.setActionHandler('seekto', null)
      }
    }
  }, [hasAccess, currentNews, currentIndex, news.length, date])

  // 再生位置をMedia Sessionに同期（有料ユーザーのみ）
  useEffect(() => {
    if (!('mediaSession' in navigator) || !hasAccess) {
      return
    }

    if ('setPositionState' in navigator.mediaSession && duration > 0) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: playbackRate,
        position: currentTime,
      })
    }
  }, [hasAccess, currentTime, duration, playbackRate])

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
              src="/english/favicon-48x48.png"
              alt="Roopy English"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-gray-800">Roopy English</span>
          </div>
          <div className="text-sm text-gray-500">
            {currentIndex + 1} / {news.length}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
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
            { mode: 'english' as const, label: '英語', premium: false },
            { mode: 'japanese' as const, label: '日本語', premium: true },
            { mode: 'both' as const, label: '両方', premium: true },
            { mode: 'none' as const, label: 'なし', premium: false },
          ].map(({ mode, label, premium }) => {
            const isLocked = premium && !hasAccess
            return (
              <button
                key={mode}
                onClick={() => {
                  if (isLocked) return
                  setSubtitleMode(mode)
                }}
                disabled={isLocked}
                className={`px-4 py-2 text-sm rounded-full transition-colors flex items-center gap-1 ${
                  subtitleMode === mode
                    ? 'bg-blue-600 text-white'
                    : isLocked
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {isLocked && <Lock className="w-3 h-3" />}
                {label}
              </button>
            )
          })}
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
            onClick={() => {
              if (!hasAccess) return
              setShowVocabulary(!showVocabulary)
            }}
            className={`w-full p-4 flex items-center justify-between text-left ${
              hasAccess ? 'hover:bg-gray-50' : 'cursor-not-allowed'
            }`}
          >
            <span className="font-bold text-gray-800 flex items-center gap-2">
              重要単語 ({currentNews.key_vocabulary.length}語)
              {!hasAccess && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                  <Crown className="w-3 h-3" />
                  プレミアム
                </span>
              )}
            </span>
            {hasAccess ? (
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showVocabulary ? 'rotate-90' : ''
                }`}
              />
            ) : (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {!hasAccess && (
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  プレミアム会員になると重要単語リストを確認できます
                </p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:shadow-lg transition-shadow"
                >
                  <Crown className="w-4 h-4" />
                  プレミアムに登録
                </button>
              </div>
            </div>
          )}

          {hasAccess && showVocabulary && (
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

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  )
}
