'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle, ArrowRight, Edit3, Layout, Smartphone,
  MessageSquare, Search, Globe, Users, Clock, Shield,
  ChevronDown, Play, Sparkles
} from 'lucide-react'

// Intersection Observer Hook for scroll animations
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
      }
    }, { threshold: 0.1, ...options })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isInView }
}

// Animated Section Component
function AnimatedSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Demo Site Embed Component
function DemoSiteEmbed({
  url,
  title,
  description
}: {
  url: string
  title: string
  description: string
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-300 truncate">
            {url}
          </div>
        </div>
      </div>
      <div className="relative aspect-[16/10] bg-slate-100">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full border-0"
          onLoad={() => setIsLoaded(true)}
          title={title}
        />
      </div>
      <div className="p-4 bg-slate-50">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

// Screenshot Component (for static images)
function ScreenshotCard({
  src,
  alt,
  title,
  description
}: {
  src: string
  alt: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow">
      <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

// FAQ Accordion
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-medium text-slate-800">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-slate-600">{answer}</p>
      </div>
    </div>
  )
}

export default function JukubaLPPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/lp/jukuba" className="flex items-center gap-2">
            <Image
              src="/images/jukuba-icon.png"
              alt="JUKUBA"
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="font-bold text-xl text-slate-800">JUKUBA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-slate-600 hover:text-slate-900">機能</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900">料金</a>
            <a href="#examples" className="text-slate-600 hover:text-slate-900">事例</a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900">FAQ</a>
          </div>
          <Link
            href="/lp/juku-site/contact"
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            無料相談
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                関西圏の塾専用ホームページサービス
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                自分で更新できる<br />
                <span className="text-indigo-600">塾専用</span>ホームページ
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                10種類のテンプレートから選ぶだけ。<br />
                専門知識不要で、塾長自身が簡単に更新できます。
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  href="/lp/juku-site/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white text-lg font-medium py-4 px-8 rounded-full hover:bg-slate-800 transition-all hover:scale-105"
                >
                  無料で相談する
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/lp/juku-site/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-700 text-lg font-medium py-4 px-8 rounded-full border-2 border-slate-200 hover:border-slate-300 transition-all"
                >
                  資料をダウンロード
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  月額2,980円〜
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  初期費用お見積り
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  対面サポート対応
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Hero Screenshot */}
          <AnimatedSection delay={500} className="mt-16">
            <div className="max-w-5xl mx-auto">
              <div className="bg-slate-900 rounded-2xl p-2 shadow-2xl">
                <div className="bg-slate-800 rounded-t-xl px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-400 max-w-md mx-auto text-center">
                      edore-edu.com/juku/jukuba
                    </div>
                  </div>
                </div>
                <div className="aspect-[16/9] bg-slate-100 rounded-b-xl overflow-hidden">
                  {/* Demo site embed or screenshot */}
                  <iframe
                    src="https://edore-edu.com/juku/jukuba"
                    className="w-full h-full border-0"
                    title="デモサイト"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              こんな<span className="text-red-400">お悩み</span>ありませんか？
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💰', title: 'HP制作費が高すぎる', desc: '制作会社に頼むと30〜50万円。維持費も月1〜2万円かかる。' },
              { icon: '🔒', title: '自分で更新できない', desc: '作ってもらったHPを更新するたびに業者に依頼。時間もお金もかかる。' },
              { icon: '📱', title: 'スマホ対応してない', desc: '古いサイトのままでスマホで見づらい。今どきの保護者に悪印象。' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="bg-slate-800 rounded-2xl p-8 h-full">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                JUKUBAなら<span className="text-indigo-600">すべて解決</span>
              </h2>
              <p className="text-lg text-slate-600">
                塾に特化したホームページサービスで、集客力のあるサイトが簡単に作れます
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Layout, title: '10種類のテンプレート', desc: '塾専用に設計されたデザイン。選ぶだけでプロ品質。' },
              { icon: Edit3, title: '自分で簡単に更新', desc: '専門知識不要。テキスト入力するだけで更新完了。' },
              { icon: Smartphone, title: 'スマホ完全対応', desc: '自動でレスポンシブ。どのデバイスでも美しく表示。' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-indigo-600">30秒</span>でわかる操作感
              </h2>
              <p className="text-lg text-slate-600">
                実際の管理画面を使った編集の様子をご覧ください
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-900 rounded-2xl p-2 shadow-2xl">
                <div className="bg-slate-800 rounded-t-xl px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-400 max-w-md mx-auto text-center">
                      JUKUBA 管理画面デモ
                    </div>
                  </div>
                </div>
                <div className="aspect-video bg-slate-800 rounded-b-xl overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/JUKUBA.mov" type="video/mp4" />
                    お使いのブラウザは動画再生に対応していません。
                  </video>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Admin Screenshots Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                直感的な<span className="text-indigo-600">管理画面</span>
              </h2>
              <p className="text-lg text-slate-600">
                専門知識がなくても、見たまま編集できます
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={100}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 border-b">
                  <span className="text-sm font-medium text-slate-600">セクション編集画面</span>
                </div>
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/JUKUBA-1.png"
                    alt="JUKUBA管理画面 - セクション編集"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-800 mb-2">セクションを選んで編集</h4>
                  <p className="text-sm text-slate-600">
                    左のリストからセクションを選択し、右側で内容を編集。テキストを入力するだけで更新できます。
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 border-b">
                  <span className="text-sm font-medium text-slate-600">プレビュー画面</span>
                </div>
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/JUKUBA-2.png"
                    alt="JUKUBA管理画面 - プレビュー"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-800 mb-2">リアルタイムでプレビュー</h4>
                  <p className="text-sm text-slate-600">
                    PC・タブレット・スマホの表示を確認しながら編集。公開前に見た目をチェックできます。
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section - Alternating Layout */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">主な機能</h2>
              <p className="text-lg text-slate-600">塾サイトに必要な機能がすべて揃っています</p>
            </div>
          </AnimatedSection>

          <div className="space-y-24">
            {[
              {
                title: 'ドラッグ&ドロップで簡単編集',
                desc: 'セクションの並び替えも、テキストの編集も、すべて直感的な操作で完結。HTMLやCSSの知識は一切不要です。',
                features: ['リアルタイムプレビュー', '画像のアップロード', 'セクションの追加・削除'],
                image: '/JUKUBA-1.png',
                reverse: false
              },
              {
                title: 'スマホ・PC両方で確認',
                desc: '編集中にいつでもプレビュー可能。スマートフォン、タブレット、PCの見た目を切り替えて確認できます。',
                features: ['デバイス切り替え表示', '公開前チェック', '即時反映'],
                image: '/JUKUBA-2.png',
                reverse: true
              },
            ].map((feature, i) => (
              <AnimatedSection key={i}>
                <div className={`grid md:grid-cols-2 gap-12 items-center ${feature.reverse ? 'md:flex-row-reverse' : ''}`}>
                  <div className={feature.reverse ? 'md:order-2' : ''}>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">{feature.desc}</p>
                    <ul className="space-y-3">
                      {feature.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={feature.reverse ? 'md:order-1' : ''}>
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Included Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">含まれるセクション</h2>
              <p className="text-lg text-slate-600">塾サイトに必要なすべてのセクションを用意</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'ヒーロー', 'コース・料金', '講師紹介', '合格実績',
              '教室の特徴', '時間割', 'FAQ', 'アクセス',
              'お問い合わせ', 'ブログ', 'ギャラリー', '保護者の声'
            ].map((section, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <div className="bg-slate-50 rounded-xl p-4 text-center font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default">
                  {section}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">作成事例</h2>
              <p className="text-lg text-slate-400">JUKUBAで作成された塾サイトをご覧ください</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: '個別指導塾 サンプル', desc: 'シンプルで見やすいデザイン', url: 'https://edore-edu.com/juku/jukuba' },
              { title: '進学塾 サンプル', desc: '合格実績を前面に押し出したデザイン', url: 'https://edore-edu.com/juku/jukuba' },
              { title: '英語専門塾 サンプル', desc: '特徴的なカラーリング', url: 'https://edore-edu.com/juku/jukuba' },
            ].map((example, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <a
                  href={example.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-800 rounded-2xl overflow-hidden group"
                >
                  <div className="aspect-[16/10] bg-slate-700 relative overflow-hidden">
                    <iframe
                      src={example.url}
                      className="w-full h-full border-0 scale-100 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                      title={example.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                      <span className="text-white font-medium">サイトを見る →</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold mb-1">{example.title}</h4>
                    <p className="text-sm text-slate-400">{example.desc}</p>
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-12 text-center">
            <Link
              href="/lp/juku-site/contact"
              className="inline-flex items-center gap-2 bg-white text-slate-900 font-medium py-3 px-8 rounded-full hover:bg-slate-100 transition-colors"
            >
              もっと事例を見る
              <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">料金プラン</h2>
              <p className="text-lg text-slate-600">塾の規模やニーズに合わせて選べます</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'ライト',
                price: '4,980',
                desc: 'まずは試してみたい方に',
                features: ['テンプレート10種', '自分で更新', 'スマホ対応', 'お問い合わせフォーム', 'SSL対応'],
                highlight: false
              },
              {
                name: 'スタンダード',
                price: '9,800',
                desc: '本気で集客したい塾に',
                features: ['ライトの全機能', '月1回更新代行', '月1回オンライン相談', 'ブログ代行オプション', 'MEO対策サポート'],
                highlight: true
              },
              {
                name: 'プロ',
                price: '19,800',
                desc: '複数教室・拡大中の塾に',
                features: ['スタンダードの全機能', '週1回更新代行', '広告運用サポート', '独自ドメイン対応', '優先サポート'],
                highlight: false
              },
            ].map((plan, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className={`rounded-2xl p-8 h-full ${plan.highlight ? 'bg-slate-900 text-white ring-4 ring-indigo-500' : 'bg-slate-50'}`}>
                  {plan.highlight && (
                    <div className="text-indigo-400 text-sm font-medium mb-4">人気No.1</div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-slate-400' : 'text-slate-600'}`}>{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">¥{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-600'}`}>/月</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-indigo-400' : 'text-green-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/lp/juku-site/contact"
                    className={`block text-center py-3 rounded-full font-medium transition-colors ${
                      plan.highlight
                        ? 'bg-white text-slate-900 hover:bg-slate-100'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    相談する
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-12 text-center">
            <p className="text-slate-500">
              ※初期費用は塾の規模・ご要望によってお見積りいたします
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Flow Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">ご利用の流れ</h2>
              <p className="text-lg text-slate-600">最短2週間で公開できます</p>
            </div>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { num: '01', title: '無料相談', desc: 'お問い合わせフォームからご連絡' },
                { num: '02', title: 'お見積り', desc: 'ご要望をヒアリングしてお見積り' },
                { num: '03', title: '素材提供', desc: 'テンプレート選択・写真・文章を提供' },
                { num: '04', title: '公開', desc: '初期設定後、サイト公開！' },
              ].map((step, i) => (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.num}
                    </div>
                    <h3 className="font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">よくある質問</h2>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <FAQItem
                question="本当に自分で更新できますか？"
                answer="はい、HTMLやCSSの知識がなくても大丈夫です。テキストを入力したり、画像をアップロードするだけで更新できます。操作方法のサポートも行っています。"
              />
              <FAQItem
                question="最低契約期間はありますか？"
                answer="最低6ヶ月からのご契約となります。その後は1ヶ月単位で継続いただけます。"
              />
              <FAQItem
                question="独自ドメインは使えますか？"
                answer="プレミアムプラン以上で独自ドメインに対応しています。既存のドメインの移管もサポートいたします。"
              />
              <FAQItem
                question="対面でのサポートは受けられますか？"
                answer="関西圏（大阪・兵庫・京都・奈良・滋賀・和歌山）限定で、訪問でのサポートを行っています。初回の操作説明なども対面で実施可能です。"
              />
              <FAQItem
                question="解約したらデータはどうなりますか？"
                answer="解約後30日間はデータを保持しています。その間にテキストや画像をダウンロードいただけます。"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              まずは無料相談から
            </h2>
            <p className="text-lg text-slate-400 mb-10">
              塾のホームページについてお気軽にご相談ください。<br />
              オンライン・対面どちらでも対応可能です。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/lp/juku-site/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 text-lg font-medium py-4 px-10 rounded-full hover:bg-slate-100 transition-all hover:scale-105"
              >
                無料で相談する
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/lp/juku-site/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 text-white text-lg font-medium py-4 px-10 rounded-full border border-slate-700 hover:bg-slate-700 transition-all"
              >
                資料をダウンロード
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/jukuba-icon.png"
                alt="JUKUBA"
                width={32}
                height={32}
              />
              <span className="font-bold">JUKUBA</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <Link href="/company" className="hover:text-white">会社概要</Link>
              <Link href="/lp/juku-site/contact" className="hover:text-white">お問い合わせ</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            &copy; 2025 Edore Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
