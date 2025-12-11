import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Beaker, RotateCcw, Coins, Trophy, Gift, BarChart3,
  Sparkles, BookOpen, Brain, Target, CheckCircle2,
  Clock, Zap, Users, ArrowRight, Menu, Smartphone, TrendingDown,
  HelpCircle, Map, Compass, Calendar, Route
} from 'lucide-react'
import BlogHeader from '@/components/BlogHeader'
import BlogCard from '@/components/BlogCard'
import { getBlogs } from '@/lib/microcms'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Roopy（るーぴー）| 大学受験を毎日続けられるゲームにする',
  description: '無機化学・英単語・古文単語のクイズで毎日の学習をサポート。ポイント機能やランキングでモチベーション維持。学習ロードマップ機能も近日公開予定。',
  alternates: {
    canonical: '/home',
  },
}

// ISR: 60秒ごとに再検証
export const revalidate = 60

export default async function HomePage() {
  // 最新のブログ記事を3件取得
  const { contents: blogs } = await getBlogs({ limit: 3 })

  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}>
      <BlogHeader />

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-white to-[#F4F9F7] py-16 md:py-24 px-4">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/Roopy-full-1.png"
              alt="Roopy（るーぴー）"
              width={280}
              height={100}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            大学受験を<br className="md:hidden" />
            <span className="text-[#5DDFC3]">"毎日つづけられる"</span>
            <br className="md:hidden" />ゲームにする
          </h1>
          <p className="text-lg md:text-xl mb-8 leading-relaxed opacity-80 max-w-[600px] mx-auto">
            1問1答クイズで無機化学・英単語・古文単語をマスター。<br />
            ポイントやランキングで、毎日の学習が楽しくなる。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-block bg-[#5DDFC3] text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              無料で始める
            </Link>
            <Link
              href="/blog"
              className="inline-block bg-white text-[#3A405A] text-lg font-bold py-4 px-10 rounded-full border-2 border-[#E0F7F1] hover:border-[#5DDFC3] transition-all"
            >
              ブログを読む
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-60">
            登録は30秒で完了
          </p>
        </div>
      </header>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            こんな悩み、ありませんか？
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFF5F5] rounded-2xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#FFE0E0] rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-[#E57373]" />
              </div>
              <p className="font-bold">今何をやるべきか分からない</p>
              <p className="text-sm opacity-70 mt-2">情報が多すぎて迷子になる</p>
            </div>
            <div className="bg-[#FFF5F5] rounded-2xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#FFE0E0] rounded-full flex items-center justify-center">
                <Beaker className="w-6 h-6 text-[#E57373]" />
              </div>
              <p className="font-bold">暗記科目が覚えられない</p>
              <p className="text-sm opacity-70 mt-2">覚えることが多すぎて混乱する</p>
            </div>
            <div className="bg-[#FFF5F5] rounded-2xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#FFE0E0] rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-[#E57373]" />
              </div>
              <p className="font-bold">気づいたらスマホをいじってる</p>
              <p className="text-sm opacity-70 mt-2">勉強しようと思ったのに...</p>
            </div>
            <div className="bg-[#FFF5F5] rounded-2xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#FFE0E0] rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-[#E57373]" />
              </div>
              <p className="font-bold">成果が見えなくてモチベが下がる</p>
              <p className="text-sm opacity-70 mt-2">頑張っているのに実感がない</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="inline-block bg-[#5DDFC3] text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
            Roopyなら解決できます
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            スマホを「勉強の味方」に変える
          </h2>
          <p className="text-lg opacity-80 mb-12 max-w-[600px] mx-auto">
            1問1答形式のクイズで、スキマ時間にサクサク学習。<br />
            ゲーム感覚だから、気づいたら勉強してる。
          </p>

          {/* Screenshots */}
          <div className="grid md:grid-cols-2 gap-8 max-w-[700px] mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-[9/16] relative">
                <Image
                  src="/1.png"
                  alt="クイズ画面"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">1問1答クイズ</h3>
                <p className="text-sm opacity-70">サクサク解ける心地よさ</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-[9/16] relative">
                <Image
                  src="/2.png"
                  alt="ホーム画面"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">学習ホーム</h3>
                <p className="text-sm opacity-70">成長を実感できる</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            対応科目
          </h2>
          <p className="text-center opacity-70 mb-12">
            受験に必要な暗記科目をカバー
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#F4F9F7] rounded-2xl p-8 text-center">
              <Beaker className="w-16 h-16 mx-auto mb-4 text-[#5DDFC3]" />
              <h3 className="text-xl font-bold mb-2">無機化学</h3>
              <p className="text-sm opacity-70 mb-4">33章・約500問</p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  反応式・沈殿・色
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  気体の性質
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  金属イオンの検出
                </li>
              </ul>
            </div>

            <div className="bg-[#F4F9F7] rounded-2xl p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#5DDFC3]" />
              <h3 className="text-xl font-bold mb-2">英単語</h3>
              <p className="text-sm opacity-70 mb-4">シス単・ターゲット対応</p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  システム英単語
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  ターゲット1900
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  4択 or フラッシュカード
                </li>
              </ul>
            </div>

            <div className="bg-[#F4F9F7] rounded-2xl p-8 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-[#5DDFC3]" />
              <h3 className="text-xl font-bold mb-2">古文単語</h3>
              <p className="text-sm opacity-70 mb-4">315・ゴロゴ対応</p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  古文単語315
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  ゴロゴプレミアム
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3]" />
                  意味・活用をマスター
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            続けられる仕組み
          </h2>
          <p className="text-center opacity-70 mb-12">
            ゲーミフィケーションで学習を習慣化
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4">
              <div className="bg-[#E0F7F1] p-3 rounded-xl">
                <Coins className="w-8 h-8 text-[#5DDFC3]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">ポイント機能</h3>
                <p className="text-sm opacity-70">問題を解くたびにポイントGET。努力が数字で見える。</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4">
              <div className="bg-[#E0F7F1] p-3 rounded-xl">
                <Trophy className="w-8 h-8 text-[#5DDFC3]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">ランキング</h3>
                <p className="text-sm opacity-70">全国のライバルと競争。匿名だから気軽に参加。</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4">
              <div className="bg-[#E0F7F1] p-3 rounded-xl">
                <Gift className="w-8 h-8 text-[#5DDFC3]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">ログインボーナス</h3>
                <p className="text-sm opacity-70">毎日ログインでボーナスポイント。習慣化をサポート。</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4">
              <div className="bg-[#E0F7F1] p-3 rounded-xl">
                <RotateCcw className="w-8 h-8 text-[#5DDFC3]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">復習機能</h3>
                <p className="text-sm opacity-70">間違えた問題だけを効率的に復習。弱点を克服。</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4">
              <div className="bg-[#E0F7F1] p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-[#5DDFC3]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">学習記録</h3>
                <p className="text-sm opacity-70">章ごとの正答率を記録。成長の過程を可視化。</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4">
              <div className="bg-[#E0F7F1] p-3 rounded-xl">
                <Zap className="w-8 h-8 text-[#5DDFC3]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">サクサクUI</h3>
                <p className="text-sm opacity-70">ストレスフリーな操作感。集中が途切れない。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            使い方は簡単3ステップ
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#5DDFC3] text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">無料で登録</h3>
              <p className="text-sm opacity-70">Googleアカウントで30秒で完了</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#5DDFC3] text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">科目を選ぶ</h3>
              <p className="text-sm opacity-70">無機化学・英単語・古文単語から選択</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#5DDFC3] text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">クイズを解く</h3>
              <p className="text-sm opacity-70">1問1答でサクサク学習開始</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              受験生に選ばれています
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <p className="opacity-90">問題数</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">33</div>
                <p className="opacity-90">無機化学の章</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4冊</div>
                <p className="opacity-90">対応教材</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            よくある質問
          </h2>

          <div className="space-y-6">
            <div className="bg-[#F4F9F7] rounded-2xl p-6">
              <h3 className="font-bold mb-2">料金はかかりますか？</h3>
              <p className="text-sm opacity-70">現在は無料でご利用いただけます。今後機能追加に伴い、一部有料プランを導入する可能性があります。</p>
            </div>
            <div className="bg-[#F4F9F7] rounded-2xl p-6">
              <h3 className="font-bold mb-2">スマホでもPCでも使えますか？</h3>
              <p className="text-sm opacity-70">はい、Webアプリなのでどちらでも利用できます。スマホではホーム画面に追加するとアプリのように使えます。</p>
            </div>
            <div className="bg-[#F4F9F7] rounded-2xl p-6">
              <h3 className="font-bold mb-2">どの教材に対応していますか？</h3>
              <p className="text-sm opacity-70">英単語はシステム英単語・ターゲット1900、古文単語は古文単語315・ゴロゴプレミアムに対応しています。</p>
            </div>
            <div className="bg-[#F4F9F7] rounded-2xl p-6">
              <h3 className="font-bold mb-2">学習データは保存されますか？</h3>
              <p className="text-sm opacity-70">はい、ログインすることで学習履歴や正答率がすべて保存されます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {blogs.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
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
          </div>
        </section>
      )}

      {/* Coming Soon Section */}
      <section className="py-16 px-4">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block bg-[#5DDFC3]/10 text-[#3A9A85] text-sm font-bold px-4 py-2 rounded-full mb-4">
              Coming Soon
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              あなただけの学習ロードマップ
            </h2>
            <p className="text-lg opacity-80 max-w-[600px] mx-auto">
              目標・現在地・残り時間から、最適な学習ルートを提案。<br />
              もう「何をやればいいか」で迷わない。
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#F0FDF9] to-[#E0F7F1] rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <Target className="w-6 h-6 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">志望校を設定</h3>
                    <p className="text-sm opacity-70">目標に必要な学力を逆算</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <Compass className="w-6 h-6 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">現在地を診断</h3>
                    <p className="text-sm opacity-70">得意・苦手を分析</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <Calendar className="w-6 h-6 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">残り時間を考慮</h3>
                    <p className="text-sm opacity-70">本番までの日数と勉強可能時間</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <Route className="w-6 h-6 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">最適ルートを提案</h3>
                    <p className="text-sm opacity-70">今日やるべきことが明確に</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <Map className="w-20 h-20 mx-auto mb-4 text-[#5DDFC3] opacity-50" />
                  <p className="text-lg font-bold text-[#3A405A]/50">準備中...</p>
                  <p className="text-sm opacity-50 mt-2">近日公開予定</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#F4F9F7] to-white">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            さあ、今日から始めよう
          </h2>
          <p className="text-lg mb-10 opacity-80">
            面倒な手続きなし、30秒で始められます。
          </p>

          <Link
            href="/signup"
            className="inline-block bg-[#5DDFC3] text-white text-xl font-bold py-5 px-16 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            無料で始める
          </Link>

          <p className="mt-8 text-sm opacity-60">
            Googleアカウントで簡単ログイン
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0F7F1] py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
                <span className="font-bold text-lg">Roopy</span>
              </div>
              <p className="text-sm opacity-70">
                大学受験を"毎日つづけられる"ゲームにする
              </p>
            </div>

            {/* サービス */}
            <div>
              <h3 className="font-bold mb-3">サービス</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog" className="opacity-70 hover:text-[#5DDFC3] transition-colors">
                    ブログ
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="opacity-70 hover:text-[#5DDFC3] transition-colors">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="opacity-70 hover:text-[#5DDFC3] transition-colors">
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>

            {/* 法的情報 */}
            <div>
              <h3 className="font-bold mb-3">法的情報</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="opacity-70 hover:text-[#5DDFC3] transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="opacity-70 hover:text-[#5DDFC3] transition-colors">
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>

            {/* お問い合わせ */}
            <div>
              <h3 className="font-bold mb-3">お問い合わせ</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="https://x.com/Edore_handai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#5DDFC3] hover:text-[#4ECFB3] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @Edore_handai
                </a>
                <a
                  href="mailto:k.omotegawa@edore-edu.com"
                  className="block text-[#5DDFC3] hover:text-[#4ECFB3] transition-colors"
                >
                  k.omotegawa@edore-edu.com
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0F7F1] pt-6 text-center text-sm opacity-60">
            <p>&copy; 2025 Edore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
