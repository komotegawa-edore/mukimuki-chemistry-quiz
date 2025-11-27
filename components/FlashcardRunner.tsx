'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check,
  X,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
  HelpCircle
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
}

type CardStatus = 'unknown' | 'learning' | 'known'

export default function FlashcardRunner({
  deck,
  cards,
  progressMap,
  userId,
}: FlashcardRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [localProgress, setLocalProgress] = useState<Map<number, CardStatus>>(
    new Map(
      Array.from(progressMap.entries()).map(([id, p]) => [id, p.status as CardStatus])
    )
  )
  const [shuffledCards, setShuffledCards] = useState<Card[]>(cards)
  const [isShuffled, setIsShuffled] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  // 統計
  const knownCount = Array.from(localProgress.values()).filter(s => s === 'known').length
  const learningCount = Array.from(localProgress.values()).filter(s => s === 'learning').length
  const unknownCount = cards.length - knownCount - learningCount

  const currentCard = shuffledCards[currentIndex]

  // 進捗を保存
  const saveProgress = useCallback(async (cardId: number, status: CardStatus) => {
    try {
      await fetch('/api/flashcards/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, status }),
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [])

  // カードをめくる（タップで即座に）
  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  // ステータスを更新して次へ
  const updateStatus = async (status: CardStatus) => {
    if (!currentCard) return

    setLocalProgress((prev) => {
      const newMap = new Map(prev)
      newMap.set(currentCard.id, status)
      return newMap
    })

    await saveProgress(currentCard.id, status)

    // 次のカードへ
    goToNext()
  }

  // 次のカードへ（ステータス更新なし）
  const goToNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setIsFlipped(false)
      setCurrentIndex(currentIndex + 1)
    } else {
      // セッション完了
      setSessionComplete(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  // 前のカード
  const goToPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setCurrentIndex(currentIndex - 1)
    }
  }

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
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrev()
    }
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
      } else if (e.key === '1') {
        updateStatus('unknown')
      } else if (e.key === '2') {
        updateStatus('learning')
      } else if (e.key === '3') {
        updateStatus('known')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isFlipped])

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

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600">{knownCount}</div>
              <div className="text-sm text-green-700">覚えた</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-600">{learningCount}</div>
              <div className="text-sm text-yellow-700">学習中</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-600">{unknownCount}</div>
              <div className="text-sm text-red-700">未習得</div>
            </div>
          </div>

          <button
            onClick={resetSession}
            className="bg-[#5DDFC3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#4ECFB3] transition-colors"
          >
            もう一度
          </button>
        </div>
      </div>
    )
  }

  const currentStatus = localProgress.get(currentCard.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* デッキ情報（コンパクト） */}
      <div className="text-center mb-3">
        <h1 className="text-lg font-bold text-[#3A405A]">{deck.name}</h1>
      </div>

      {/* 進捗バー */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-[#3A405A] mb-1">
          <span className="font-medium">{currentIndex + 1} / {shuffledCards.length}</span>
          <div className="flex gap-3">
            <span className="text-green-600">{knownCount}</span>
            <span className="text-yellow-600">{learningCount}</span>
            <span className="text-red-600">{unknownCount}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-[#5DDFC3] h-1.5 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* コントロール（コンパクト） */}
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
      </div>

      {/* カード - タップでフリップ */}
      <div
        className="relative w-full aspect-[4/3] cursor-pointer select-none mb-3"
        onClick={flipCard}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ perspective: '1000px' }}
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
            <div className="text-lg text-[#3A405A] text-center font-medium leading-relaxed flex-1 flex items-center">
              {currentCard.front_text}
            </div>
            <div className="text-xs text-[#3A405A] opacity-40 mt-2">
              タップでめくる
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
            <div className="text-2xl text-white text-center font-bold leading-relaxed flex-1 flex items-center">
              {currentCard.back_text}
            </div>
            <div className="text-xs text-white/50 mt-2">
              スワイプで次へ
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button
          onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-white shadow hover:bg-[#E0F7F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#3A405A]" />
        </button>

        {/* インジケーター */}
        <div className="flex gap-1 items-center">
          {Array.from({ length: Math.min(7, shuffledCards.length) }, (_, i) => {
            const startIdx = Math.max(0, Math.min(currentIndex - 3, shuffledCards.length - 7))
            const idx = startIdx + i
            if (idx >= shuffledCards.length) return null
            const card = shuffledCards[idx]
            const status = localProgress.get(card.id)
            return (
              <div
                key={card.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-[#5DDFC3] scale-150'
                    : status === 'known'
                    ? 'bg-green-400'
                    : status === 'learning'
                    ? 'bg-yellow-400'
                    : 'bg-gray-300'
                }`}
              />
            )
          })}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          disabled={currentIndex === shuffledCards.length - 1}
          className="p-2 rounded-full bg-white shadow hover:bg-[#E0F7F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-[#3A405A]" />
        </button>
      </div>

      {/* ステータスボタン - 常に表示、コンパクト */}
      <div className="flex justify-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); updateStatus('unknown'); }}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            currentStatus === 'unknown'
              ? 'bg-red-500 text-white'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">?</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); updateStatus('learning'); }}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            currentStatus === 'learning'
              ? 'bg-yellow-500 text-white'
              : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
          }`}
        >
          <Circle className="w-4 h-4" />
          <span className="text-sm font-medium">微妙</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); updateStatus('known'); }}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            currentStatus === 'known'
              ? 'bg-green-500 text-white'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">OK</span>
        </button>
      </div>

      {/* キーボードショートカット（PC用、小さく） */}
      <div className="mt-4 text-center text-xs text-[#3A405A] opacity-30 hidden md:block">
        Space: めくる | 矢印: 移動 | 1/2/3: 評価
      </div>
    </div>
  )
}
