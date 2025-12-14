'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Headphones, Play, Volume2, Clock, AlertCircle,
  Check, ArrowRight, Flame, Gift,
  BookOpen, Newspaper, Star, Timer, Zap, X,
  AlertTriangle, Sparkles, PartyPopper
} from 'lucide-react'
import TryNewsPlayer from '@/components/TryNewsPlayer'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

const TIMER_DURATION = 3 * 60 // 3分

export default function EnglishTimerPage() {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [isExpired, setIsExpired] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true)
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (timeLeft === 30 && !isExpired) {
      setShowModal(true)
    }
  }, [timeLeft, isExpired])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isUrgent = timeLeft <= 60

  return (
    <div className={`min-h-screen text-white ${notoSansJP.className} overflow-x-hidden`}>

      {/* 緊急タイマーバー */}
      <div className={`sticky top-0 z-50 py-4 px-4 ${isExpired ? 'bg-slate-700' : isUrgent ? 'bg-gradient-to-r from-red-600 via-pink-600 to-red-600 animate-pulse' : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600'}`}>
        <div className="max-w-[1000px] mx-auto flex items-center justify-center gap-3">
          {isExpired ? (
            <p className="font-bold text-center">特別オファー終了</p>
          ) : (
            <>
              <Flame className="w-6 h-6 animate-bounce" />
              <div className="text-center">
                <span className="font-black text-2xl md:text-3xl font-mono bg-black/30 px-4 py-1 rounded-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <span className="font-bold text-sm md:text-base">
                以内の登録で<span className="text-yellow-300 text-lg md:text-xl">初月無料！</span>
              </span>
              <Flame className="w-6 h-6 animate-bounce" />
            </>
          )}
        </div>
      </div>

      {/* Hero - 超ド派手 */}
      <header className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isExpired ? 'bg-slate-800' : 'bg-gradient-to-br from-purple-900 via-red-800 to-orange-700'}`}>
        {/* 背景エフェクト */}
        {!isExpired && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            {/* キラキラ */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 max-w-[900px] mx-auto px-4 text-center">
          {/* 緊急バッジ */}
          {!isExpired && (
            <div className={`inline-flex items-center gap-2 ${isUrgent ? 'bg-red-500 animate-bounce' : 'bg-yellow-500'} text-black px-6 py-3 rounded-full text-lg font-black mb-6 shadow-2xl`}>
              {isUrgent ? (
                <>
                  <AlertTriangle className="w-6 h-6" />
                  緊急！残りわずか！
                  <AlertTriangle className="w-6 h-6" />
                </>
              ) : (
                <>
                  <Gift className="w-6 h-6" />
                  このページ限定特典
                  <Gift className="w-6 h-6" />
                </>
              )}
            </div>
          )}

          {/* 巨大タイマー */}
          {!isExpired && (
            <div className="mb-8">
              <div className={`inline-block ${isUrgent ? 'bg-red-600/50 border-red-400' : 'bg-black/30 border-yellow-400/50'} backdrop-blur-md rounded-3xl p-8 border-4`}>
                <p className="text-sm opacity-80 mb-2">特典終了まで</p>
                <div className={`font-mono text-7xl md:text-9xl font-black ${isUrgent ? 'text-red-300 animate-pulse' : 'text-yellow-400'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          )}

          {/* メインコピー */}
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            {isExpired ? (
              '特典は終了しました'
            ) : (
              <>
                今だけ<br />
                <span className="relative inline-block">
                  <span className="text-5xl md:text-8xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    初月無料
                  </span>
                  {isUrgent && (
                    <span className="absolute -top-4 -right-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold animate-bounce">
                      急いで！
                    </span>
                  )}
                </span>
              </>
            )}
          </h1>

          <p className="text-xl md:text-2xl mb-8 opacity-90">
            英語ニュースリスニング<br className="md:hidden" />
            <span className="font-bold">通常980円/月が最初の1ヶ月0円</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/english/signup"
              className={`group relative inline-flex items-center gap-3 ${isExpired ? 'bg-slate-600' : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500'} text-black text-xl md:text-2xl font-black py-6 px-12 rounded-full hover:scale-110 transition-all shadow-2xl`}
            >
              <Zap className="w-8 h-8" />
              {isExpired ? '通常価格で始める' : '初月無料で始める'}
              <Zap className="w-8 h-8" />

              {!isExpired && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer overflow-hidden" />
              )}
            </Link>

            {!isExpired && (
              <p className="text-yellow-300 font-bold animate-pulse">
                ※ このページを閉じると特典は消えます
              </p>
            )}
          </div>
        </div>
      </header>

      {/* 特典詳細 */}
      {!isExpired && (
        <section className={`py-12 px-4 ${isUrgent ? 'bg-red-600' : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500'} text-black`}>
          <div className="max-w-[800px] mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <PartyPopper className="w-6 h-6" />
                  <span className="font-black text-lg">このページ限定！</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black">
                  初月<span className="bg-black text-yellow-400 px-3 py-1 rounded-lg ml-2">完全無料</span>
                </h2>
              </div>
              <div className="text-center bg-black/20 rounded-2xl p-6">
                <p className="text-sm font-bold mb-1">残り時間</p>
                <div className={`font-mono text-5xl font-black ${isUrgent ? 'text-white animate-pulse' : ''}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* サービス内容 */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              サービス内容
            </div>
            <h2 className="text-4xl font-black">
              毎朝の通勤を<span className="text-yellow-400">学習時間</span>に
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Newspaper, title: '毎朝約20本', desc: '日本のニュースを英語で配信' },
              { icon: BookOpen, title: '日本語字幕', desc: '内容を理解しながら聞ける' },
              { icon: Headphones, title: 'バックグラウンド再生', desc: '画面オフでも再生OK' },
              { icon: Volume2, title: '速度調整', desc: '0.7x〜1.0xで自分のペースで' },
              { icon: Clock, title: '1本約3分', desc: '通勤中にサクッと聞ける' },
              { icon: Star, title: '重要単語リスト', desc: 'ニュースの単語を学習' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all"
              >
                <feature.icon className="w-10 h-10 text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="opacity-70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お試し */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-slate-900">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Play className="w-4 h-4" />
              今すぐ体験
            </div>
            <h2 className="text-4xl font-black mb-4">
              まず<span className="text-yellow-400">聞いて</span>みる
            </h2>
          </div>

          <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
            <TryNewsPlayer useSample />
          </div>
        </div>
      </section>

      {/* 口コミ */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black">
              利用者の<span className="text-yellow-400">声</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Tさん', job: 'IT企業・30代', text: '毎朝の通勤電車で聞いてます。日本のニュースだから理解しやすく、続けられてます！' },
              { name: 'Mさん', job: 'メーカー・40代', text: '海外ニュースは挫折したけど、これなら理解できる。字幕があるのも助かる。' },
            ].map((review, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 opacity-90">「{review.text}」</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-bold">{review.name}</p>
                    <p className="text-sm opacity-60">{review.job}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className={`py-24 px-4 relative overflow-hidden ${isExpired ? 'bg-slate-700' : 'bg-gradient-to-r from-red-700 via-orange-600 to-yellow-600'}`}>
        {/* 背景エフェクト */}
        {!isExpired && (
          <div className="absolute inset-0">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 max-w-[800px] mx-auto text-center">
          {!isExpired ? (
            <>
              <div className={`inline-flex items-center gap-2 ${isUrgent ? 'bg-red-500' : 'bg-yellow-400'} text-black px-6 py-3 rounded-full text-lg font-black mb-6 animate-bounce`}>
                <Flame className="w-6 h-6" />
                {isUrgent ? '今すぐ決断を！' : 'ラストチャンス'}
                <Flame className="w-6 h-6" />
              </div>

              <div className={`${isUrgent ? 'bg-red-600/50' : 'bg-black/30'} backdrop-blur-sm rounded-3xl p-8 mb-8 inline-block`}>
                <p className="text-sm opacity-80 mb-2">特典終了まで</p>
                <div className={`font-mono text-6xl md:text-8xl font-black ${isUrgent ? 'text-red-300 animate-pulse' : 'text-yellow-400'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-8">
                <span className="text-yellow-300">初月無料</span>は<br />今だけです
              </h2>
            </>
          ) : (
            <h2 className="text-3xl font-bold mb-8">
              特典は終了しましたが<br />まだ始められます
            </h2>
          )}

          <Link
            href="/english/signup"
            className={`group inline-flex items-center gap-3 ${isExpired ? 'bg-white text-slate-700' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'} text-2xl font-black py-6 px-16 rounded-full hover:scale-110 transition-all shadow-2xl`}
          >
            <Zap className="w-8 h-8" />
            {isExpired ? '登録する' : '初月無料で始める'}
          </Link>

          {!isExpired && (
            <p className="mt-6 text-yellow-200 font-bold">
              ページを閉じると特典は消えます
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/english/favicon-48x48.png"
              alt="Roopy English"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-lg">Roopy English</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm opacity-70 mb-4">
            <Link href="/english/terms">利用規約</Link>
            <Link href="/english/privacy">プライバシーポリシー</Link>
            <Link href="/english/legal">特定商取引法</Link>
          </div>
          <p className="text-sm opacity-50">&copy; 2025 Edore. All rights reserved.</p>
        </div>
      </footer>

      {/* 残り30秒モーダル - 超緊急演出 */}
      {showModal && !isExpired && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl max-w-[450px] w-full p-8 relative border-4 border-yellow-400 shadow-2xl animate-bounce-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="mb-4">
                <AlertTriangle className="w-20 h-20 mx-auto text-yellow-400 animate-bounce" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">
                待って！<br />あと30秒！
              </h3>

              <div className="bg-black/30 rounded-2xl p-6 mb-6">
                <div className="text-yellow-400 font-mono text-6xl font-black animate-pulse">
                  {formatTime(timeLeft)}
                </div>
              </div>

              <p className="text-white/90 mb-6 text-lg">
                <span className="text-yellow-300 font-bold">初月無料</span>の特典が<br />
                まもなく終了します！
              </p>

              <Link
                href="/english/signup"
                className="block w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-2xl font-black text-xl hover:scale-105 transition-transform"
                onClick={() => setShowModal(false)}
              >
                今すぐ初月無料で始める
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
