'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Sparkles, Coins, ArrowLeft, Trophy, History, X } from 'lucide-react'
import Link from 'next/link'

interface Prize {
  id: number
  name: string
  description: string
  prize_type: string
  prize_value: number
  probability: number
}

interface GachaResult {
  id: number
  name: string
  description: string
  type: string
  value: number
}

interface HistoryItem {
  id: number
  points_used: number
  is_claimed: boolean
  created_at: string
  prize: Prize | null
}

interface WinItem {
  id: number
  is_claimed: boolean
  created_at: string
  prize: Prize | null
}

export default function GachaPage() {
  const router = useRouter()
  const [currentPoints, setCurrentPoints] = useState(0)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [wins, setWins] = useState<WinItem[]>([])
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [result, setResult] = useState<GachaResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'revealing' | 'done'>('idle')

  const fetchGachaData = useCallback(async () => {
    try {
      const response = await fetch('/api/gacha')
      if (response.ok) {
        const data = await response.json()
        if (data.isExcluded || data.isDisabled) {
          router.push('/')
          return
        }
        setCurrentPoints(data.currentPoints || 0)
        setPrizes(data.prizes || [])
        setHistory(data.history || [])
        setWins(data.wins || [])
      }
    } catch (error) {
      console.error('Failed to fetch gacha data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchGachaData()
  }, [fetchGachaData])

  const drawGacha = async () => {
    if (drawing || currentPoints < 50) return

    setDrawing(true)
    setAnimationPhase('spinning')

    try {
      const response = await fetch('/api/gacha', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // スピンアニメーション後に結果を表示
          setTimeout(() => {
            setAnimationPhase('revealing')
            setTimeout(() => {
              setResult(data.prize)
              setCurrentPoints(data.remainingPoints)
              setShowResult(true)
              setAnimationPhase('done')
              // 履歴を更新
              fetchGachaData()
            }, 500)
          }, 2000)
        } else {
          alert(data.message || 'ガチャを引けませんでした')
          setAnimationPhase('idle')
          setDrawing(false)
        }
      }
    } catch (error) {
      console.error('Failed to draw gacha:', error)
      setAnimationPhase('idle')
      setDrawing(false)
    }
  }

  const closeResult = () => {
    setShowResult(false)
    setResult(null)
    setAnimationPhase('idle')
    setDrawing(false)
  }

  const getPrizeColor = (type: string, value: number) => {
    if (type === 'lose') return 'from-gray-400 to-gray-500'
    if (value >= 5000) return 'from-yellow-400 to-yellow-600' // A賞
    if (value >= 3000) return 'from-gray-300 to-gray-400' // B賞
    return 'from-orange-400 to-orange-600' // C賞
  }

  const getPrizeBgColor = (type: string, value: number) => {
    if (type === 'lose') return 'bg-gray-100'
    if (value >= 5000) return 'bg-yellow-50'
    if (value >= 3000) return 'bg-gray-50'
    return 'bg-orange-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  const canDraw = currentPoints >= 50
  const drawsAvailable = Math.floor(currentPoints / 50)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      {/* カスタムヘッダー */}
      <header className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">ポイントガチャ</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* ポイント表示 */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Coins className="w-6 h-6" />
              <span className="text-lg">所持ポイント</span>
            </div>
            <div className="text-white">
              <span className="text-3xl font-bold">{currentPoints}</span>
              <span className="text-lg ml-1">pt</span>
            </div>
          </div>
          {drawsAvailable > 0 && (
            <p className="text-white/80 text-sm mt-2 text-center">
              あと <span className="font-bold text-lg">{drawsAvailable}</span> 回引けます！
            </p>
          )}
        </div>

        {/* キャンペーン説明 */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-xl">
          <h2 className="text-lg font-bold text-[#3A405A] mb-4">
            友達紹介キャンペーン
          </h2>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-bold text-purple-700 mb-2">ポイントの貯め方</h3>
              <ul className="space-y-1 text-purple-800">
                <li>・毎日ログインで <span className="font-bold">3pt</span></li>
                <li>・章を100%正解でクリアすると <span className="font-bold">1pt</span>（1日1回）</li>
                <li>・友達を紹介すると <span className="font-bold">デイリーミッション+1</span></li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-green-700 mb-2">友達紹介の条件</h3>
              <ul className="space-y-1 text-green-800">
                <li>・ホーム画面の招待コードを友達に共有</li>
                <li>・友達がコードを使って登録</li>
                <li>・友達が <span className="font-bold">1章クリア</span> で紹介成立！</li>
                <li>・友達も <span className="font-bold">デイリークエスト2つ</span> でスタート</li>
              </ul>
            </div>

            <div className="bg-pink-50 rounded-xl p-4">
              <h3 className="font-bold text-pink-700 mb-2">ガチャの仕組み</h3>
              <ul className="space-y-1 text-pink-800">
                <li>・<span className="font-bold">50pt</span> で1回ガチャが引けます</li>
                <li>・当選者には担当者からメールでギフト券をお届け</li>
                <li>・各賞は数量限定！なくなり次第終了</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 景品一覧 */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-xl">
          <h2 className="text-lg font-bold text-[#3A405A] mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            景品一覧（数量限定）
          </h2>
          <div className="space-y-2">
            {prizes.filter(p => p.prize_type !== 'lose').map((prize) => (
              <div
                key={prize.id}
                className={`p-3 rounded-lg ${getPrizeBgColor(prize.prize_type, prize.prize_value)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3A405A]">{prize.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    prize.prize_value >= 5000 ? 'bg-yellow-200 text-yellow-800' :
                    prize.prize_value >= 3000 ? 'bg-gray-200 text-gray-800' :
                    'bg-orange-200 text-orange-800'
                  }`}>
                    {prize.prize_value.toLocaleString()}円
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{prize.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ガチャボタン */}
        <div className="flex flex-col items-center mb-6">
          <div
            className={`relative w-48 h-48 mb-4 ${
              animationPhase === 'spinning' ? 'animate-spin' : ''
            } ${animationPhase === 'revealing' ? 'animate-pulse scale-110' : ''}`}
            style={{ animationDuration: animationPhase === 'spinning' ? '0.3s' : '1s' }}
          >
            {/* ガチャマシン風のデザイン */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center">
              <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center shadow-inner">
                <Gift className={`w-16 h-16 ${canDraw ? 'text-purple-500' : 'text-gray-400'}`} />
              </div>
            </div>
            {/* キラキラエフェクト */}
            {canDraw && animationPhase === 'idle' && (
              <>
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-yellow-300 animate-pulse" />
                <Sparkles className="absolute bottom-4 left-0 w-5 h-5 text-pink-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute top-8 left-2 w-4 h-4 text-purple-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </>
            )}
          </div>

          <button
            onClick={drawGacha}
            disabled={!canDraw || drawing}
            className={`w-full max-w-xs py-4 px-8 rounded-full font-bold text-lg transition-all ${
              canDraw && !drawing
                ? 'bg-white text-purple-600 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                : 'bg-white/30 text-white/60 cursor-not-allowed'
            }`}
          >
            {drawing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">
                  <Gift className="w-5 h-5" />
                </span>
                抽選中...
              </span>
            ) : canDraw ? (
              '50pt で1回引く'
            ) : (
              `あと ${50 - (currentPoints % 50)}pt 必要`
            )}
          </button>
        </div>

        {/* 当選履歴ボタン */}
        <button
          onClick={() => setShowHistory(true)}
          className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <History className="w-5 h-5" />
          当選履歴を見る
          {wins.length > 0 && (
            <span className="bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-bold">
              {wins.length}
            </span>
          )}
        </button>
      </main>

      {/* 結果モーダル */}
      {showResult && result && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center animate-bounce-in">
            {/* 結果ヘッダー */}
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${getPrizeColor(result.type, result.value)} flex items-center justify-center shadow-lg`}>
              {result.type === 'lose' ? (
                <X className="w-12 h-12 text-white" />
              ) : (
                <Trophy className="w-12 h-12 text-white" />
              )}
            </div>

            <h2 className={`text-2xl font-bold mb-2 ${result.type === 'lose' ? 'text-gray-600' : 'text-[#3A405A]'}`}>
              {result.name}
            </h2>
            <p className="text-gray-600 mb-4">{result.description}</p>

            {result.type !== 'lose' && (
              <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  おめでとうございます！
                </p>
                <p className="text-xs text-yellow-700">
                  担当者よりメールにてAmazonギフト券をお送りします。
                  <br />
                  しばらくお待ちください。
                </p>
              </div>
            )}

            <button
              onClick={closeResult}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 履歴モーダル */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#3A405A]">当選履歴</h2>
              <button onClick={() => setShowHistory(false)} className="p-2">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {wins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>まだ当選履歴がありません</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-2">
                {wins.map((win) => (
                  <div
                    key={win.id}
                    className={`p-3 rounded-lg ${getPrizeBgColor(win.prize?.prize_type || 'lose', win.prize?.prize_value || 0)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#3A405A]">{win.prize?.name}</p>
                        <p className="text-sm text-gray-600">{win.prize?.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        win.is_claimed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {win.is_claimed ? '受取済' : '未受取'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(win.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
