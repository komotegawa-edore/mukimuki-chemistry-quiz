import Link from 'next/link'
import Image from 'next/image'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Headphones, Play, Clock, Target, Volume2, BarChart3, Repeat,
  HelpCircle, Frown, Timer, AlertCircle, ArrowDown, Star, Sparkles, TrendingUp,
  Award, Users, BookOpen, ArrowRight, Newspaper, Globe, Coffee, Briefcase, Train,
  Check, Crown
} from 'lucide-react'
import TryNewsPlayer from '@/components/TryNewsPlayer'
import EnglishPricingSection from '@/components/EnglishPricingSection'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '英語ニュースリスニング | Roopy English',
  description: '毎朝届く英語ニュースで、通勤時間を学習時間に。AIが生成する英語ニュースで、ビジネス英語力を毎日アップ。',
  openGraph: {
    title: '英語ニュースリスニング | Roopy English',
    description: '毎朝届く英語ニュースで、通勤時間を学習時間に。AIが生成する英語ニュースで、ビジネス英語力を毎日アップ。',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0891b2', // cyan-600
}

// ISR: 60秒ごとに再検証
export const revalidate = 60

export default function EnglishLandingPage() {
  return (
    <div className={`min-h-screen text-[#3A405A] ${notoSansJP.className} overflow-x-hidden bg-cyan-600`}>

      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-cyan-100 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-xl text-[#3A405A]">Roopy English</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/english/login"
              className="text-[#3A405A] hover:text-cyan-600 font-medium transition-colors hidden sm:block"
            >
              ログイン
            </Link>
            <Link
              href="/english/signup"
              className="bg-cyan-600 text-white px-6 py-2 rounded-full font-bold hover:bg-cyan-700 hover:shadow-lg hover:scale-105 transition-all"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-500" />

        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-3xl" />
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
            <Newspaper className="w-4 h-4" />
            毎朝届く英語ニュース
          </div>

          {/* メインタイトル */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            通勤時間を<br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              学習時間
            </span>
            に変える
          </h1>

          <p className="text-xl md:text-2xl mb-10 leading-relaxed opacity-90 font-medium">
            AIが毎朝、日本のニュースを英語でお届け<br className="hidden md:block" />
            自然な音声で、ビジネス英語が身につく
          </p>

          {/* 統計バッジ */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="font-bold">毎朝7時</span> に新着配信
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="font-bold">1本2-3分</span> で聞ける
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="font-bold">月額980円</span> から
            </div>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/english/news"
              className="group inline-flex items-center gap-2 bg-white text-cyan-600 text-lg font-bold py-4 px-8 rounded-full hover:bg-opacity-90 hover:scale-105 transition-all shadow-xl"
            >
              <Headphones className="w-5 h-5 group-hover:animate-bounce" />
              今日のニュースを聞く
            </Link>
            <Link
              href="/english/signup"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg font-bold py-4 px-8 rounded-full hover:scale-105 transition-all shadow-xl"
            >
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              無料で始める
            </Link>
          </div>

          <p className="mt-6 text-sm opacity-70">
            お試し視聴OK / Googleで30秒ログイン
          </p>
        </div>
      </header>

      {/* Screenshot Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Volume2 className="w-4 h-4" />
              機能紹介
            </div>
            <h2 className="text-4xl font-black mb-4">
              スマホで<span className="text-cyan-600">サクッと</span>、英語ニュース
            </h2>
            <p className="text-lg opacity-70">
              日本語字幕付きだから、内容を理解しながら聞ける
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
            {/* ニュース一覧画面 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="aspect-[9/16] relative">
                  <Image
                    src="/RoopyEnglish1.png"
                    alt="Roopy English ニュース一覧画面"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6 text-center bg-gradient-to-r from-cyan-50 to-teal-50">
                  <div className="inline-flex items-center gap-2 bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                    <Globe className="w-4 h-4" />
                    STEP 1
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-[#3A405A]">ニュースを選ぶ</h3>
                  <p className="text-sm opacity-70 text-[#3A405A]">興味のあるカテゴリから選択</p>
                </div>
              </div>
            </div>

            {/* 再生画面 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="aspect-[9/16] relative">
                  <Image
                    src="/RoopyEnglish2.png"
                    alt="Roopy English 再生画面"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6 text-center bg-gradient-to-r from-teal-50 to-emerald-50">
                  <div className="inline-flex items-center gap-2 bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                    <Headphones className="w-4 h-4" />
                    STEP 2
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-[#3A405A]">リスニング</h3>
                  <p className="text-sm opacity-70 text-[#3A405A]">字幕を見ながら音声を聞く</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Try Player Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Headphones className="w-4 h-4" />
              お試し
            </div>
            <h2 className="text-4xl font-black mb-4">
              今日のニュースを<span className="text-cyan-600">聞いてみる</span>
            </h2>
            <p className="text-lg opacity-70">
              登録不要・今すぐ再生できます
            </p>
          </div>

          <TryNewsPlayer />
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
                <p className="text-[#3A405A] font-medium">英語学習が続かない</p>
              </div>
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <Frown className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-[#3A405A] font-medium">教材が退屈でモチベが上がらない</p>
              </div>
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <Timer className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-[#3A405A] font-medium">まとまった学習時間が取れない</p>
              </div>
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-[#3A405A] font-medium">海外ニュースは難しすぎる</p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-4 rounded-full shadow-lg animate-bounce">
              <ArrowDown className="w-8 h-8" />
            </div>
          </div>

          {/* Solution */}
          <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-3xl shadow-xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-black text-center mb-2">
              Roopy Englishなら<span className="text-yellow-300">すべて解決</span>！
            </h2>
            <p className="text-center opacity-80 mb-8">日本のニュースだから、背景知識があって理解しやすい</p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">毎朝新鮮なニュース</h3>
                <p className="text-sm opacity-80">飽きずに続けられる</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">1本2-3分</h3>
                <p className="text-sm opacity-80">通勤電車でサクッと</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">日本語字幕付き</h3>
                <p className="text-sm opacity-80">内容を理解しながら聞ける</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              特徴
            </div>
            <h2 className="text-4xl font-black mb-4">
              Roopy Englishの<span className="text-teal-600">6つの強み</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Newspaper, title: '毎朝20本の新着ニュース', desc: '10カテゴリから厳選した多様なジャンル', color: 'cyan' },
              { icon: Clock, title: '1本2-3分', desc: '通勤電車の中でサクッと聞ける長さ', color: 'teal' },
              { icon: Globe, title: '日本のニュースを英語で', desc: '背景知識があるから理解しやすい', color: 'emerald' },
              { icon: Volume2, title: 'AIネイティブ音声', desc: 'AIが自然な英語音声を毎日生成', color: 'cyan' },
              { icon: BookOpen, title: '字幕 & 重要単語', desc: '日本語字幕とビジネス英語の語彙を同時に習得', color: 'teal' },
              { icon: Repeat, title: '速度調整機能', desc: '0.75x〜1.25xで自分のレベルに合わせて', color: 'emerald' },
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

      {/* How it works */}
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

          {/* スマホ用：縦並び */}
          <div className="space-y-6">
            {[
              { num: 1, title: 'ニュースを選ぶ', desc: '今日のニュース20本から興味のあるものを選択' },
              { num: 2, title: '音声を聞く', desc: '字幕を見ながら英語音声を聞く。速度調整も可能' },
              { num: 3, title: '語彙をチェック', desc: '重要単語を確認して、ビジネス英語力アップ' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                  {step.num}
                </div>
                <div className="flex-1 bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                  <h3 className="font-bold text-lg mb-1 text-[#3A405A]">{step.title}</h3>
                  <p className="opacity-70 text-[#3A405A] text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white">
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
              { icon: Headphones, title: 'リスニング力アップ', desc: '英語の音に慣れ、会議やプレゼンでの理解度が向上' },
              { icon: Briefcase, title: 'ビジネス英語の習得', desc: '実際のニュースで使われる表現が自然と身につく' },
              { icon: Target, title: '学習習慣の定着', desc: '毎朝の通勤が英語学習タイムに変わる' },
              { icon: Sparkles, title: '時事問題に強くなる', desc: '英語と日本の最新ニュースを同時にキャッチアップ' },
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

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Link
              href="/english/news"
              className="group inline-flex items-center gap-2 bg-white text-cyan-600 text-lg font-bold py-4 px-8 rounded-full hover:bg-opacity-90 hover:scale-105 transition-all shadow-xl"
            >
              <Headphones className="w-5 h-5 group-hover:animate-bounce" />
              今日のニュースを聞く
            </Link>
            <Link
              href="/english/signup"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg font-bold py-4 px-8 rounded-full hover:scale-105 transition-all shadow-xl"
            >
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              無料で始める
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <EnglishPricingSection />

      {/* Social Proof */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
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
                「毎朝の通勤電車で聞いてます。日本のニュースだから内容がわかりやすく、続けられてます！」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                  T
                </div>
                <div>
                  <p className="font-bold text-[#3A405A]">IT企業勤務・Tさん</p>
                  <p className="text-sm opacity-60">30代・利用歴1ヶ月</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-teal-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-4 text-[#3A405A] font-medium">
                「海外ニュースは背景がわからなくて挫折してたけど、これなら理解できる。字幕があるのも助かる」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <p className="font-bold text-[#3A405A]">メーカー勤務・Mさん</p>
                  <p className="text-sm opacity-60">40代・利用歴2週間</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-4xl font-black mb-4">
              よくある質問
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: '料金はいくらですか？', a: '月額980円または年間9,800円でご利用いただけます。年間プランは2ヶ月分お得です。' },
              { q: 'どのレベルの英語ですか？', a: 'CEFR A2〜B1レベル（英検準2級〜2級程度）を想定しています。日本語字幕付きなので、初心者でも安心して始められます。' },
              { q: 'スマホだけで使えますか？', a: 'はい、スマホのブラウザだけで利用できます。アプリのインストールは不要です。' },
              { q: '毎日何本のニュースが配信されますか？', a: '毎朝7時に20本の新着ニュースが配信されます。テクノロジー、ビジネス、スポーツ、エンタメ、国際、科学、健康、政治、経済、自動車の各カテゴリから2本ずつです。' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <summary className="p-6 font-bold cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <span className="text-[#3A405A]">{faq.q}</span>
                  <span className="text-cyan-600 group-open:rotate-180 transition-transform text-2xl">
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

      {/* Final CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* 背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-[700px] mx-auto text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/30">
              <Train className="w-12 h-12" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4">
            今日から、<span className="text-yellow-300">通勤を学習に</span>。
          </h2>
          <p className="text-xl mb-10 opacity-90">
            月額980円から・Googleで30秒ログイン<br />
            スマホ1つで始められます。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/english/news"
              className="group inline-flex items-center gap-2 bg-white text-cyan-600 text-xl font-bold py-5 px-10 rounded-full hover:bg-opacity-90 hover:scale-105 transition-all shadow-xl"
            >
              <Headphones className="w-6 h-6 group-hover:animate-bounce" />
              今日のニュースを聞く
            </Link>
            <Link
              href="/english/signup"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xl font-bold py-5 px-10 rounded-full hover:scale-105 transition-all shadow-xl"
            >
              <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              無料で始める
            </Link>
          </div>

          <p className="mt-8 text-sm opacity-70">
            お試し視聴OK / 年間プランなら2ヶ月分お得
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
                <span className="font-bold text-lg">Roopy English</span>
              </div>
              <p className="text-sm opacity-70">
                毎朝の通勤を、英語学習タイムに変える
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
                  <Link href="/english/news" className="opacity-70 hover:opacity-100 transition-opacity">
                    英語ニュース
                  </Link>
                </li>
                <li>
                  <Link href="/english/login" className="opacity-70 hover:opacity-100 transition-opacity">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/english/signup" className="opacity-70 hover:opacity-100 transition-opacity">
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
