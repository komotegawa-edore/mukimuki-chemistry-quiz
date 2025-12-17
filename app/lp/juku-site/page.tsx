import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import {
  Globe, Palette, Smartphone, Clock, Zap, CheckCircle,
  ArrowRight, Edit3, Image as ImageIcon, Layout, Search,
  Star, MessageCircle, Users, Building2
} from 'lucide-react'
import JukuSiteContactForm from './JukuSiteContactForm'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '塾サイトビルダー | 無料でプロ品質のホームページを作成',
  description: '学習塾専用のホームページ作成サービス。テンプレートを選んで情報を入力するだけで、スマホ対応のプロ品質サイトが無料で作れます。',
  openGraph: {
    title: '塾サイトビルダー | 無料でプロ品質のホームページを作成',
    description: '学習塾専用のホームページ作成サービス。テンプレートを選ぶだけで今日からサイト公開。',
    type: 'website',
  },
}

export default function JukuSiteLandingPage() {
  return (
    <div className={`min-h-screen bg-cyan-50 text-[#3A405A] ${notoSansJP.className}`}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-cyan-100 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/lp/juku-site" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#3A405A]">塾サイトビルダー</span>
          </Link>
          <Link
            href="#contact"
            className="bg-cyan-500 text-white px-6 py-2 rounded-full font-bold hover:bg-cyan-600 transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-cyan-100 to-cyan-50 py-16 px-4">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <Globe className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            学習塾の<br />ホームページが<br />
            <span className="text-cyan-600">無料</span>で作れる
          </h1>
          <p className="text-xl mb-2 font-bold text-cyan-600">
            塾サイトビルダー by Edore
          </p>
          <p className="text-lg mb-8 opacity-80">
            テンプレートを選んで情報を入力するだけ。<br />
            プログラミング不要でプロ品質のサイトが完成。
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="font-bold text-cyan-600">初期費用</span> 0円
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="font-bold text-cyan-600">月額</span> 0円
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="font-bold text-cyan-600">作成</span> 最短5分
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/juku-admin"
              className="inline-block bg-cyan-500 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:bg-cyan-600 hover:-translate-y-1 transition-all"
            >
              今すぐ無料で作成
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 bg-white text-cyan-600 text-lg font-bold py-4 px-10 rounded-full shadow-lg border-2 border-cyan-500 hover:bg-cyan-50 hover:-translate-y-1 transition-all"
            >
              機能を見る
            </Link>
          </div>
        </div>
      </header>

      {/* Demo Screenshot */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            こんなサイトが<span className="text-cyan-600">無料</span>で作れます
          </h2>
          <p className="text-center mb-10 opacity-70">
            スマホ・PC両対応のレスポンシブデザイン
          </p>

          <div className="bg-gradient-to-br from-cyan-100 to-teal-100 rounded-3xl p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-4">
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
                    <div className="h-16 bg-cyan-100 rounded"></div>
                    <div className="h-16 bg-cyan-100 rounded"></div>
                    <div className="h-16 bg-cyan-100 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-lg p-3 w-48">
                  <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-t-2xl p-3">
                    <div className="w-12 h-1 bg-white/50 rounded mx-auto"></div>
                  </div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-100 rounded mb-2 w-3/4 mx-auto"></div>
                    <div className="h-3 bg-gray-100 rounded mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded mb-4 w-5/6"></div>
                    <div className="h-8 bg-cyan-100 rounded mb-2"></div>
                    <div className="h-8 bg-cyan-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-cyan-50">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            こんな<span className="text-red-500">お悩み</span>ありませんか？
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              'ホームページを作りたいけど費用が高い',
              '業者に頼むと時間がかかる',
              '自分で更新できない',
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
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            塾サイトビルダーなら<span className="text-yellow-200">すべて解決</span>！
          </h2>
          <p className="text-lg mb-10 opacity-90">
            アカウント登録から公開まで、わずか5分。
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: '完全無料', desc: '初期費用も月額費用も0円' },
              { icon: Palette, title: 'テンプレート', desc: 'プロデザインから選ぶだけ' },
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
            塾サイトビルダーの<span className="text-cyan-500">機能</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Layout, title: 'テンプレート選択', desc: '塾に最適化されたデザインテンプレートから選択。カラーも自由に変更可能。' },
              { icon: Edit3, title: 'かんたん編集', desc: 'テキストを入力するだけ。ドラッグ＆ドロップでセクションの並び替えも。' },
              { icon: ImageIcon, title: '画像アップロード', desc: '教室の写真や講師の写真をアップロード。自動でサイズ調整。' },
              { icon: MessageCircle, title: 'お問い合わせフォーム', desc: '入塾相談のお問い合わせフォームが標準装備。通知も自動。' },
              { icon: Search, title: 'SEO対策済み', desc: '検索エンジンに最適化済み。「地域名 塾」で上位表示を狙える。' },
              { icon: Globe, title: 'カスタムドメイン', desc: '独自ドメインの設定にも対応。より本格的なサイト運営が可能。' },
            ].map((feature, i) => (
              <div key={i} className="bg-cyan-50 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shrink-0">
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
      <section className="py-16 px-4 bg-cyan-50">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            塾サイトに必要な<span className="text-cyan-500">すべて</span>が揃う
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
            かんたん<span className="text-cyan-500">3ステップ</span>
          </h2>

          <div className="space-y-6">
            {[
              { num: '01', title: 'アカウント作成', desc: 'メールアドレスで無料登録。30秒で完了。' },
              { num: '02', title: 'テンプレート選択＆情報入力', desc: 'デザインを選び、塾の情報を入力するだけ。' },
              { num: '03', title: '公開ボタンを押す', desc: 'ボタンひとつでサイト公開。すぐにURLが発行されます。' },
            ].map((step, i) => (
              <div key={i} className="bg-cyan-50 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 bg-cyan-500 text-white rounded-full flex items-center justify-center font-black text-xl shrink-0">
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
      <section className="py-16 px-4 bg-cyan-50">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            <span className="text-cyan-500">導入塾</span>の声
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: '個別指導塾A様',
                location: '大阪府',
                comment: 'ホームページ制作会社に見積もりを取ったら30万円と言われましたが、これなら無料で同じクオリティのサイトが作れました。',
              },
              {
                name: '進学塾B様',
                location: '兵庫県',
                comment: '以前のサイトはスマホで見づらかったのですが、新しいサイトは自動でスマホ対応してくれて助かっています。',
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
                  <Building2 className="w-4 h-4 text-cyan-500" />
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
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            料金プラン
          </h2>

          <div className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-3xl p-8 text-center">
            <p className="text-sm mb-2 opacity-80">フリープラン</p>
            <p className="text-5xl font-black mb-2">
              0<span className="text-2xl">円</span>
            </p>
            <p className="text-sm opacity-80 mb-6">ずっと無料でお使いいただけます</p>

            <ul className="text-left space-y-2 mb-6">
              {[
                'テンプレート利用',
                'スマホ対応サイト',
                'お問い合わせフォーム',
                'ブログ機能',
                'SSL（https）対応',
                'サブドメイン提供',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-yellow-300" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/juku-admin"
              className="inline-block bg-white text-cyan-600 font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-colors"
            >
              無料で始める
            </Link>
          </div>

          <p className="text-center mt-6 text-sm opacity-60">
            ※独自ドメイン設定などのオプションは別途ご相談ください
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            今すぐ始めましょう
          </h2>
          <p className="mb-8 opacity-90">
            5分後には、あなたの塾のホームページが完成しています。
          </p>
          <Link
            href="/juku-admin"
            className="inline-flex items-center gap-2 bg-white text-cyan-600 text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:bg-opacity-90 hover:-translate-y-1 transition-all"
          >
            無料でサイトを作成
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 px-4 bg-cyan-50">
        <div className="max-w-[500px] mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              お問い合わせ
            </h2>
            <p className="opacity-70">
              ご質問・ご相談はお気軽にどうぞ
            </p>
          </div>

          <JukuSiteContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3A405A] text-white py-8 px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">塾サイトビルダー</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/company" className="opacity-70 hover:opacity-100">会社概要</Link>
              <Link href="/juku-admin" className="opacity-70 hover:opacity-100">ログイン</Link>
              <Link href="#contact" className="opacity-70 hover:opacity-100">お問い合わせ</Link>
            </div>
          </div>
          <div className="text-center text-sm opacity-60">
            <p>&copy; 2025 Edore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
