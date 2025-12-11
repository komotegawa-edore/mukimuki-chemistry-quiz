import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Beaker, RotateCcw, Coins, Trophy, Gift, BarChart3, Sparkles, Headphones, FlaskConical, ArrowRight } from 'lucide-react'
import BlogCard from '@/components/BlogCard'
import { getBlogs } from '@/lib/microcms'

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

// ISR: 60秒ごとに再検証
export const revalidate = 60

export default async function LandingPage() {
  // 最新のブログ記事を3件取得
  const { contents: blogs } = await getBlogs({ limit: 3 })

  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(93, 223, 195, 0.05) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(93, 223, 195, 0.05) 0%, transparent 20%)
        `
      }}>

      {/* Navigation Header */}
      <nav className="bg-white border-b border-[#E0F7F1] sticky top-0 z-50">
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
              className="text-[#3A405A] hover:text-[#5DDFC3] font-medium transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="bg-[#5DDFC3] text-white px-6 py-2 rounded-full font-bold hover:bg-[#4ECFB3] transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-white to-[#F4F9F7] rounded-b-[40px] shadow-[0_4px_20px_rgba(93,223,195,0.1)] py-16 px-4 text-center">
        <div className="max-w-[860px] mx-auto">
          <div className="mb-8">
            <Image
              src="/Roopy-full-1.png"
              alt="Roopy（るーぴー）"
              width={300}
              height={100}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            大学受験を<br className="md:hidden" />"毎日つづけられる"ゲームにする
          </h1>

          <p className="text-lg mb-8 leading-relaxed">
            受験の森を旅するあなたのナビゲーター。<br />
            日々の学習を、少しのワクワクと、確かな達成感に変えていく。
          </p>

          <Link
            href="/signup"
            className="inline-block bg-[#5DDFC3] text-white text-lg font-bold py-4 px-12 rounded-full shadow-[0_8px_20px_rgba(93,223,195,0.4)] hover:shadow-[0_12px_24px_rgba(93,223,195,0.5)] hover:-translate-y-1 transition-all"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Screenshot Section */}
      <section className="max-w-[900px] mx-auto my-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          サクサク解いて、しっかり身につく。
        </h2>
        <p className="text-center mb-12 text-lg opacity-80">
          テンポの良いUIで、ゲーム感覚で学習できます
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-[700px] mx-auto">
          {/* クイズ画面 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-[9/16] relative">
              <Image
                src="/1.png"
                alt="クイズ画面 - 1問1答形式で学習"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-lg mb-1">1問1答クイズ</h3>
              <p className="text-sm opacity-70">サクサク解ける心地よさ</p>
            </div>
          </div>

          {/* ホーム画面 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-[9/16] relative">
              <Image
                src="/2.png"
                alt="ホーム画面 - 章一覧とポイント表示"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-lg mb-1">学習ホーム</h3>
              <p className="text-sm opacity-70">成長を実感できる</p>
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
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <Headphones className="w-12 h-12 mx-auto mb-4 text-[#5DDFC3]" />
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">英語リスニング</h3>
            <p className="opacity-70 text-[#3A405A]">90問の音声付き問題で耳を鍛える</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <Beaker className="w-12 h-12 mx-auto mb-4 text-[#5DDFC3]" />
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">無機化学テスト</h3>
            <p className="opacity-70 text-[#3A405A]">1問1答形式でサクサク進む</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <RotateCcw className="w-12 h-12 mx-auto mb-4 text-[#5DDFC3]" />
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">復習・履歴管理</h3>
            <p className="opacity-70 text-[#3A405A]">間違えた問題を効率的に復習</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <Coins className="w-12 h-12 mx-auto mb-4 text-[#5DDFC3]" />
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">ポイント機能</h3>
            <p className="opacity-70 text-[#3A405A]">学習するたび努力が数値化</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-[#5DDFC3]" />
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">ランキング</h3>
            <p className="opacity-70 text-[#3A405A]">ライバルと切磋琢磨（匿名OK）</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
            <Gift className="w-12 h-12 mx-auto mb-4 text-[#5DDFC3]" />
            <h3 className="text-xl font-bold mb-2 text-[#3A405A]">ログインボーナス</h3>
            <p className="opacity-70 text-[#3A405A]">毎日の習慣化をサポート</p>
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
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-[500px] mx-auto">
            <div>
              <FlaskConical className="w-8 h-8 mb-2 text-[#5DDFC3]" />
              <h3 className="font-bold mb-1">有機化学</h3>
              <p className="text-sm opacity-80">構造式・反応系統図</p>
            </div>
            <div>
              <Sparkles className="w-8 h-8 mb-2 text-[#5DDFC3]" />
              <h3 className="font-bold mb-1">学習計画・ミッション</h3>
              <p className="text-sm opacity-80">ゲーム要素で継続</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {blogs.length > 0 && (
        <section className="max-w-[1200px] mx-auto my-16 px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">
              最新のブログ記事
            </h2>
            <p className="text-lg opacity-80">
              受験勉強のコツやRoopyの使い方をお届けします
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#5DDFC3] font-bold hover:gap-3 transition-all"
            >
              すべての記事を見る
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="bg-gradient-to-b from-[#F4F9F7] to-white rounded-t-[40px] py-16 px-4 text-center mt-20">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            さあ、今日から始めましょう。
          </h2>
          <p className="text-lg mb-10 opacity-80">
            すべての機能が完全無料。<br />
            面倒な手続きなし、すぐに始められます。
          </p>

          <Link
            href="/signup"
            className="inline-block bg-[#5DDFC3] text-white text-xl font-bold py-5 px-16 rounded-full shadow-[0_8px_20px_rgba(93,223,195,0.4)] hover:shadow-[0_12px_24px_rgba(93,223,195,0.5)] hover:-translate-y-1 transition-all"
          >
            無料で利用を開始する
          </Link>

          <p className="mt-8 text-sm opacity-60">
            Googleで簡単ログイン
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0F7F1] py-12 px-4 mt-16">
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
                  <Link href="/blog" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
                    ブログ
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
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
                  className="inline-flex items-center gap-2 text-sm text-[#5DDFC3] hover:text-[#4ECFB3] font-medium transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @Edore_handai
                </a>
                <a
                  href="mailto:k.omotegawa@edore-edu.com"
                  className="block text-sm text-[#5DDFC3] hover:text-[#4ECFB3] font-medium transition-colors"
                >
                  k.omotegawa@edore-edu.com
                </a>
              </div>
            </div>
          </div>

          {/* コピーライト */}
          <div className="border-t border-[#E0F7F1] pt-6 text-center text-sm opacity-60">
            <p>&copy; 2025 Edore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
