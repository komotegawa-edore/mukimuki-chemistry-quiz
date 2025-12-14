'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Headphones, Play, Volume2, Clock, AlertCircle,
  Check, ArrowRight, Briefcase, Train,
  BookOpen, Newspaper, Star, Timer, Zap, X
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
    // タイマー開始
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

  // 残り30秒でモーダル表示
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

  const timerColor = timeLeft <= 30 ? 'text-red-500' : timeLeft <= 60 ? 'text-orange-500' : 'text-emerald-500'
  const timerBg = timeLeft <= 30 ? 'bg-red-500' : timeLeft <= 60 ? 'bg-orange-500' : 'bg-emerald-500'

  return (
    <div className={`min-h-screen bg-white ${notoSansJP.className}`}>

      {/* タイマーバー - 固定 */}
      <div className={`sticky top-0 z-50 ${isExpired ? 'bg-slate-600' : timerBg} text-white py-3 px-4 transition-colors duration-500`}>
        <div className="max-w-[1000px] mx-auto flex items-center justify-center gap-4">
          {isExpired ? (
            <p className="font-bold text-center">
              特別オファーの期限が終了しました
            </p>
          ) : (
            <>
              <Timer className="w-5 h-5 animate-pulse" />
              <p className="font-bold">
                <span className="hidden sm:inline">このページ限定！</span>
                <span className="font-mono text-2xl mx-2">{formatTime(timeLeft)}</span>
                以内の登録で<span className="underline">初月無料</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-[800px] mx-auto text-center">
          {/* タイマー大表示 */}
          {!isExpired && (
            <div className="mb-8">
              <p className="text-slate-400 text-sm mb-2">特別オファー終了まで</p>
              <div className={`inline-flex items-center gap-3 ${timerColor} text-6xl md:text-8xl font-mono font-bold`}>
                <Clock className="w-12 h-12 md:w-16 md:h-16 animate-pulse" />
                {formatTime(timeLeft)}
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            今だけ、<span className="text-emerald-400">初月無料</span>で<br />
            英語リスニング習慣を始める
          </h1>

          <p className="text-slate-300 text-lg mb-8 max-w-[600px] mx-auto">
            毎朝、日本のニュースを英語で。<br />
            通勤時間を学習時間に変えませんか？
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/english/signup"
              className={`inline-flex items-center gap-2 ${isExpired ? 'bg-slate-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white px-8 py-4 rounded-xl font-bold transition-colors text-lg`}
            >
              {isExpired ? (
                '通常価格で始める'
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  初月無料で始める
                </>
              )}
            </Link>
          </div>

          {!isExpired && (
            <p className="text-emerald-400 text-sm mt-4 font-medium">
              ※ このページを閉じると特典は無効になります
            </p>
          )}
        </div>
      </section>

      {/* 特典説明 */}
      {!isExpired && (
        <section className="py-12 px-4 bg-emerald-50 border-y-4 border-emerald-500">
          <div className="max-w-[800px] mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-emerald-700 font-bold text-sm mb-2">このページ限定特典</p>
                <h2 className="text-3xl font-black text-slate-800 mb-2">
                  初月<span className="text-emerald-600">完全無料</span>
                </h2>
                <p className="text-slate-600">
                  通常980円/月 → 最初の1ヶ月は0円でお試し
                </p>
              </div>
              <div className="text-center">
                <div className={`${timerColor} font-mono text-5xl font-bold`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-slate-500 text-sm mt-1">残り時間</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* サービス説明 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">
            Roopy Englishの特徴
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Newspaper,
                title: '日本のニュースを英語で',
                desc: '背景知識があるから理解できる',
              },
              {
                icon: BookOpen,
                title: '英語・日本語字幕',
                desc: 'わからない部分もすぐ確認',
              },
              {
                icon: Headphones,
                title: 'バックグラウンド再生',
                desc: '通勤中に聞き流せる',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
                  <feature.icon className="w-7 h-7 text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お試し再生 */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              実際に聞いてみる
            </h2>
            <p className="text-slate-500 text-sm">
              登録不要ですぐに再生できます
            </p>
          </div>

          <TryNewsPlayer useSample />
        </div>
      </section>

      {/* 口コミ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">
            利用者の声
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'T.K',
                role: 'IT企業・38歳',
                text: '日本のニュースなら内容がわかるので、純粋に英語に集中できます。毎朝の通勤が楽しみになりました。',
              },
              {
                name: 'M.S',
                role: 'メーカー・42歳',
                text: '英語学習アプリは何度も挫折しましたが、これは続いてます。字幕があるので安心感があります。',
              },
            ].map((review, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm mb-4">{review.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{review.name}</p>
                    <p className="text-slate-400 text-xs">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-[500px] mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-500 p-8 relative overflow-hidden">
            {!isExpired && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-sm font-bold">
                限定特典
              </div>
            )}

            <div className="text-center mb-6">
              {!isExpired ? (
                <>
                  <p className="text-emerald-600 font-bold mb-2">初月無料キャンペーン</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-slate-400 line-through text-xl">¥980</span>
                    <span className="text-5xl font-black text-emerald-600">¥0</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">
                    2ヶ月目以降 980円/月
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-800">¥980</span>
                    <span className="text-slate-500">/月</span>
                  </div>
                </>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {[
                '毎朝約20本のニュース配信',
                '英語・日本語字幕',
                '速度調整機能',
                'バックグラウンド再生',
                'いつでも解約可能',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/english/signup"
              className={`block w-full py-4 ${isExpired ? 'bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-center rounded-xl font-bold transition-colors`}
            >
              {isExpired ? '登録する' : '初月無料で始める'}
            </Link>

            {!isExpired && (
              <div className="mt-4 text-center">
                <p className={`${timerColor} font-bold`}>
                  残り {formatTime(timeLeft)} で特典終了
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className={`py-20 px-4 ${isExpired ? 'bg-slate-700' : 'bg-emerald-600'} text-white transition-colors duration-500`}>
        <div className="max-w-[600px] mx-auto text-center">
          {!isExpired ? (
            <>
              <div className={`${timerColor} bg-white inline-block px-6 py-3 rounded-full mb-6`}>
                <span className="font-mono text-4xl font-bold">{formatTime(timeLeft)}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-4">
                初月無料は今だけ
              </h2>
              <p className="text-emerald-100 mb-8">
                このページを閉じると特典は無効になります
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                特典は終了しましたが...
              </h2>
              <p className="text-slate-300 mb-8">
                まだ月額980円でお得に始められます
              </p>
            </>
          )}

          <Link
            href="/english/signup"
            className="inline-flex items-center gap-2 bg-white text-slate-800 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors"
          >
            {isExpired ? '登録する' : '初月無料で始める'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 px-4">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/english/favicon-48x48.png"
              alt="Roopy English"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="font-medium text-sm">Roopy English</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mb-4">
            <Link href="/english/terms">利用規約</Link>
            <Link href="/english/privacy">プライバシーポリシー</Link>
            <Link href="/english/legal">特定商取引法</Link>
          </div>
          <p className="text-xs text-slate-600">&copy; 2025 Edore. All rights reserved.</p>
        </div>
      </footer>

      {/* 残り30秒モーダル */}
      {showModal && !isExpired && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-[400px] w-full p-8 relative animate-bounce-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="text-red-500 mb-4">
                <AlertCircle className="w-16 h-16 mx-auto animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">
                あと30秒！
              </h3>
              <p className="text-slate-600 mb-6">
                初月無料の特典がまもなく終了します
              </p>

              <div className="text-red-500 font-mono text-5xl font-bold mb-6">
                {formatTime(timeLeft)}
              </div>

              <Link
                href="/english/signup"
                className="block w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
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
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
