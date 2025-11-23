import Link from 'next/link'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Roopy（るーぴー）| 大学受験学習アプリ',
  description: '大学受験を"毎日つづけられる"ゲームにする。Roopyは、受験生の学習習慣を応援する無料の学習アプリです。',
  openGraph: {
    title: 'Roopy（るーぴー）| 大学受験学習アプリ',
    description: '大学受験を"毎日つづけられる"ゲームにする。Roopyは、受験生の学習習慣を応援する無料の学習アプリです。',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(93, 223, 195, 0.05) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(93, 223, 195, 0.05) 0%, transparent 20%)
        `
      }}>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-white to-[#F4F9F7] rounded-b-[40px] shadow-[0_4px_20px_rgba(93,223,195,0.1)] py-16 px-4 text-center">
        <div className="max-w-[860px] mx-auto">
          <div className="text-[#5DDFC3] text-xl mb-2 font-bold">
            Roopy（るーぴー）
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            大学受験を<br className="md:hidden" />"毎日つづけられる"ゲームにする
          </h1>

          <div className="w-44 h-44 bg-[#E0F7F1] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg relative">
            <span className="text-8xl">🌱</span>
            <span className="absolute -bottom-10 text-sm opacity-60">[ロゴ＋るーぴーのビジュアル]</span>
          </div>

          <p className="text-lg mb-8 leading-relaxed">
            受験の森を旅するあなたのナビゲーター。<br />
            日々の学習を、少しのワクワクと、確かな達成感に変えていく。
          </p>

          <Link
            href="/login"
            className="inline-block bg-[#5DDFC3] text-white text-lg font-bold py-4 px-12 rounded-full shadow-[0_8px_20px_rgba(93,223,195,0.4)] hover:shadow-[0_12px_24px_rgba(93,223,195,0.5)] hover:-translate-y-1 transition-all"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Screenshot Section */}
      <section className="max-w-[1100px] mx-auto my-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          サクサク解いて、しっかり身につく。
        </h2>
        <p className="text-center mb-12 text-lg opacity-80">
          テンポの良いUIで、ゲーム感覚で学習できます
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* クイズ画面 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-[9/16] bg-gradient-to-br from-[#E0F7F1] to-[#5DDFC3]/20 flex items-center justify-center relative">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🧪</span>
                <p className="text-sm opacity-60">[クイズ画面]</p>
              </div>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-lg mb-1">1問1答クイズ</h3>
              <p className="text-sm opacity-70">サクサク解ける心地よさ</p>
            </div>
          </div>

          {/* ランキング画面 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-[9/16] bg-gradient-to-br from-[#FFE5B4] to-[#FFD700]/20 flex items-center justify-center relative">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🏆</span>
                <p className="text-sm opacity-60">[ランキング画面]</p>
              </div>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-lg mb-1">ランキング</h3>
              <p className="text-sm opacity-70">ライバルと切磋琢磨</p>
            </div>
          </div>

          {/* 履歴画面 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-[9/16] bg-gradient-to-br from-[#E8D5F2] to-[#B19CD9]/20 flex items-center justify-center relative">
              <div className="text-center">
                <span className="text-6xl mb-4 block">📊</span>
                <p className="text-sm opacity-60">[履歴画面]</p>
              </div>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-lg mb-1">学習履歴</h3>
              <p className="text-sm opacity-70">成長を可視化</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="max-w-[860px] mx-auto my-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">
            「続かない」を、「続けられる」に。
          </h2>
          <p className="text-lg mb-8 leading-relaxed opacity-80">
            受験勉強が続かないのは、あなたの意志が弱いからではありません。<br />
            成果が見えづらく、孤独で、単調になりがちだから。
          </p>

          <div className="bg-[#E0F7F1] p-6 rounded-2xl font-bold text-xl">
            Roopyは、学習をゲームのように楽しく、<br className="hidden md:block" />
            毎日の積み重ねを目に見える成果に変えます。
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-[900px] mx-auto my-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Roopyの特徴
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">🧪</div>
            <h3 className="text-xl font-bold mb-2">無機化学テスト</h3>
            <p className="opacity-70">1問1答形式でサクサク進む</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">復習・履歴管理</h3>
            <p className="opacity-70">間違えた問題を効率的に復習</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">ポイント機能</h3>
            <p className="opacity-70">学習するたび努力が数値化</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">ランキング</h3>
            <p className="opacity-70">ライバルと切磋琢磨（匿名OK）</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2">ログインボーナス</h3>
            <p className="opacity-70">毎日の習慣化をサポート</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">学習記録</h3>
            <p className="opacity-70">成長の過程を可視化</p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="max-w-[860px] mx-auto my-16 px-4">
        <div className="bg-[#3A405A] text-white rounded-2xl p-10 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-[#5DDFC3] mb-6">
            Coming Soon
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Roopyは、これからも進化していきます。
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-3xl mb-2">⚗️</div>
              <h3 className="font-bold mb-1">有機化学</h3>
              <p className="text-sm opacity-80">構造式・反応系統図</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎧</div>
              <h3 className="font-bold mb-1">英語リスニング</h3>
              <p className="text-sm opacity-80">スキマ時間で学習</p>
            </div>
            <div>
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-bold mb-1">学習計画・ミッション</h3>
              <p className="text-sm opacity-80">ゲーム要素で継続</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-gradient-to-b from-[#F4F9F7] to-white rounded-t-[40px] py-16 px-4 text-center mt-20">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            さあ、今日から始めましょう。
          </h2>
          <p className="text-lg mb-10 opacity-80">
            すべての機能が完全無料。<br />
            面倒な手続きなし、すぐに始められます。
          </p>

          <Link
            href="/login"
            className="inline-block bg-[#5DDFC3] text-white text-xl font-bold py-5 px-16 rounded-full shadow-[0_8px_20px_rgba(93,223,195,0.4)] hover:shadow-[0_12px_24px_rgba(93,223,195,0.5)] hover:-translate-y-1 transition-all"
          >
            無料で利用を開始する
          </Link>

          <p className="mt-8 text-sm opacity-60">
            GoogleアカウントやApple IDで簡単ログイン
          </p>
        </div>
      </footer>
    </div>
  )
}
