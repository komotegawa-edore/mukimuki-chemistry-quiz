'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface Card {
  id: number
  front_text: string
  back_text: string
  order_num: number
}

interface Deck {
  id: number
  name: string
  description: string | null
  subject: string
  category: string | null
}

interface Progress {
  status: string
  review_count: number
}

interface FlashcardRunnerProps {
  deck: Deck
  cards: Card[]
  progressMap: Map<number, Progress>
  userId: string
  nextDeckId?: number
}

export default function FlashcardRunner({
  deck,
  cards,
  progressMap,
  userId,
  nextDeckId,
}: FlashcardRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledCards, setShuffledCards] = useState<Card[]>(cards)
  const [isShuffled, setIsShuffled] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  // スワイプアニメーション用
  const [swipeX, setSwipeX] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [enterDirection, setEnterDirection] = useState<'from-right' | 'from-left' | null>(null)

  // 自動再生
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(3000) // 3秒
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const currentCard = shuffledCards[currentIndex]

  // カードをめくる（タップで）
  const flipCard = () => {
    if (!isAnimating) {
      setIsFlipped(!isFlipped)
    }
  }

  // 次のカードへ（アニメーション付き）
  const goToNext = useCallback(() => {
    if (isAnimating) return

    if (currentIndex < shuffledCards.length - 1) {
      setIsAnimating(true)
      setSwipeDirection('left')

      // カードが出ていった後、新しいカードを右から入れる
      setTimeout(() => {
        setIsFlipped(false)
        setCurrentIndex(prev => prev + 1)
        setSwipeDirection(null)
        setSwipeX(0)
        setEnterDirection('from-right')

        // 入場アニメーション後にリセット
        setTimeout(() => {
          setEnterDirection(null)
          setIsAnimating(false)
        }, 300)
      }, 300)
    } else {
      // セッション完了
      setSessionComplete(true)
      setIsAutoPlay(false)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [currentIndex, shuffledCards.length, isAnimating])

  // 前のカード
  const goToPrev = useCallback(() => {
    if (isAnimating) return

    if (currentIndex > 0) {
      setIsAnimating(true)
      setSwipeDirection('right')

      // カードが出ていった後、前のカードを左から入れる
      setTimeout(() => {
        setIsFlipped(false)
        setCurrentIndex(prev => prev - 1)
        setSwipeDirection(null)
        setSwipeX(0)
        setEnterDirection('from-left')

        // 入場アニメーション後にリセット
        setTimeout(() => {
          setEnterDirection(null)
          setIsAnimating(false)
        }, 300)
      }, 300)
    }
  }, [currentIndex, isAnimating])

  // 自動再生
  useEffect(() => {
    if (isAutoPlay && !sessionComplete) {
      autoPlayRef.current = setInterval(() => {
        if (!isFlipped) {
          setIsFlipped(true)
        } else {
          goToNext()
        }
      }, autoPlaySpeed / 2)
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlay, isFlipped, goToNext, autoPlaySpeed, sessionComplete])

  // シャッフル
  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setIsShuffled(true)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  // 順番に戻す
  const resetOrder = () => {
    setShuffledCards(cards)
    setIsShuffled(false)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  // セッションをリセット
  const resetSession = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setSessionComplete(false)
  }

  // スワイプ処理
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return
    setTouchStart(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
    setSwipeX(0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isAnimating) return
    const currentX = e.targetTouches[0].clientX
    const currentY = e.targetTouches[0].clientY
    const diffX = currentX - touchStart
    const diffY = Math.abs(currentY - (touchStartY || 0))

    // 横方向のスワイプが優勢な場合のみ
    if (Math.abs(diffX) > diffY) {
      setSwipeX(diffX)
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || isAnimating) return

    if (swipeX < -minSwipeDistance) {
      goToNext()
    } else if (swipeX > minSwipeDistance) {
      goToPrev()
    } else {
      setSwipeX(0)
    }

    setTouchStart(null)
    setTouchStartY(null)
  }

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        flipCard()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === 'ArrowLeft') {
        goToPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isFlipped, goToNext, goToPrev])

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <HelpCircle className="w-16 h-16 text-[#5DDFC3] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#3A405A] mb-2">
            カードがありません
          </h2>
          <p className="text-[#3A405A] opacity-70">
            このデッキにはまだカードがありません
          </p>
        </div>
      </div>
    )
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle2 className="w-20 h-20 text-[#5DDFC3] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#3A405A] mb-4">
            セッション完了！
          </h2>

          <p className="text-[#3A405A] opacity-70 mb-8">
            {shuffledCards.length}枚のカードを学習しました
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetSession}
              className="bg-[#5DDFC3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#4ECFB3] transition-colors"
            >
              もう一度
            </button>
            {nextDeckId && (
              <Link
                href={`/drill/${nextDeckId}`}
                className="bg-[#3A405A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2A303A] transition-colors flex items-center justify-center gap-2"
              >
                次のセクションへ
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // スワイプアニメーションのスタイル
  const getCardStyle = () => {
    // カードが出ていくアニメーション
    if (swipeDirection === 'left') {
      return {
        transform: 'translateX(-120%) rotate(-10deg)',
        opacity: 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }
    }
    if (swipeDirection === 'right') {
      return {
        transform: 'translateX(120%) rotate(10deg)',
        opacity: 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }
    }
    // 新しいカードが入ってくるアニメーション
    if (enterDirection === 'from-right') {
      return {
        transform: 'translateX(0) rotate(0deg)',
        opacity: 1,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        animation: 'slideInFromRight 0.3s ease-out'
      }
    }
    if (enterDirection === 'from-left') {
      return {
        transform: 'translateX(0) rotate(0deg)',
        opacity: 1,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        animation: 'slideInFromLeft 0.3s ease-out'
      }
    }
    // スワイプ中
    if (swipeX !== 0) {
      const rotation = swipeX * 0.05
      return {
        transform: `translateX(${swipeX}px) rotate(${rotation}deg)`,
        transition: 'none'
      }
    }
    return {
      transform: 'translateX(0) rotate(0deg)',
      transition: 'transform 0.3s ease-out'
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* アニメーション用のスタイル */}
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(120%) rotate(10deg);
            opacity: 0;
          }
          to {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-120%) rotate(-10deg);
            opacity: 0;
          }
          to {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>

      {/* デッキ情報 */}
      <div className="text-center mb-3">
        <h1 className="text-lg font-bold text-[#3A405A]">{deck.name}</h1>
      </div>

      {/* 進捗バー */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-[#3A405A] mb-1">
          <span className="font-medium">{currentIndex + 1} / {shuffledCards.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-[#5DDFC3] h-1.5 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* コントロール */}
      <div className="flex justify-center gap-2 mb-3">
        <button
          onClick={isShuffled ? resetOrder : shuffleCards}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#E0F7F1] text-[#3A405A] rounded-lg hover:bg-[#5DDFC3] hover:text-white transition-colors"
        >
          {isShuffled ? (
            <>
              <RotateCcw className="w-3 h-3" />
              順番に戻す
            </>
          ) : (
            <>
              <Shuffle className="w-3 h-3" />
              シャッフル
            </>
          )}
        </button>
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isAutoPlay
              ? 'bg-[#5DDFC3] text-white'
              : 'bg-[#E0F7F1] text-[#3A405A] hover:bg-[#5DDFC3] hover:text-white'
          }`}
        >
          {isAutoPlay ? (
            <>
              <Pause className="w-3 h-3" />
              停止
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              自動再生
            </>
          )}
        </button>
      </div>

      {/* カード - タップでフリップ、スワイプで次へ */}
      <div
        className="relative w-full aspect-[4/3] mb-3 overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        <div
          className="absolute inset-0 cursor-pointer select-none"
          onClick={flipCard}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={getCardStyle()}
        >
          <div
            className="relative w-full h-full transition-transform duration-300 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* 表面（問題） */}
            <div
              className="absolute inset-0 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border-4 border-[#5DDFC3]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-xs text-[#5DDFC3] mb-2 font-semibold">
                #{currentCard.order_num}
              </div>
              <div className="text-lg text-[#3A405A] text-center font-medium leading-relaxed flex-1 flex items-center px-2">
                {currentCard.front_text}
              </div>
              <div className="text-xs text-[#3A405A] opacity-40 mt-2">
                タップで答えを見る
              </div>
            </div>

            {/* 裏面（解答） */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#5DDFC3] to-[#4ECFB3] rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="text-xs text-white/70 mb-2 font-semibold">
                解答
              </div>
              <div className="text-2xl text-white text-center font-bold leading-relaxed flex-1 flex items-center px-2">
                {currentCard.back_text}
              </div>
              <div className="text-xs text-white/50 mt-2">
                ← スワイプで次へ →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-center items-center gap-6">
        <button
          onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          disabled={currentIndex === 0 || isAnimating}
          className="p-3 rounded-full bg-white shadow-md hover:bg-[#E0F7F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[#3A405A]" />
        </button>

        {/* インジケーター */}
        <div className="flex gap-1 items-center">
          {Array.from({ length: Math.min(7, shuffledCards.length) }, (_, i) => {
            const startIdx = Math.max(0, Math.min(currentIndex - 3, shuffledCards.length - 7))
            const idx = startIdx + i
            if (idx >= shuffledCards.length) return null
            return (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-[#5DDFC3] scale-150'
                    : 'bg-gray-300'
                }`}
              />
            )
          })}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          disabled={currentIndex === shuffledCards.length - 1 || isAnimating}
          className="p-3 rounded-full bg-white shadow-md hover:bg-[#E0F7F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-[#3A405A]" />
        </button>
      </div>

      {/* キーボードショートカット（PC用） */}
      <div className="mt-4 text-center text-xs text-[#3A405A] opacity-30 hidden md:block">
        Space: めくる | 矢印: 移動
      </div>
    </div>
  )
}
