'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Headphones, Play, Clock, Target, Volume2, Repeat,
  HelpCircle, Frown, Timer, AlertCircle, ArrowDown, Star, Sparkles, TrendingUp,
  Users, BookOpen, Newspaper, Globe, Coffee, Briefcase, Train,
  Check, Crown, Zap, Gift, PartyPopper, Flame, AlertTriangle
} from 'lucide-react'
import TryNewsPlayer from '@/components/TryNewsPlayer'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export default function EnglishCampaignPage() {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/english/early-discount')
      .then(res => res.json())
      .then(data => {
        if (data.available) {
          setRemaining(data.remaining)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className={`min-h-screen text-white ${notoSansJP.className} overflow-x-hidden`}>

      {/* 緊急バナー - 画面上部固定 */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 py-3 px-4 text-center animate-pulse sticky top-0 z-50">
        <p className="text-sm md:text-base font-bold flex items-center justify-center gap-2 flex-wrap">
          <Flame className="w-5 h-5" />
          <span>【期間限定】先着100名様 永久54%OFF キャンペーン実施中！</span>
          <Flame className="w-5 h-5" />
        </p>
      </div>

      {/* Hero Section - ド派手バージョン */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-pink-800 to-red-700">
        {/* 装飾的な背景 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          {/* キラキラエフェクト */}
          {[...Array(20)].map((_, i) => (
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

        <div className="relative z-10 max-w-[1000px] mx-auto px-4 text-center">
          {/* キャンペーンバッジ */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full text-lg font-black mb-6 animate-bounce shadow-2xl">
            <Gift className="w-6 h-6" />
            初回限定キャンペーン
            <Gift className="w-6 h-6" />
          </div>

          {/* メインコピー */}
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            英語ニュースリスニングが<br />
            <span className="relative inline-block">
              <span className="text-6xl md:text-9xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
                永久450円
              </span>
              <span className="absolute -top-4 -right-4 bg-red-500 text-white text-sm md:text-base px-3 py-1 rounded-full font-bold transform rotate-12 animate-pulse">
                54%OFF
              </span>
            </span>
          </h1>

          {/* 価格比較 - 超目立つ */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border-2 border-yellow-400/50 max-w-[600px] mx-auto">
            <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-sm opacity-70 mb-1">通常価格</p>
                <p className="text-4xl md:text-5xl font-black text-gray-300 line-through">¥980</p>
                <p className="text-sm opacity-70">/月</p>
              </div>
              <div className="text-4xl md:text-6xl">→</div>
              <div className="text-center">
                <p className="text-sm text-yellow-300 font-bold mb-1">キャンペーン価格</p>
                <p className="text-5xl md:text-7xl font-black text-yellow-400 animate-pulse">¥450</p>
                <p className="text-sm text-yellow-300 font-bold">/月（永久）</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-lg md:text-xl font-bold text-yellow-300 flex items-center justify-center gap-2">
                <PartyPopper className="w-6 h-6" />
                今入会すれば、ずっとこの価格！
                <PartyPopper className="w-6 h-6" />
              </p>
            </div>
          </div>

          {/* 残り枠数 */}
          {remaining !== null && (
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-red-600 px-6 py-4 rounded-2xl shadow-2xl border-2 border-red-400 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-yellow-300" />
                <div className="text-left">
                  <p className="text-sm font-bold text-red-200">先着100名様限定</p>
                  <p className="text-3xl font-black text-white">
                    残り <span className="text-yellow-300">{remaining}</span> 名
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTAボタン */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/english/signup"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black text-xl md:text-2xl font-black py-6 px-12 rounded-full hover:scale-110 transition-all shadow-2xl"
            >
              <Zap className="w-8 h-8 group-hover:animate-spin" />
              今すぐ450円で始める
              <Zap className="w-8 h-8 group-hover:animate-spin" />

              {/* 光るエフェクト */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer overflow-hidden" />
            </Link>

            <p className="text-sm opacity-70">
              クレジットカードで30秒登録 / いつでも解約可能
            </p>
          </div>
        </div>

        {/* 下矢印 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-10 h-10 text-white/50" />
        </div>
      </header>

      {/* なぜ今なのか？ */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <AlertTriangle className="w-4 h-4" />
              重要なお知らせ
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              なぜ<span className="text-yellow-400">今</span>入会すべきなのか？
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl p-8 border border-yellow-500/30 text-center">
              <div className="text-6xl font-black text-yellow-400 mb-4">54%</div>
              <p className="font-bold text-xl mb-2">永久割引</p>
              <p className="opacity-70">一度入会すれば、解約するまでずっと450円/月のまま</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl p-8 border border-red-500/30 text-center">
              <div className="text-6xl font-black text-red-400 mb-4">100</div>
              <p className="font-bold text-xl mb-2">名様限定</p>
              <p className="opacity-70">先着100名に達した時点でキャンペーン終了</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl p-8 border border-purple-500/30 text-center">
              <div className="text-6xl font-black text-purple-400 mb-4">∞</div>
              <p className="font-bold text-xl mb-2">期間無制限</p>
              <p className="opacity-70">後から値上げされることはありません</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-lg">
                <span className="text-yellow-400 font-bold">通常価格980円/月</span>で入会すると、
                <span className="text-red-400 font-bold">年間11,760円</span>
              </p>
              <p className="text-2xl font-black mt-2">
                キャンペーン価格なら<span className="text-yellow-400">年間5,400円</span>
                <span className="text-green-400 ml-2">（6,360円お得！）</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* サービス内容 */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              サービス内容
            </div>
            <h2 className="text-4xl font-black mb-4">
              <span className="text-yellow-400">450円</span>でこれだけ使える
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Newspaper, title: '毎朝約20本', desc: '新着ニュースを毎日配信' },
              { icon: Globe, title: '日本のニュース', desc: '背景知識があるから理解しやすい' },
              { icon: Volume2, title: 'AI音声', desc: '自然な英語音声で毎日リスニング' },
              { icon: BookOpen, title: '日本語字幕', desc: '内容を理解しながら聞ける' },
              { icon: Repeat, title: '速度調整', desc: '0.7x〜1.25xで自分のペースで' },
              { icon: Headphones, title: 'バックグラウンド再生', desc: '通勤中も画面オフで聞ける' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all group"
              >
                <feature.icon className="w-10 h-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="opacity-70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お試し再生 */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-500 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Play className="w-4 h-4" />
              今すぐ体験
            </div>
            <h2 className="text-4xl font-black mb-4">
              <span className="text-yellow-400">無料</span>で聞いてみる
            </h2>
            <p className="opacity-70">
              登録不要・今すぐ再生できます
            </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
            <TryNewsPlayer />
          </div>

          <p className="text-center mt-6 text-yellow-400 font-bold">
            ↑ これが毎朝届きます！
          </p>
        </div>
      </section>

      {/* 比較表 */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              他サービスと<span className="text-yellow-400">比較</span>
            </h2>
          </div>

          <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="bg-white/10">
                  <th className="p-4 text-left">サービス</th>
                  <th className="p-4 text-center">月額</th>
                  <th className="p-4 text-center">日本語対応</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/10">
                  <td className="p-4">英語ニュースアプリA</td>
                  <td className="p-4 text-center">¥1,500</td>
                  <td className="p-4 text-center opacity-50">×</td>
                </tr>
                <tr className="border-t border-white/10">
                  <td className="p-4">リスニング教材B</td>
                  <td className="p-4 text-center">¥2,000</td>
                  <td className="p-4 text-center text-green-400">○</td>
                </tr>
                <tr className="border-t border-white/10">
                  <td className="p-4">オンライン英会話C</td>
                  <td className="p-4 text-center">¥6,000〜</td>
                  <td className="p-4 text-center text-green-400">○</td>
                </tr>
                <tr className="border-t-2 border-yellow-400 bg-yellow-400/10">
                  <td className="p-4 font-bold text-yellow-400">Roopy English</td>
                  <td className="p-4 text-center">
                    <span className="text-2xl font-black text-yellow-400">¥450</span>
                  </td>
                  <td className="p-4 text-center text-green-400 font-bold">◎</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 口コミ */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Users className="w-4 h-4" />
              利用者の声
            </div>
            <h2 className="text-4xl font-black">
              すでに多くの方が<span className="text-yellow-400">実感</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Tさん', job: 'IT企業勤務・30代', text: '毎朝の通勤電車で聞いてます。日本のニュースだから内容がわかりやすく、続けられてます！450円でこの内容は破格です。' },
              { name: 'Mさん', job: 'メーカー勤務・40代', text: '海外ニュースは背景がわからなくて挫折してたけど、これなら理解できる。字幕があるのも助かる。' },
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
      <section className="py-24 px-4 bg-gradient-to-r from-red-700 via-pink-700 to-purple-700 relative overflow-hidden">
        {/* 背景エフェクト */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-[800px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full text-lg font-black mb-8 animate-bounce">
            <Flame className="w-6 h-6" />
            今だけの特別価格
            <Flame className="w-6 h-6" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-6">
            もう迷っている<br />時間はありません
          </h2>

          <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-8 mb-8 inline-block">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              <div className="text-center">
                <p className="text-gray-400 line-through text-2xl">¥980</p>
              </div>
              <div className="text-4xl">→</div>
              <div className="text-center">
                <p className="text-6xl md:text-8xl font-black text-yellow-400">¥450</p>
                <p className="text-yellow-300 font-bold">/月（永久）</p>
              </div>
            </div>
          </div>

          {remaining !== null && (
            <p className="text-2xl font-bold mb-8 text-yellow-300">
              残り {remaining} 名で終了！
            </p>
          )}

          <Link
            href="/english/signup"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-2xl font-black py-6 px-16 rounded-full hover:scale-110 transition-all shadow-2xl"
          >
            <Zap className="w-8 h-8" />
            今すぐ登録する
          </Link>

          <p className="mt-6 opacity-70">
            30秒で登録完了 / いつでも解約可能
          </p>
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

      {/* CSS for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
