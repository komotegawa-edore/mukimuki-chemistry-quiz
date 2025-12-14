'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Headphones, Play, Clock, Volume2,
  Check, ArrowRight, Briefcase, Train, Coffee,
  BookOpen, Newspaper, Globe, Star, ChevronRight
} from 'lucide-react'
import TryNewsPlayer from '@/components/TryNewsPlayer'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function EnglishBusinessPage() {
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
    <div className={`min-h-screen bg-slate-50 ${notoSansJP.className}`}>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sticky top-0 z-50">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/english/favicon-48x48.png"
              alt="Roopy English"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-slate-800">Roopy English</span>
          </div>
          <Link
            href="/english/signup"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Hero - シンプル・落ち着いたデザイン */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900 text-white">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-slate-400 text-sm mb-4 tracking-wider">
            忙しいビジネスパーソンのための英語リスニング習慣
          </p>

          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            通勤時間を、<br />
            <span className="text-cyan-400">キャリアの武器</span>に変える
          </h1>

          <p className="text-slate-300 text-lg mb-8 max-w-[600px] mx-auto leading-relaxed">
            毎朝、日本のニュースを英語で。<br />
            背景知識があるから理解できる。だから続く。
          </p>

          {remaining !== null && (
            <div className="inline-flex items-center gap-2 bg-cyan-600/20 border border-cyan-500/30 px-4 py-2 rounded-full text-sm mb-8">
              <span className="text-cyan-400">先着100名限定</span>
              <span className="text-white font-bold">月額450円</span>
              <span className="text-slate-400">（通常980円）</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/english/signup"
              className="inline-flex items-center gap-2 bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-cyan-600 transition-colors"
            >
              今すぐ始める
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#try"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <Play className="w-5 h-5" />
              まず聞いてみる
            </a>
          </div>
        </div>
      </section>

      {/* 課題提起 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[800px] mx-auto">
          <p className="text-center text-slate-500 text-sm mb-8">
            こんな経験はありませんか？
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Train, text: '通勤時間、スマホをなんとなく眺めて終わる' },
              { icon: Briefcase, text: '英語学習、何度も挫折している' },
              { icon: Coffee, text: '海外ニュースは背景がわからず理解できない' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <item.icon className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-slate-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 解決策 */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
            Roopy Englishなら、<span className="text-cyan-600">続けられる</span>
          </h2>
          <p className="text-slate-600 mb-12">
            日本のニュースだから、背景知識がある。だから理解できる。
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Newspaper,
                title: '日本のニュースを英語で',
                desc: '普段から知っているニュースだから、英語でも内容を推測できる',
              },
              {
                icon: BookOpen,
                title: '英語・日本語字幕',
                desc: 'わからない部分はすぐ確認。ストレスなく聞き続けられる',
              },
              {
                icon: Headphones,
                title: 'バックグラウンド再生',
                desc: '画面オフでも再生OK。通勤中に聞き流せる',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-100 rounded-2xl mb-4">
                  <feature.icon className="w-7 h-7 text-cyan-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お試し再生 */}
      <section id="try" className="py-16 px-4 bg-white">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-8">
            <p className="text-cyan-600 text-sm font-medium mb-2">無料体験</p>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              実際に聞いてみてください
            </h2>
            <p className="text-slate-500 text-sm">
              登録不要ですぐに再生できます
            </p>
          </div>

          <TryNewsPlayer useSample />

          <p className="text-center mt-6 text-slate-600 text-sm">
            このようなニュースが毎朝約20本届きます
          </p>
        </div>
      </section>

      {/* 使い方 */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              毎朝、たった10分の習慣
            </h2>
            <p className="text-slate-500 text-sm">
              通勤中に聞くだけ。特別な準備は不要です
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {[
              { time: '7:00', text: '新着ニュースが届く' },
              { time: '7:30', text: '通勤電車で再生' },
              { time: '7:40', text: '10分で2〜3本聴ける' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="bg-slate-800 text-white px-4 py-2 rounded-lg font-mono text-sm mb-2">
                    {step.time}
                  </div>
                  <p className="text-slate-600 text-sm">{step.text}</p>
                </div>
                {i < 2 && (
                  <ChevronRight className="w-5 h-5 text-slate-300 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 口コミ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              利用者の声
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'T.K',
                role: 'IT企業 マネージャー・38歳',
                text: '海外クライアントとの会議が増えてきて、リスニング力を上げたいと思っていました。日本のニュースなら内容がわかるので、純粋に英語に集中できます。',
              },
              {
                name: 'M.S',
                role: 'メーカー 営業・42歳',
                text: '英語学習アプリは3つ挫折しましたが、これは続いてます。毎朝の通勤時間にサッと聞けるのがいい。字幕があるので聞き取れなくても確認できる安心感があります。',
              },
            ].map((review, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  {review.text}
                </p>
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
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              シンプルな料金
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {remaining !== null ? (
              <>
                <div className="text-center mb-6">
                  <p className="text-sm text-cyan-600 font-medium mb-2">
                    先着100名限定キャンペーン
                  </p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-slate-400 line-through text-xl">¥980</span>
                    <span className="text-4xl font-bold text-slate-800">¥450</span>
                    <span className="text-slate-500">/月</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    今入会で永久にこの価格が適用されます
                  </p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3 mb-6 text-center">
                  <p className="text-cyan-700 text-sm">
                    残り <span className="font-bold">{remaining}</span> 名
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-800">¥980</span>
                  <span className="text-slate-500">/月</span>
                </div>
              </div>
            )}

            <ul className="space-y-3 mb-6">
              {[
                '毎朝約20本のニュース配信',
                '英語・日本語字幕',
                '速度調整機能（0.7x〜1.0x）',
                'バックグラウンド再生',
                'いつでも解約可能',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/english/signup"
              className="block w-full py-4 bg-slate-800 text-white text-center rounded-xl font-bold hover:bg-slate-700 transition-colors"
            >
              今すぐ始める
            </Link>

            <p className="text-center text-xs text-slate-400 mt-4">
              クレジットカード決済 / いつでも解約可能
            </p>
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-20 px-4 bg-slate-800 text-white">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            明日の通勤から、始めませんか？
          </h2>
          <p className="text-slate-400 mb-8">
            毎日の積み重ねが、あなたのキャリアを変えます
          </p>

          <Link
            href="/english/signup"
            className="inline-flex items-center gap-2 bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-cyan-600 transition-colors"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-slate-500 text-sm mt-4">
            30秒で登録完了
          </p>
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
            <Link href="/english/terms" className="hover:text-slate-300">利用規約</Link>
            <Link href="/english/privacy" className="hover:text-slate-300">プライバシーポリシー</Link>
            <Link href="/english/legal" className="hover:text-slate-300">特定商取引法</Link>
          </div>
          <p className="text-xs text-slate-600">&copy; 2025 Edore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
