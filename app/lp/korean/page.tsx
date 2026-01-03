import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Headphones, Play, Volume2, MessageCircle, Heart, Sparkles, Music, Tv, ChevronRight } from 'lucide-react'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Roopy Korean | K-POPファンのための韓国語リスニング',
  description: '推しの言葉をもっと理解したい。Roopy Koreanは、K-POPやK-dramaファンのための韓国語リスニングアプリです。完全無料。',
  openGraph: {
    title: 'Roopy Korean | K-POPファンのための韓国語リスニング',
    description: '推しの言葉をもっと理解したい。K-POPやK-dramaファンのための韓国語リスニングアプリ。',
    type: 'website',
    images: ['/korean/og-image.png'],
  },
}

export default function KoreanLandingPage() {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-pink-50 to-white text-gray-800 ${notoSansJP.className}`}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-[1000px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/korean" className="flex items-center gap-2">
            <Image
              src="/korean/Roopy-Korean-icon.png"
              alt="Roopy Korean"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Roopy Korean
            </span>
          </Link>
          <Link
            href="/korean"
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-full font-bold text-sm hover:shadow-lg transition-shadow"
          >
            今すぐ始める
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden py-16 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[600px] mx-auto text-center">
          <div className="mb-6">
            <Image
              src="/korean/Roopy-Korean-icon.png"
              alt="Roopy Korean"
              width={120}
              height={120}
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              推しの言葉
            </span>
            を<br />
            もっと理解したい
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            K-POP、K-drama、バラエティ番組...<br />
            リアルな韓国語を聞いて、楽しく学ぼう
          </p>

          <Link
            href="/korean"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Play className="w-5 h-5" />
            無料で始める
          </Link>

          <p className="mt-4 text-sm text-gray-400">
            登録不要・完全無料
          </p>
        </div>
      </header>

      {/* Target Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            こんな人におすすめ
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <Music className="w-10 h-10 mx-auto mb-3 text-pink-500" />
              <h3 className="font-bold mb-2">K-POPファン</h3>
              <p className="text-sm text-gray-600">
                推しの歌詞やVLiveを<br />
                字幕なしで理解したい
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <Tv className="w-10 h-10 mx-auto mb-3 text-purple-500" />
              <h3 className="font-bold mb-2">ドラマ好き</h3>
              <p className="text-sm text-gray-600">
                韓ドラの台詞を<br />
                聞き取れるようになりたい
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-pink-400" />
              <h3 className="font-bold mb-2">旅行したい人</h3>
              <p className="text-sm text-gray-600">
                韓国で現地の人と<br />
                会話してみたい
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">
            2つの学習モード
          </h2>
          <p className="text-center text-gray-600 mb-10">
            リスニング力を効率的に鍛えます
          </p>

          <div className="space-y-6">
            {/* リスニング */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-pink-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center shrink-0">
                  <Headphones className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">リスニング</h3>
                    <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      メイン
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    2〜3行の韓国語を聞いて、内容を理解するクイズ形式。
                    空港アナウンス、カフェでの注文、友達との会話など、
                    実践的なシチュエーションで学べます。
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full">3問×10セット</span>
                    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full">速度調整可能</span>
                    <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full">スクリプト付き</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 単文聞き取り */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shrink-0">
                  <Volume2 className="w-7 h-7 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">単文聞き取り練習</h3>
                  <p className="text-gray-600 mb-4">
                    1文の韓国語を聞いて、正しい日本語の意味を選ぶシンプルなクイズ。
                    短いフレーズで語彙力と聞き取り力を同時に鍛えます。
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">5問ランダム出題</span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">4択形式</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">
            なぜリスニングが大切？
          </h2>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              韓国語は<strong className="text-pink-500">発音変化</strong>が多い言語。<br />
              文字だけ覚えても、実際の会話では聞き取れないことも。
            </p>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
              <p className="font-bold text-lg">
                <span className="text-pink-500">耳から覚える</span>ことで、<br />
                自然な韓国語が身につきます
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Situations Section */}
      <section className="py-16 px-4">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">
            様々なシチュエーション
          </h2>
          <p className="text-center text-gray-600 mb-10">
            実生活で使える場面を厳選
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { emoji: '✈️', label: '空港' },
              { emoji: '🚃', label: '電車' },
              { emoji: '☕', label: 'カフェ' },
              { emoji: '👫', label: '友達との会話' },
              { emoji: '🌤️', label: '天気予報' },
              { emoji: '🛍️', label: 'お店' },
              { emoji: '📞', label: '電話予約' },
              { emoji: '🗺️', label: '道案内' },
              { emoji: '🏫', label: '学校' },
              { emoji: '🍜', label: 'レストラン' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl p-4 text-center shadow-sm border border-pink-50 hover:border-pink-200 transition-colors"
              >
                <span className="text-2xl mb-2 block">{item.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-pink-500 to-purple-500 text-white">
        <div className="max-w-[600px] mx-auto text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            今日から韓国語リスニング<br />
            始めてみませんか？
          </h2>
          <p className="mb-8 opacity-90">
            登録不要・完全無料で、すぐに始められます
          </p>

          <Link
            href="/korean"
            className="inline-flex items-center gap-2 bg-white text-pink-500 text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            学習をスタート
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            よくある質問
          </h2>

          <div className="space-y-4">
            <div className="bg-pink-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">Q. 本当に無料ですか？</h3>
              <p className="text-gray-600">
                はい、すべての機能が完全無料です。広告もありません。
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">Q. 会員登録は必要ですか？</h3>
              <p className="text-gray-600">
                登録不要ですぐに始められます。アプリのダウンロードも不要です。
              </p>
            </div>

            <div className="bg-pink-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">Q. 初心者でも大丈夫ですか？</h3>
              <p className="text-gray-600">
                はい！音声の速度を0.8倍に落としたり、スクリプトを確認しながら学習できます。
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">Q. スマホで使えますか？</h3>
              <p className="text-gray-600">
                スマホ、タブレット、PCすべてで利用可能です。ブラウザからアクセスするだけでOK。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-10 px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="/korean/Roopy-Korean-icon.png"
                alt="Roopy Korean"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Roopy Korean
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/korean" className="hover:text-pink-500 transition-colors">
                ホーム
              </Link>
              <Link href="/korean/listening" className="hover:text-pink-500 transition-colors">
                リスニング
              </Link>
              <Link href="/korean/quiz" className="hover:text-pink-500 transition-colors">
                単文練習
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
            <p>&copy; 2025 Edore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
