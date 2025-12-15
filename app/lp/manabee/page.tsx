import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import {
  MessageCircle, BarChart3, Users, Clock, Zap, CheckCircle,
  ArrowRight, Smartphone, Monitor, School
} from 'lucide-react'
import ManabeeContactFormWrapper from '@/components/manabee/ManabeeContactFormWrapper'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MANABEE（まなビーくん）| LINEで完結する出席管理アプリ',
  description: 'アプリ不要、導入5分。生徒はLINEで「登校」を押すだけ。出席記録が自動でスプレッドシートに反映され、座席表もリアルタイム更新。',
  openGraph: {
    title: 'MANABEE（まなビーくん）| LINEで完結する出席管理アプリ',
    description: 'アプリ不要、導入5分。生徒はLINEで「登校」を押すだけで出席管理が完了。',
    type: 'website',
  },
}

export default function ManabeeLandingPage() {
  return (
    <div className={`min-h-screen bg-amber-50 text-[#3A405A] ${notoSansJP.className}`}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/lp/manabee" className="flex items-center gap-2">
            <Image
              src="/manabee-logo.png"
              alt="まなビーくん"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-xl text-[#3A405A]">MANABEE</span>
          </Link>
          <Link
            href="#contact"
            className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold hover:bg-amber-600 transition-colors"
          >
            お問い合わせ
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-amber-100 to-amber-50 py-16 px-4">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="mb-6">
            <Image
              src="/manabee-logo.png"
              alt="まなビーくん"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            LINEで完結する<br />出席管理アプリ
          </h1>
          <p className="text-xl mb-2 font-bold text-amber-600">
            MANABEE（まなビーくん）
          </p>
          <p className="text-lg mb-8 opacity-80">
            アプリ不要。導入5分。<br />
            今日から使える出席管理。
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="font-bold text-amber-600">1週間体験</span> 無料
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="font-bold">生徒1名</span> 100円/月
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="#contact"
              className="inline-block bg-amber-500 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:bg-amber-600 hover:-translate-y-1 transition-all"
            >
              無料で試してみる
            </Link>
            <Link
              href="?type=document#contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-amber-600 text-lg font-bold py-4 px-10 rounded-full shadow-lg border-2 border-amber-500 hover:bg-amber-50 hover:-translate-y-1 transition-all"
            >
              資料ダウンロード
            </Link>
          </div>
        </div>
      </header>

      {/* Demo Screenshot */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            スマホとPCで、かんたん出席管理
          </h2>
          <p className="text-center mb-10 opacity-70">
            生徒はLINEで出席報告、講師はPCで座席表を確認
          </p>

          <div className="bg-gray-100 rounded-3xl p-4 md:p-8">
            <Image
              src="/manabee-demo.png"
              alt="MANABEEデモ画面 - LINEと座席表"
              width={800}
              height={600}
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-amber-50">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            こんな<span className="text-red-500">お悩み</span>ありませんか？
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              '出席確認に毎回時間がかかる',
              '紙の出席簿の管理が大変',
              '座席表を手書きで更新している',
              '欠席連絡の管理が煩雑',
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
      <section className="py-16 px-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            MANABEEなら<span className="text-yellow-200">すべて解決</span>！
          </h2>
          <p className="text-lg mb-10 opacity-90">
            LINEでワンタップ。あとは自動で全部やります。
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MessageCircle, title: 'LINE連携', desc: '生徒は「登校」ボタンを押すだけ' },
              { icon: BarChart3, title: '自動記録', desc: 'スプレッドシートに即時反映' },
              { icon: Users, title: '座席表更新', desc: 'リアルタイムで誰がどこにいるか把握' },
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
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            MANABEEの<span className="text-amber-500">特徴</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Smartphone, title: 'アプリ不要', desc: 'LINEだけで完結。生徒も保護者もインストール不要。' },
              { icon: Clock, title: '導入5分', desc: 'LINE公式アカウントを友だち追加するだけで即日利用開始。' },
              { icon: Monitor, title: 'PC管理画面', desc: '座席表や出席履歴をリアルタイムで確認。' },
              { icon: Zap, title: '自動集計', desc: '月末の集計作業も自動化。業務時間を大幅削減。' },
            ].map((feature, i) => (
              <div key={i} className="bg-amber-50 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
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

      {/* How it works */}
      <section className="py-16 px-4 bg-amber-50">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            かんたん<span className="text-amber-500">3ステップ</span>
          </h2>

          <div className="space-y-6">
            {[
              { num: '01', title: '友だち追加', desc: 'LINE公式アカウント「まなビーくん」を友だち追加' },
              { num: '02', title: '登校ボタンをタップ', desc: '塾に着いたら「登校」ボタンを押すだけ' },
              { num: '03', title: '自動で記録', desc: '出席情報がスプレッドシートと座席表に即時反映' },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-xl shrink-0">
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

      {/* Pricing */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            料金プラン
          </h2>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-8 text-center">
            <p className="text-sm mb-2 opacity-80">生徒1名あたり</p>
            <p className="text-5xl font-black mb-2">
              100<span className="text-2xl">円/月</span>
            </p>
            <p className="text-sm opacity-80 mb-6">※導入サポート費用は塾の規模に応じてご相談</p>

            <div className="bg-white/20 rounded-2xl p-4 mb-6">
              <p className="font-bold mb-2">1週間無料体験</p>
              <p className="text-sm opacity-80">まずは無料でお試しください</p>
            </div>

            <ul className="text-left space-y-2 mb-6">
              {[
                'LINE出席管理',
                'スプレッドシート連携',
                'リアルタイム座席表',
                '出席履歴の自動集計',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-yellow-300" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="#contact"
              className="inline-block bg-white text-amber-600 font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-colors"
            >
              無料体験を申し込む
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 px-4 bg-amber-50">
        <div className="max-w-[500px] mx-auto">
          <div className="text-center mb-8">
            <Image
              src="/manabee-logo.png"
              alt="まなビーくん"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold mb-2">
              無料体験のお申し込み
            </h2>
            <p className="opacity-70">
              1週間無料でお試しいただけます
            </p>
          </div>

          <ManabeeContactFormWrapper />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3A405A] text-white py-8 px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Image
                src="/manabee-logo.png"
                alt="まなビーくん"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-bold">MANABEE</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/company" className="opacity-70 hover:opacity-100">会社概要</Link>
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
