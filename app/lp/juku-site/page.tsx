import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Palette, Smartphone, CheckCircle, Globe,
  ArrowRight, Edit3, Image as ImageIcon, Layout, Search,
  Star, MessageCircle, Building2, FileText, Phone
} from 'lucide-react'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JUKUBA（ジュクバ）| 塾専用ホームページ作成サービス',
  description: '塾専用のホームページ作成サービス。10種類のテンプレートから選んで、自分で簡単に更新できるサイトが作れます。初期設定代行プランもあり。',
  icons: {
    icon: '/images/jukuba-icon.png',
    apple: '/images/jukuba-icon.png',
  },
  openGraph: {
    title: 'JUKUBA（ジュクバ）| 塾専用ホームページ作成サービス',
    description: '塾専用ホームページ。テンプレートを選んで自分で更新。初期設定代行もOK。',
    type: 'website',
  },
}

export default function JukuSiteLandingPage() {
  return (
    <div className={`min-h-screen bg-slate-50 text-[#3A405A] ${notoSansJP.className}`}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/lp/juku-site" className="flex items-center">
            <Image
              src="/images/jukuba-logo.png"
              alt="JUKUBA"
              width={160}
              height={45}
              className="h-10 w-auto"
            />
          </Link>
          <Link
            href="/lp/juku-site/contact"
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition-colors"
          >
            無料相談・資料請求
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-indigo-100 to-slate-50 py-16 px-4">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/images/jukuba-logo.png"
              alt="JUKUBA - 塾専用ホームページ"
              width={320}
              height={90}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            <span className="text-indigo-600">自分で更新</span>できる<br />
            塾専用ホームページ
          </h1>
          <p className="text-lg mb-8 opacity-80">
            10種類のテンプレートから選んで、<br />
            塾長自身で簡単に更新できるサイトが完成。
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white px-5 py-3 rounded-full shadow-sm">
              <span className="font-bold text-indigo-600 text-lg">月額 2,980円〜</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="font-bold text-indigo-600">テンプレート</span> 10種類
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="font-bold text-indigo-600">関西圏</span> 対面サポート
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/lp/juku-site/contact"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all"
            >
              <Phone className="w-5 h-5" />
              無料相談する
            </Link>
            <Link
              href="/lp/juku-site/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 text-lg font-bold py-4 px-10 rounded-full shadow-lg border-2 border-indigo-500 hover:bg-indigo-50 hover:-translate-y-1 transition-all"
            >
              <FileText className="w-5 h-5" />
              資料をダウンロード
            </Link>
          </div>
        </div>
      </header>

      {/* Demo Screenshot */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            <span className="text-indigo-600">10種類</span>のテンプレートから選べる
          </h2>
          <p className="text-center mb-10 opacity-70">
            塾のタイプに合わせたデザインをご用意
          </p>

          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-8 bg-gray-100 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded mb-2 w-5/6"></div>
                  <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="h-16 bg-indigo-100 rounded"></div>
                    <div className="h-16 bg-indigo-100 rounded"></div>
                    <div className="h-16 bg-indigo-100 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-lg p-3 w-48">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-3">
                    <div className="w-12 h-1 bg-white/50 rounded mx-auto"></div>
                  </div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-100 rounded mb-2 w-3/4 mx-auto"></div>
                    <div className="h-3 bg-gray-100 rounded mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded mb-4 w-5/6"></div>
                    <div className="h-8 bg-indigo-100 rounded mb-2"></div>
                    <div className="h-8 bg-indigo-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-slate-100">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            こんな<span className="text-red-500">お悩み</span>ありませんか？
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              'ホームページを業者に頼むと高い（30万〜）',
              '作ってもらっても自分で更新できない',
              '更新のたびに業者に依頼が必要',
              'スマホ対応していない古いサイト',
            ].map((problem, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-red-100 flex items-center gap-3">
                <span className="text-red-400 text-2xl">×</span>
                <p className="font-medium">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            JUKUBAなら<span className="text-yellow-200">すべて解決</span>！
          </h2>
          <p className="text-lg mb-10 opacity-90">
            塾長自身で更新できるから、ずっと使える。
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Edit3, title: '自分で更新', desc: '文章・写真を自由に変更' },
              { icon: Palette, title: '10テンプレート', desc: '塾に最適化されたデザイン' },
              { icon: Smartphone, title: 'スマホ対応', desc: '自動でレスポンシブ対応' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <item.icon className="w-10 h-10 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            JUKUBAの<span className="text-indigo-600">機能</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Layout, title: 'テンプレート選択', desc: '塾に最適化された10種類のテンプレートから選択。カラーも自由に変更可能。' },
              { icon: Edit3, title: 'かんたん編集', desc: 'テキストを入力するだけ。ドラッグ＆ドロップでセクションの並び替えも。' },
              { icon: ImageIcon, title: '画像アップロード', desc: '教室の写真や講師の写真をアップロード。自動でサイズ調整。' },
              { icon: MessageCircle, title: 'お問い合わせフォーム', desc: '入塾相談のお問い合わせフォームが標準装備。通知も自動。' },
              { icon: Search, title: 'SEO対策済み', desc: '検索エンジンに最適化済み。「地域名 塾」で上位表示を狙える。' },
              { icon: Globe, title: 'カスタムドメイン', desc: '独自ドメインの設定にも対応。より本格的なサイト運営が可能。' },
            ].map((feature, i) => (
              <div key={i} className="bg-indigo-50 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm opacity-70">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections included */}
      <section className="py-16 px-4 bg-slate-100">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            塾サイトに必要な<span className="text-indigo-600">すべて</span>が揃う
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'ヒーロー（メインビジュアル）',
              'コース・料金表',
              '講師紹介',
              '合格実績',
              '教室の特徴',
              '時間割',
              'よくある質問（FAQ）',
              'アクセス・地図',
              'お問い合わせフォーム',
              'ブログ機能',
              'ギャラリー',
              '保護者の声',
            ].map((section, i) => (
              <div key={i} className="bg-white p-3 rounded-xl text-center text-sm font-medium shadow-sm">
                {section}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            ご利用の<span className="text-indigo-600">流れ</span>
          </h2>

          <div className="space-y-6">
            {[
              { num: '01', title: '無料相談', desc: 'お問い合わせフォームから相談。ご要望をヒアリングします。' },
              { num: '02', title: 'テンプレート選択＆情報提供', desc: 'お好みのデザインを選び、塾の情報（文章・写真）をご提供。' },
              { num: '03', title: '初期設定＆公開', desc: '初期設定を代行し、サイト公開。その後は自分で更新できます。' },
            ].map((step, i) => (
              <div key={i} className="bg-indigo-50 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xl shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm opacity-70">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-slate-100">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            <span className="text-indigo-600">導入塾</span>の声
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: '個別指導塾A様',
                location: '大阪府',
                comment: 'ホームページ制作会社に見積もりを取ったら30万円と言われましたが、JUKUBAなら初期費用も安く、自分で更新できるので助かっています。',
              },
              {
                name: '進学塾B様',
                location: '兵庫県',
                comment: '以前のサイトは更新のたびに業者に頼んでいましたが、今は自分ですぐに更新できるので、タイムリーな情報発信ができています。',
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed">「{testimonial.comment}」</p>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold">{testimonial.name}</span>
                  <span className="opacity-60">({testimonial.location})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            料金
          </h2>
          <p className="text-center mb-10 opacity-70">
            月額費用のみでスタートできます
          </p>

          {/* メイン料金 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl p-8 text-center mb-8">
            <p className="text-sm opacity-80 mb-2">月額利用料</p>
            <div className="mb-2">
              <span className="text-5xl font-black">2,980</span>
              <span className="text-2xl">円〜</span>
              <span className="text-sm opacity-60 ml-2">（税込）</span>
            </div>
            <p className="text-sm opacity-80 mb-6">ご要望に応じてプランをご提案します</p>

            <ul className="text-left max-w-md mx-auto space-y-2 mb-8">
              {[
                '10種類の塾専用テンプレート',
                '自分で更新できる管理画面',
                'スマホ対応レスポンシブデザイン',
                'お問い合わせフォーム',
                'ブログ機能',
                'SSL（https）対応',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-yellow-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/lp/juku-site/contact"
              className="inline-block bg-white text-indigo-600 font-bold py-3 px-10 rounded-full hover:bg-opacity-90 transition-colors"
            >
              無料で相談する
            </Link>
          </div>

          {/* 初期費用について */}
          <div className="bg-slate-100 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3 text-center">初期費用について</h3>
            <p className="text-sm text-center opacity-70 mb-4">
              塾の規模やご要望に応じてお見積りいたします。
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-indigo-600 mb-1">シンプル</p>
                <p className="opacity-70">テンプレートそのまま</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-indigo-600 mb-1">スタンダード</p>
                <p className="opacity-70">初期設定代行込み</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-indigo-600 mb-1">プレミアム</p>
                <p className="opacity-70">写真撮影・相談付き</p>
              </div>
            </div>
          </div>

          <p className="text-center mt-8 text-sm opacity-60">
            ※関西圏（大阪・兵庫・京都・奈良・滋賀・和歌山）限定サービスです
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            まずは無料相談から
          </h2>
          <p className="mb-8 opacity-90">
            塾のホームページについてお気軽にご相談ください。<br />
            対面でのヒアリングも可能です。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/lp/juku-site/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:bg-opacity-90 hover:-translate-y-1 transition-all"
            >
              <Phone className="w-5 h-5" />
              無料相談する
            </Link>
            <Link
              href="/lp/juku-site/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white text-lg font-bold py-4 px-10 rounded-full border-2 border-white/50 hover:bg-white/30 hover:-translate-y-1 transition-all"
            >
              <FileText className="w-5 h-5" />
              資料請求
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3A405A] text-white py-8 px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Image
                src="/images/jukuba-icon.png"
                alt="JUKUBA"
                width={32}
                height={32}
              />
              <span className="font-bold">JUKUBA</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/company" className="opacity-70 hover:opacity-100">会社概要</Link>
              <Link href="/lp/juku-site/contact" className="opacity-70 hover:opacity-100">お問い合わせ</Link>
            </div>
          </div>
          <div className="text-center text-sm opacity-60">
            <p>&copy; 2025 Edore Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
