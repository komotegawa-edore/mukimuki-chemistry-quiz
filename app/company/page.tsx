import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import {
  GraduationCap, Headphones, Mail, MapPin, Building2,
  Lightbulb, Heart, Target, ArrowRight, ExternalLink,
  Sparkles, BookOpen, Users, Rocket, ChevronRight, Menu, X,
  School, Zap, BarChart3, Settings
} from 'lucide-react'
import CompanyHeader from '@/components/company/CompanyHeader'
import ContactForm from '@/components/company/ContactForm'
import TypeWriter from '@/components/company/TypeWriter'
import FadeInSection from '@/components/company/FadeInSection'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Edore | 教育×テクノロジーで、学びをもっと楽しく',
  description: 'Edoreは、教育×テクノロジーで学習体験を革新するスタートアップです。大学受験向けアプリRoopyと英語ニュースサービスRoopy Englishを提供しています。',
  openGraph: {
    title: 'Edore | 教育×テクノロジーで、学びをもっと楽しく',
    description: 'Edoreは、教育×テクノロジーで学習体験を革新するスタートアップです。',
    type: 'website',
  },
}

export default function CompanyPage() {
  return (
    <div className={`min-h-screen bg-white text-[#3A405A] ${notoSansJP.className}`}>
      {/* Navigation Header */}
      <CompanyHeader />

      {/* Hero Section */}
      <section id="top" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A405A] via-[#4A506A] to-[#5A607A]" />

        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#5DDFC3]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5DDFC3]/10 rounded-full blur-3xl" />
        </div>

        {/* 波形パターン */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-white">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-[900px] mx-auto px-4 text-center text-white">
          {/* ロゴ */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <Image
              src="/edore-logo.png"
              alt="Edore"
              width={80}
              height={80}
              className="rounded-xl"
            />
            <span className="text-5xl md:text-6xl font-black tracking-tight">Edore</span>
          </div>

          {/* メインタイトル */}
          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
            教育×テクノロジーで、<br />
            <span className="bg-gradient-to-r from-[#5DDFC3] via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              学びをもっと楽しく
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-10 leading-relaxed opacity-90 max-w-2xl mx-auto">
            私たちは、テクノロジーの力で教育に革新をもたらし、<br className="hidden md:block" />
            すべての学習者が楽しく成長できる環境を創ります。
          </p>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#services"
              className="group inline-flex items-center gap-2 bg-[#5DDFC3] text-[#3A405A] text-lg font-bold py-4 px-8 rounded-full hover:bg-[#4ECFB3] hover:scale-105 transition-all shadow-xl"
            >
              サービスを見る
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#contact"
              className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-lg font-bold py-4 px-8 rounded-full border border-white/30 hover:bg-white/20 hover:scale-105 transition-all"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section id="concept" className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-[900px] mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#E0F7F1] text-[#3A405A] px-4 py-2 rounded-full text-sm font-bold mb-4">
                <Lightbulb className="w-4 h-4 text-[#5DDFC3]" />
                CONCEPT
              </div>
              <h2 className="text-4xl font-black mb-6">
                コンセプト
              </h2>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="bg-gradient-to-br from-[#F4F9F7] to-white rounded-3xl p-8 md:p-12 shadow-lg border border-[#E0F7F1]">
              <div className="text-xl md:text-2xl leading-relaxed text-center mb-12 font-medium min-h-[120px] md:min-h-[100px]">
                <TypeWriter
                  texts={[
                    '「続かない」を「続けられる」に変える。',
                    '学習の壁を取り除き、誰もが自分のペースで成長できる世界を。',
                    '教育×テクノロジーで、学びをもっと楽しく。',
                  ]}
                  speed={80}
                  deleteSpeed={40}
                  pauseTime={3000}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <FadeInSection delay={100} direction="up">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#5DDFC3]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 hover:scale-110 hover:rotate-3 transition-transform">
                      <Heart className="w-8 h-8 text-[#5DDFC3]" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">楽しさを設計する</h3>
                    <p className="text-sm opacity-70">
                      ゲーム要素やUI/UXデザインで、学習を続けたくなる体験を
                    </p>
                  </div>
                </FadeInSection>
                <FadeInSection delay={200} direction="up">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 hover:scale-110 hover:rotate-3 transition-transform">
                      <Target className="w-8 h-8 text-cyan-500" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">成果を可視化する</h3>
                    <p className="text-sm opacity-70">
                      努力が数値や成長として見える仕組みでモチベーションを維持
                    </p>
                  </div>
                </FadeInSection>
                <FadeInSection delay={300} direction="up">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 hover:scale-110 hover:rotate-3 transition-transform">
                      <Rocket className="w-8 h-8 text-teal-500" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">習慣化を支援する</h3>
                    <p className="text-sm opacity-70">
                      毎日続けられる仕掛けで、学習を生活の一部に
                    </p>
                  </div>
                </FadeInSection>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-[1100px] mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#5DDFC3]/20 text-[#3A405A] px-4 py-2 rounded-full text-sm font-bold mb-4">
                <Sparkles className="w-4 h-4 text-[#5DDFC3]" />
                SERVICES
              </div>
              <h2 className="text-4xl font-black mb-4">
                サービス
              </h2>
              <p className="text-lg opacity-70">
                学習者一人ひとりに寄り添うプロダクトを提供しています
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Roopy 大学受験版 */}
            <FadeInSection delay={100} direction="up">
            <div className="group bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="aspect-video relative bg-gradient-to-br from-[#5DDFC3]/20 to-[#E0F7F1]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/Roopy-full-1.png"
                    alt="Roopy"
                    width={200}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-[#5DDFC3]" />
                  <span className="text-xs font-bold text-[#5DDFC3]">大学受験向け</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Roopy（るーぴー）</h3>
                <p className="opacity-70 mb-4 leading-relaxed text-sm">
                  大学受験を"毎日つづけられる"ゲームにする学習アプリ。
                </p>
                <ul className="space-y-1.5 mb-4 text-xs">
                  <li className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#5DDFC3]" />
                    無機化学・リスニング・英単語
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#5DDFC3]" />
                    ポイント機能＆ランキング
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#5DDFC3]" />
                    完全無料で利用可能
                  </li>
                </ul>
                <Link
                  href="/lp/roopy"
                  className="inline-flex items-center gap-2 text-[#5DDFC3] font-bold text-sm hover:gap-3 transition-all"
                >
                  詳しく見る
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            </FadeInSection>

            {/* Roopy English */}
            <FadeInSection delay={200} direction="up">
            <div className="group bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="aspect-video relative bg-gradient-to-br from-cyan-500/20 to-teal-500/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/RoopyEnglish.png"
                    alt="Roopy English"
                    width={200}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Headphones className="w-5 h-5 text-cyan-500" />
                  <span className="text-xs font-bold text-cyan-500">英語ニュースリスニング</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Roopy English</h3>
                <p className="opacity-70 mb-4 leading-relaxed text-sm">
                  毎朝届く英語ニュースで、通勤時間を学習時間に。
                </p>
                <ul className="space-y-1.5 mb-4 text-xs">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    毎朝約20本の英語ニュース配信
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                    日本語字幕＆重要単語リスト
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-cyan-500" />
                    AIネイティブ音声・速度調整
                  </li>
                </ul>
                <Link
                  href="/lp/english"
                  className="inline-flex items-center gap-2 text-cyan-500 font-bold text-sm hover:gap-3 transition-all"
                >
                  詳しく見る
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            </FadeInSection>

            {/* 学習塾DX支援 - MANABEE */}
            <FadeInSection delay={300} direction="up">
            <div className="group bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="aspect-video relative bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                <Image
                  src="/manabee.png"
                  alt="MANABEE - LINE出席管理アプリ"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Image
                    src="/manabee-logo.png"
                    alt="まなビーくん"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-xs font-bold text-amber-500">学習塾DX支援</span>
                </div>
                <h3 className="text-xl font-bold mb-2">MANABEE（まなビーくん）</h3>
                <p className="opacity-70 mb-4 leading-relaxed text-sm">
                  LINEで完結する出席管理。アプリ不要、導入5分で今日から使える。
                </p>
                <ul className="space-y-1.5 mb-4 text-xs">
                  <li className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    LINEでワンタップ出席
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                    スプレッドシートに自動反映
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-amber-500" />
                    座席表をリアルタイム更新
                  </li>
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">生徒1名 100円/月〜</span>
                  <Link
                    href="/lp/manabee"
                    className="inline-flex items-center gap-2 text-amber-500 font-bold text-sm hover:gap-3 transition-all"
                  >
                    詳しく見る
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section id="profile" className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-[900px] mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-[#3A405A] px-4 py-2 rounded-full text-sm font-bold mb-4">
                <Users className="w-4 h-4" />
                PROFILE
              </div>
              <h2 className="text-4xl font-black mb-4">
                代表プロフィール
              </h2>
            </div>
          </FadeInSection>

          <FadeInSection delay={200} direction="left">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* プロフィール写真（プレースホルダー） */}
              <div className="w-48 h-48 bg-gradient-to-br from-[#5DDFC3] to-cyan-500 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-white text-4xl font-bold">Photo</span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">表川 知由</h3>
                <p className="text-[#5DDFC3] font-bold mb-4">Edore 代表</p>

                <div className="space-y-4 text-sm leading-relaxed opacity-80">
                  <p>
                    大阪大学在学中に教育事業に興味を持ち、Edoreを立ち上げ。
                  </p>
                  <p>
                    「教育をもっと楽しく、もっと身近に」をミッションに、
                    テクノロジーを活用した学習サービスを開発・運営しています。
                  </p>
                  <p>
                    自身の受験経験から、「続けられない」という学習の根本課題に着目。
                    ゲーミフィケーションやUI/UXデザインを駆使し、
                    学習者が自然と継続できるプロダクトづくりを追求しています。
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                  <a
                    href="https://x.com/Edore_handai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#3A405A] hover:text-[#5DDFC3] transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    @Edore_handai
                  </a>
                </div>
              </div>
            </div>
          </div>
          </FadeInSection>
        </div>
      </section>

      {/* Company Info Section */}
      <section id="company" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-[800px] mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#3A405A]/10 text-[#3A405A] px-4 py-2 rounded-full text-sm font-bold mb-4">
                <Building2 className="w-4 h-4" />
                COMPANY
              </div>
              <h2 className="text-4xl font-black mb-4">
                会社概要
              </h2>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <th className="px-6 py-5 bg-gray-50 text-left font-bold w-1/3">屋号</th>
                  <td className="px-6 py-5">Edore（エドア）</td>
                </tr>
                <tr>
                  <th className="px-6 py-5 bg-gray-50 text-left font-bold">代表者</th>
                  <td className="px-6 py-5">表川 知由</td>
                </tr>
                <tr>
                  <th className="px-6 py-5 bg-gray-50 text-left font-bold">事業内容</th>
                  <td className="px-6 py-5">
                    <ul className="list-disc list-inside space-y-1">
                      <li>教育アプリの企画・開発・運営</li>
                      <li>英語学習サービスの提供</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th className="px-6 py-5 bg-gray-50 text-left font-bold">所在地</th>
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#5DDFC3] mt-1 shrink-0" />
                      大阪府
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="px-6 py-5 bg-gray-50 text-left font-bold">メールアドレス</th>
                  <td className="px-6 py-5">
                    <a
                      href="mailto:contact@edore-edu.com"
                      className="text-[#5DDFC3] hover:underline"
                    >
                      contact@edore-edu.com
                    </a>
                  </td>
                </tr>
                <tr>
                  <th className="px-6 py-5 bg-gray-50 text-left font-bold">Webサイト</th>
                  <td className="px-6 py-5">
                    <a
                      href="https://www.edore-edu.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5DDFC3] hover:underline inline-flex items-center gap-1"
                    >
                      https://www.edore-edu.com
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </FadeInSection>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-gradient-to-br from-[#3A405A] via-[#4A506A] to-[#5A607A] text-white overflow-hidden">
        <div className="max-w-[800px] mx-auto">
          <FadeInSection>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold mb-8 border border-white/30">
                <Mail className="w-4 h-4" />
                CONTACT
              </div>

              <h2 className="text-4xl font-black mb-6">
                お問い合わせ
              </h2>
              <p className="text-lg mb-10 opacity-90">
                サービスに関するご質問、取材依頼、<br className="hidden md:block" />
                その他ご相談はお気軽にお問い合わせください。
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {/* フォーム */}
            <div className="md:col-span-2">
              <ContactForm />
            </div>

            {/* 連絡先情報 */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="font-bold mb-3">メール</h3>
                <a
                  href="mailto:contact@edore-edu.com"
                  className="text-[#5DDFC3] font-medium hover:underline break-all"
                >
                  contact@edore-edu.com
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="font-bold mb-3">SNS</h3>
                <a
                  href="https://x.com/Edore_handai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white hover:text-[#5DDFC3] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @Edore_handai
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="font-bold mb-3">対応時間</h3>
                <p className="text-sm opacity-80">
                  平日 10:00 - 18:00<br />
                  ※土日祝は翌営業日対応
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-white py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* ブランド */}
            <div className="md:col-span-2">
              <span className="text-2xl font-black mb-4 block">Edore</span>
              <p className="text-sm opacity-70 max-w-md">
                教育×テクノロジーで、学びをもっと楽しく。
                すべての学習者が楽しく成長できる環境を創ります。
              </p>
            </div>

            {/* サービス */}
            <div>
              <h3 className="font-bold mb-4">サービス</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/lp/roopy" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
                    Roopy（大学受験版）
                  </Link>
                </li>
                <li>
                  <Link href="/lp/english" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
                    Roopy English
                  </Link>
                </li>
              </ul>
            </div>

            {/* 会社情報 */}
            <div>
              <h3 className="font-bold mb-4">会社情報</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#concept" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
                    コンセプト
                  </a>
                </li>
                <li>
                  <a href="#profile" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
                    代表プロフィール
                  </a>
                </li>
                <li>
                  <a href="#company" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
                    会社概要
                  </a>
                </li>
                <li>
                  <a href="#contact" className="opacity-70 hover:opacity-100 hover:text-[#5DDFC3] transition-colors">
                    お問い合わせ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="opacity-60 hover:opacity-100 transition-opacity">
                利用規約
              </Link>
              <Link href="/privacy" className="opacity-60 hover:opacity-100 transition-opacity">
                プライバシーポリシー
              </Link>
            </div>
            <p className="text-sm opacity-60">
              &copy; 2025 Edore. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
