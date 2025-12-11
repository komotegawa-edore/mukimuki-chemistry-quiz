import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Headphones, Play, CheckCircle, Clock, Target, Zap, Volume2, BarChart3, Repeat,
  HelpCircle, Frown, Timer, AlertCircle, ArrowDown, Star, Mic, Sparkles, TrendingUp,
  Award, Users, BookOpen
} from 'lucide-react'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '英語リスニング練習 | Roopy（るーぴー）',
  description: '共通テスト対策に最適！90問の音声付きリスニング問題で耳を鍛える。毎日5分から始められる無料の英語リスニングトレーニング。',
  openGraph: {
    title: '英語リスニング練習 | Roopy（るーぴー）',
    description: '共通テスト対策に最適！90問の音声付きリスニング問題で耳を鍛える。毎日5分から始められる無料の英語リスニングトレーニング。',
    type: 'website',
  },
}

export default function ListeningLandingPage() {
  return (
    <div className={`min-h-screen text-[#3A405A] ${notoSansJP.className} overflow-x-hidden`}>

      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-xl text-[#3A405A]">Roopy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[#3A405A] hover:text-indigo-600 font-medium transition-colors hidden sm:block"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - 豪華版 */}
      <header className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />

        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl" />
        </div>

        {/* 波形パターン */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-white">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-[900px] mx-auto px-4 text-center text-white">
          {/* バッジ */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-bold mb-8 border border-white/30">
            <Sparkles className="w-4 h-4" />
            共通テスト対策 リスニング特訓
          </div>

          {/* メインタイトル */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            毎日5分で<br />
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              英語耳
            </span>
            をつくる
          </h1>

          <p className="text-xl md:text-2xl mb-10 leading-relaxed opacity-90 font-medium">
            90問の厳選された音声問題 + シャドーイング機能<br className="hidden md:block" />
            スマホでいつでもどこでも、耳と口を鍛えよう
          </p>

          {/* 統計バッジ */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="font-bold">90問</span> の音声問題
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="font-bold">30セット</span> で段階学習
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="font-bold">完全無料</span>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/try/listening"
              className="group inline-flex items-center gap-2 bg-white text-indigo-600 text-lg font-bold py-4 px-8 rounded-full hover:bg-opacity-90 hover:scale-105 transition-all shadow-xl"
            >
              <Headphones className="w-5 h-5 group-hover:animate-bounce" />
              まずはお試し（3問）
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg font-bold py-4 px-8 rounded-full hover:scale-105 transition-all shadow-xl"
            >
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              無料で始める
            </Link>
          </div>

          <p className="mt-6 text-sm opacity-70">
            登録不要でお試しできます / Googleで30秒ログイン
          </p>
        </div>
      </header>

      {/* Screenshot Section - 豪華版 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Volume2 className="w-4 h-4" />
              機能紹介
            </div>
            <h2 className="text-4xl font-black mb-4">
              スマホで<span className="text-indigo-600">サクサク</span>、リスニング練習
            </h2>
            <p className="text-lg opacity-70">
              音声を聞いて4択で回答。シャドーイングで発音も鍛える
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
            {/* リスニング問題画面 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="aspect-[9/16] relative">
                  <Image
                    src="/listening-quiz.png"
                    alt="リスニング問題画面"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 text-center bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                    <Headphones className="w-4 h-4" />
                    STEP 1
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-[#3A405A]">リスニング問題</h3>
                  <p className="text-sm opacity-70 text-[#3A405A]">音声を聞いて4択から選択</p>
                </div>
              </div>
            </div>

            {/* シャドーイング画面 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="aspect-[9/16] relative">
                  <Image
                    src="/shadowing.png"
                    alt="シャドーイング画面"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 text-center bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                    <Mic className="w-4 h-4" />
                    STEP 2
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-[#3A405A]">シャドーイング</h3>
                  <p className="text-sm opacity-70 text-[#3A405A]">スクリプトを見ながら発音練習</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[900px] mx-auto">
          {/* Problem */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100">
            <h2 className="text-3xl font-black text-center mb-8">
              こんな<span className="text-red-500">悩み</span>、ありませんか？
            </h2>

            <div className="grid md:grid-cols-2 gap-4 max-w-[700px] mx-auto">
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <HelpCircle className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-[#3A405A] font-medium">リスニングの勉強法がわからない</p>
              </div>
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <Frown className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-[#3A405A] font-medium">音声教材を用意するのが面倒</p>
              </div>
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <Timer className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-[#3A405A] font-medium">まとまった時間が取れない</p>
              </div>
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-[#3A405A] font-medium">続けられるか不安</p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg animate-bounce">
              <ArrowDown className="w-8 h-8" />
            </div>
          </div>

          {/* Solution */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-black text-center mb-2">
              Roopyなら<span className="text-yellow-300">すべて解決</span>！
            </h2>
            <p className="text-center opacity-80 mb-8">スマホ1つで、効率的にリスニング力アップ</p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">90問の音声問題</h3>
                <p className="text-sm opacity-80">共通テストレベルの厳選問題</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">1セット3問</h3>
                <p className="text-sm opacity-80">スキマ時間でサクッと</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">シャドーイング</h3>
                <p className="text-sm opacity-80">発音も同時に鍛える</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - 豪華版 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              特徴
            </div>
            <h2 className="text-4xl font-black mb-4">
              Roopyリスニングの<span className="text-purple-600">6つの強み</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Volume2, title: '90問の音声問題', desc: '共通テストレベルの厳選された問題で実践力を養成', color: 'indigo' },
              { icon: Clock, title: '1セット3問', desc: 'スキマ時間で取り組める。通学中・休憩中にサクッと', color: 'purple' },
              { icon: Repeat, title: '繰り返し再生', desc: '聞き取れるまで何度でも。自分のペースで練習', color: 'pink' },
              { icon: Target, title: '即時フィードバック', desc: '解答後すぐに正誤確認。効率的に学習できる', color: 'orange' },
              { icon: BarChart3, title: '進捗の可視化', desc: '学習履歴・正答率がひと目でわかる', color: 'green' },
              { icon: Zap, title: 'ポイント獲得', desc: 'クリアするたびポイントGET。モチベーション維持', color: 'yellow' },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#3A405A]">{feature.title}</h3>
                <p className="opacity-70 text-[#3A405A]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - 豪華版 */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <BookOpen className="w-4 h-4" />
              使い方
            </div>
            <h2 className="text-4xl font-black mb-4">
              <span className="text-green-600">かんたん</span>3ステップ
            </h2>
          </div>

          <div className="relative">
            {/* 接続線 */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 -translate-x-1/2" />

            <div className="space-y-8">
              {[
                { num: 1, title: 'セットを選ぶ', desc: '30セットから好きなものを選択（各3問）', color: 'indigo' },
                { num: 2, title: '音声を聞いて解答', desc: '再生ボタンを押して、4択から選択', color: 'purple' },
                { num: 3, title: '結果確認 & シャドーイング', desc: '正答率を確認して、シャドーイングで発音練習', color: 'pink' },
              ].map((step, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`inline-block bg-white rounded-2xl shadow-lg p-6 border border-gray-100`}>
                      <h3 className="font-bold text-xl mb-2 text-[#3A405A]">{step.title}</h3>
                      <p className="opacity-70 text-[#3A405A]">{step.desc}</p>
                    </div>
                  </div>
                  <div className={`relative z-10 w-16 h-16 bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 text-white rounded-full flex items-center justify-center font-black text-2xl shadow-lg shrink-0`}>
                    {step.num}
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-4 border border-white/30">
              <TrendingUp className="w-4 h-4" />
              効果
            </div>
            <h2 className="text-4xl font-black mb-4">
              毎日続けると...
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Headphones, title: 'リスニング力アップ', desc: '英語の音に慣れ、聞き取れる範囲が広がる' },
              { icon: Award, title: '共通テスト対策', desc: '本番形式に近い問題で実践力を養成' },
              { icon: Target, title: '学習習慣の定着', desc: '短時間で続けやすいから習慣化できる' },
              { icon: Sparkles, title: '自信がつく', desc: '成長を実感してモチベーションアップ' },
            ].map((benefit, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{benefit.title}</h3>
                  <p className="text-sm opacity-80">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - 豪華版 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Users className="w-4 h-4" />
              利用者の声
            </div>
            <h2 className="text-4xl font-black mb-4">
              みんなの<span className="text-yellow-600">体験談</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-4 text-[#3A405A] font-medium">
                「通学中の電車で毎日やってます。1セット3問だから続けやすい！」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <p className="font-bold text-[#3A405A]">高校3年生・Aさん</p>
                  <p className="text-sm opacity-60">利用歴2ヶ月</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-4 text-[#3A405A] font-medium">
                「リスニングの勉強ってハードル高かったけど、これなら気軽にできる」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold">
                  B
                </div>
                <div>
                  <p className="font-bold text-[#3A405A]">高校2年生・Bさん</p>
                  <p className="text-sm opacity-60">利用歴1ヶ月</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - 豪華版 */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-4xl font-black mb-4">
              よくある質問
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: '本当に無料ですか？', a: 'はい、完全無料です。登録も利用も一切お金はかかりません。' },
              { q: 'どのレベルの問題ですか？', a: '共通テストレベルを想定した問題を用意しています。高校1年生から取り組めます。' },
              { q: 'スマホだけで使えますか？', a: 'はい、スマホのブラウザだけで利用できます。アプリのインストールは不要です。' },
              { q: '1日どれくらいやればいいですか？', a: '1セット（3問）から始めてみてください。慣れてきたら2〜3セットがおすすめです。毎日続けることが大切です。' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <summary className="p-6 font-bold cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <span className="text-[#3A405A]">{faq.q}</span>
                  <span className="text-indigo-600 group-open:rotate-180 transition-transform text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="opacity-70 text-[#3A405A]">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - 豪華版 */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* 背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-[700px] mx-auto text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/30">
              <Headphones className="w-12 h-12" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4">
            今日から、<span className="text-yellow-300">耳を鍛えよう</span>。
          </h2>
          <p className="text-xl mb-10 opacity-90">
            完全無料・登録30秒<br />
            スマホ1つで始められます。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/try/listening"
              className="group inline-flex items-center gap-2 bg-white text-indigo-600 text-xl font-bold py-5 px-10 rounded-full hover:bg-opacity-90 hover:scale-105 transition-all shadow-xl"
            >
              <Headphones className="w-6 h-6 group-hover:animate-bounce" />
              お試し（3問）
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xl font-bold py-5 px-10 rounded-full hover:scale-105 transition-all shadow-xl"
            >
              <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              無料で始める
            </Link>
          </div>

          <p className="mt-8 text-sm opacity-70">
            登録不要でお試し / Googleで簡単ログイン
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-white py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/Roopy-icon.png"
                  alt="Roopy"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="font-bold text-lg">Roopy</span>
              </div>
              <p className="text-sm opacity-70">
                大学受験を"毎日つづけられる"ゲームにする
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-3">サービス</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/lp" className="opacity-70 hover:opacity-100 transition-opacity">
                    Roopyトップ
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="opacity-70 hover:opacity-100 transition-opacity">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="opacity-70 hover:opacity-100 transition-opacity">
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">お問い合わせ</h3>
              <p className="text-sm opacity-70 mb-3">
                ご質問・ご要望はXのDM、または下記まで
              </p>
              <div className="space-y-2">
                <a
                  href="https://x.com/Edore_handai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @Edore_handai
                </a>
                <a
                  href="mailto:k.omotegawa@edore-edu.com"
                  className="block text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  k.omotegawa@edore-edu.com
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-sm opacity-60">
            <p>&copy; 2025 Edore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
