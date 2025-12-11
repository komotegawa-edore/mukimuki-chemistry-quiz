import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Headphones, Play, CheckCircle, Clock, Target, Zap, Volume2, BarChart3, Repeat, HelpCircle, Frown, Timer, AlertCircle, ArrowDown, Star } from 'lucide-react'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
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
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.05) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(79, 70, 229, 0.05) 0%, transparent 20%)
        `
      }}>

      {/* Navigation Header */}
      <nav className="bg-white border-b border-indigo-100 sticky top-0 z-50">
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
              className="text-[#3A405A] hover:text-indigo-600 font-medium transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-indigo-50 to-[#F4F9F7] rounded-b-[40px] shadow-[0_4px_20px_rgba(79,70,229,0.1)] py-16 px-4 text-center">
        <div className="max-w-[860px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Headphones className="w-4 h-4" />
            共通テスト対策
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            毎日5分の<br className="md:hidden" />
            <span className="text-indigo-600">リスニング</span>で<br />
            英語耳をつくる
          </h1>

          <p className="text-lg mb-8 leading-relaxed opacity-80">
            90問の厳選された音声問題で、<br className="md:hidden" />
            共通テストのリスニングに強くなる。<br />
            スマホでいつでもどこでも、耳を鍛えよう。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/try/listening"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 text-lg font-bold py-4 px-10 rounded-full border-2 border-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <Headphones className="w-5 h-5" />
              まずはお試し（3問）
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-lg font-bold py-4 px-10 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_24px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all"
            >
              <Play className="w-5 h-5" />
              無料で始める
            </Link>
          </div>

          <p className="mt-4 text-sm opacity-60">
            登録不要でお試しできます
          </p>
        </div>
      </header>

      {/* Screenshot Section */}
      <section className="max-w-[900px] mx-auto my-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          スマホでサクサク、リスニング練習
        </h2>
        <p className="text-center mb-12 text-lg opacity-70">
          音声を聞いて4択で回答。シャドーイングで発音も鍛える
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-[700px] mx-auto">
          {/* リスニング問題画面 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-[9/16] relative">
              <Image
                src="/listening-quiz.png"
                alt="リスニング問題画面 - 音声を聞いて4択で回答"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-lg mb-1 text-[#3A405A]">リスニング問題</h3>
              <p className="text-sm opacity-70 text-[#3A405A]">音声を聞いて4択から選択</p>
            </div>
          </div>

          {/* シャドーイング画面 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-[9/16] relative">
              <Image
                src="/shadowing.png"
                alt="シャドーイング画面 - スクリプトを見ながら発音練習"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-lg mb-1 text-[#3A405A]">シャドーイング</h3>
              <p className="text-sm opacity-70 text-[#3A405A]">スクリプトを見ながら発音練習</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-[860px] mx-auto my-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            こんな悩み、ありませんか？
          </h2>

          <div className="space-y-4 max-w-[600px] mx-auto">
            <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl">
              <HelpCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[#3A405A]">リスニングの勉強法がわからない...</p>
            </div>
            <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl">
              <Frown className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[#3A405A]">音声教材を用意するのが面倒...</p>
            </div>
            <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl">
              <Timer className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[#3A405A]">まとまった時間が取れない...</p>
            </div>
            <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[#3A405A]">続けられるか不安...</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-6 py-3 rounded-full font-bold">
              <ArrowDown className="w-5 h-5" />
              Roopyならすべて解決！
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-[900px] mx-auto my-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          Roopyリスニングの特徴
        </h2>
        <p className="text-center mb-12 text-lg opacity-70">
          スマホ1つで、効率的にリスニング力アップ
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">90問の音声問題</h3>
            <p className="opacity-70 text-[#3A405A] text-sm">
              共通テストレベルの厳選された問題で実践力を養成
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">1セット3問</h3>
            <p className="opacity-70 text-[#3A405A] text-sm">
              スキマ時間で取り組める。通学中・休憩中にサクッと
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Repeat className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">繰り返し再生</h3>
            <p className="opacity-70 text-[#3A405A] text-sm">
              聞き取れるまで何度でも。自分のペースで練習
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">即時フィードバック</h3>
            <p className="opacity-70 text-[#3A405A] text-sm">
              解答後すぐに正誤確認。効率的に学習できる
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">進捗の可視化</h3>
            <p className="opacity-70 text-[#3A405A] text-sm">
              学習履歴・正答率がひと目でわかる
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">ポイント獲得</h3>
            <p className="opacity-70 text-[#3A405A] text-sm">
              クリアするたびポイントGET。モチベーション維持
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[860px] mx-auto my-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          学習の流れ
        </h2>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">セットを選ぶ</h3>
              <p className="opacity-70 text-sm">30セットから好きなものを選択（各3問）</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">音声を聞いて解答</h3>
              <p className="opacity-70 text-sm">再生ボタンを押して、4択から選択</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">
              3
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">結果を確認</h3>
              <p className="opacity-70 text-sm">正答率とポイントを確認。間違えた問題は復習</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-[860px] mx-auto my-16 px-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            毎日続けると...
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-indigo-200 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">リスニング力アップ</h3>
                <p className="text-sm opacity-80">英語の音に慣れ、聞き取れる範囲が広がる</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-indigo-200 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">共通テスト対策</h3>
                <p className="text-sm opacity-80">本番形式に近い問題で実践力を養成</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-indigo-200 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">学習習慣の定着</h3>
                <p className="text-sm opacity-80">短時間で続けやすいから習慣化できる</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-indigo-200 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">自信がつく</h3>
                <p className="text-sm opacity-80">成長を実感してモチベーションアップ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-[860px] mx-auto my-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          利用者の声
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="mb-4 text-[#3A405A]">
              「通学中の電車で毎日やってます。1セット3問だから続けやすい！」
            </p>
            <p className="text-sm opacity-60">高校3年生・Aさん</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="mb-4 text-[#3A405A]">
              「リスニングの勉強ってハードル高かったけど、これなら気軽にできる」
            </p>
            <p className="text-sm opacity-60">高校2年生・Bさん</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[860px] mx-auto my-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          よくある質問
        </h2>

        <div className="space-y-4">
          <details className="bg-white rounded-2xl shadow-sm p-6 group">
            <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
              本当に無料ですか？
              <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 opacity-70">
              はい、完全無料です。登録も利用も一切お金はかかりません。
            </p>
          </details>

          <details className="bg-white rounded-2xl shadow-sm p-6 group">
            <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
              どのレベルの問題ですか？
              <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 opacity-70">
              共通テストレベルを想定した問題を用意しています。高校1年生から取り組めます。
            </p>
          </details>

          <details className="bg-white rounded-2xl shadow-sm p-6 group">
            <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
              スマホだけで使えますか？
              <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 opacity-70">
              はい、スマホのブラウザだけで利用できます。アプリのインストールは不要です。
            </p>
          </details>

          <details className="bg-white rounded-2xl shadow-sm p-6 group">
            <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
              1日どれくらいやればいいですか？
              <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 opacity-70">
              1セット（3問）から始めてみてください。慣れてきたら2〜3セットがおすすめです。毎日続けることが大切です。
            </p>
          </details>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-[#F4F9F7] to-white rounded-t-[40px] py-16 px-4 text-center mt-20">
        <div className="max-w-[700px] mx-auto">
          <div className="mb-6">
            <Headphones className="w-16 h-16 mx-auto text-indigo-600" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            今日から、耳を鍛えよう。
          </h2>
          <p className="text-lg mb-10 opacity-80">
            完全無料・登録30秒<br />
            スマホ1つで始められます。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/try/listening"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 text-xl font-bold py-5 px-12 rounded-full border-2 border-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <Headphones className="w-6 h-6" />
              お試し（3問）
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xl font-bold py-5 px-12 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_24px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all"
            >
              <Play className="w-6 h-6" />
              無料で始める
            </Link>
          </div>

          <p className="mt-8 text-sm opacity-60">
            登録不要でお試し / Googleで簡単ログイン
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-indigo-100 py-12 px-4 mt-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* ブランド */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/Roopy-icon.png"
                  alt="Roopy"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="font-bold text-lg text-[#3A405A]">Roopy</span>
              </div>
              <p className="text-sm opacity-70">
                大学受験を"毎日つづけられる"ゲームにする
              </p>
            </div>

            {/* リンク */}
            <div>
              <h3 className="font-bold mb-3 text-[#3A405A]">サービス</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/lp" className="opacity-70 hover:opacity-100 hover:text-indigo-600 transition-colors">
                    Roopyトップ
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="opacity-70 hover:opacity-100 hover:text-indigo-600 transition-colors">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="opacity-70 hover:opacity-100 hover:text-indigo-600 transition-colors">
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>

            {/* SNS・お問い合わせ */}
            <div>
              <h3 className="font-bold mb-3 text-[#3A405A]">お問い合わせ</h3>
              <p className="text-sm opacity-70 mb-3">
                ご質問・ご要望はXのDM、または下記のメールアドレスまで
              </p>
              <div className="space-y-2">
                <a
                  href="https://x.com/Edore_handai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @Edore_handai
                </a>
                <a
                  href="mailto:k.omotegawa@edore-edu.com"
                  className="block text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  k.omotegawa@edore-edu.com
                </a>
              </div>
            </div>
          </div>

          {/* コピーライト */}
          <div className="border-t border-indigo-100 pt-6 text-center text-sm opacity-60">
            <p>&copy; 2025 Edore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
