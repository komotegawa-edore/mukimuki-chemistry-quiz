'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle, ArrowRight, Edit3, Layout, Smartphone,
  MessageSquare, Search, Globe, Users, Clock, Shield,
  ChevronDown, Play, Sparkles, Banknote, Lock, Zap,
  BarChart3, Star, TrendingUp, MousePointer, Palette
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

// Animated Section Component with enhanced effects
function AnimatedSection({ children, className = '', delay = 0, direction = 'up' }: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
}) {
  const { ref, isInView } = useInView()

  const transforms: Record<string, string> = {
    up: 'translateY(40px)',
    down: 'translateY(-40px)',
    left: 'translateX(40px)',
    right: 'translateX(-40px)',
    scale: 'scale(0.95)'
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : transforms[direction],
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Glassmorphism Card Component
function GlassCard({ children, className = '', hover = true }: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={`
      relative overflow-hidden rounded-3xl
      bg-white/10 backdrop-blur-xl
      border border-white/20
      ${hover ? 'hover:bg-white/20 hover:border-white/30 hover:scale-[1.02] hover:shadow-2xl' : ''}
      transition-all duration-500
      ${className}
    `}>
      {children}
    </div>
  )
}

// Floating Badge Component
function FloatingBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full
      bg-gradient-to-r from-indigo-500/20 to-purple-500/20
      border border-indigo-400/30 backdrop-blur-sm
      text-sm font-medium text-white
      ${className}
    `}>
      {children}
    </span>
  )
}

// Gradient Button Component
function GradientButton({ children, href, variant = 'primary', className = '' }: {
  children: React.ReactNode
  href: string
  variant?: 'primary' | 'secondary'
  className?: string
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl'

  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25',
    secondary: 'bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20'
  }

  return (
    <Link href={href} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  )
}

// Animated Counter Component
function Counter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, isInView } = useInView()

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// FAQ Accordion with enhanced styling
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AnimatedSection delay={index * 100}>
      <div className="border-b border-white/10 last:border-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-6 flex items-center justify-between text-left group"
        >
          <span className="font-medium text-lg text-white group-hover:text-indigo-300 transition-colors">{question}</span>
          <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all ${isOpen ? 'rotate-180 bg-indigo-500' : ''}`}>
            <ChevronDown className="w-5 h-5 text-white" />
          </div>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
          <p className="text-slate-300 leading-relaxed">{answer}</p>
        </div>
      </div>
    </AnimatedSection>
  )
}

export default function JukubaLPPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[128px]"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[128px]"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[128px]"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className={`mx-4 mt-4 rounded-2xl transition-all duration-300 ${scrollY > 50 ? 'bg-slate-900/80 backdrop-blur-xl border border-white/10' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/lp/jukuba" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Image
                  src="/images/jukuba-icon.png"
                  alt="JUKUBA"
                  width={28}
                  height={28}
                  className="brightness-0 invert"
                />
              </div>
              <span className="font-bold text-xl">JUKUBA</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">機能</a>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">料金</a>
              <a href="#examples" className="text-slate-400 hover:text-white transition-colors">事例</a>
              <a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a>
            </div>
            <Link
              href="/lp/juku-site/contact"
              className="bg-white text-slate-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-100 transition-all hover:scale-105"
            >
              無料相談
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <AnimatedSection>
                <FloatingBadge className="mb-8">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  関西圏の塾専用ホームページサービス
                </FloatingBadge>
              </AnimatedSection>

              <AnimatedSection delay={100}>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]">
                  <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    自分で更新できる
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    塾専用
                  </span>
                  <span className="text-white">HP</span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                  10種類のテンプレートから選ぶだけ。
                  専門知識不要で、塾長自身が簡単に更新できます。
                </p>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                  <GradientButton href="/lp/juku-site/contact">
                    無料で相談する
                    <ArrowRight className="w-5 h-5" />
                  </GradientButton>
                  <GradientButton href="/lp/juku-site/contact" variant="secondary">
                    <Play className="w-5 h-5" />
                    デモを見る
                  </GradientButton>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <div className="flex flex-wrap gap-6 text-sm">
                  {[
                    { icon: Zap, text: '月額2,980円〜' },
                    { icon: Shield, text: '対面サポート対応' },
                    { icon: Clock, text: '最短2週間で公開' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Right Content - Hero Image */}
            <AnimatedSection delay={500} direction="scale" className="relative">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl scale-110" />

                {/* Browser Frame */}
                <GlassCard className="relative overflow-hidden" hover={false}>
                  <div className="bg-slate-800/50 px-4 py-3 flex items-center gap-3 border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-slate-700/50 rounded-lg px-4 py-2 text-xs text-slate-400 max-w-sm mx-auto text-center">
                        edore-edu.com/juku/your-site
                      </div>
                    </div>
                  </div>
                  <div className="aspect-[16/10] bg-slate-900/50 overflow-hidden">
                    <iframe
                      src="https://edore-edu.com/juku/jukuba"
                      className="w-full h-full border-0"
                      title="デモサイト"
                    />
                  </div>
                </GlassCard>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 animate-bounce" style={{ animationDuration: '3s' }}>
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">問い合わせ</div>
                        <div className="font-bold text-green-400">+180%</div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                <div className="absolute -bottom-4 -left-4 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <MousePointer className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">簡単操作</div>
                        <div className="font-bold text-indigo-400">ワンクリック</div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 50, suffix: '+', label: '導入塾数' },
              { value: 98, suffix: '%', label: '満足度' },
              { value: 180, suffix: '%', label: '問合せ増加率' },
              { value: 2, suffix: '週間', label: '平均公開日数' }
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <GlassCard className="p-6 text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </GlassCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section - Bento Grid */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                こんな<span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">お悩み</span>ありませんか？
              </h2>
            </div>
          </AnimatedSection>

          {/* Bento Grid Layout */}
          <div className="grid md:grid-cols-3 gap-4">
            <AnimatedSection delay={100} className="md:col-span-2">
              <GlassCard className="p-8 h-full bg-gradient-to-br from-red-500/10 to-orange-500/10">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                  <Banknote className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">HP制作費が高すぎる</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  制作会社に頼むと30〜50万円。維持費も月1〜2万円かかる。
                  小規模な塾には大きな負担になっています。
                </p>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <GlassCard className="p-8 h-full bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">自分で更新できない</h3>
                <p className="text-slate-400 leading-relaxed">
                  更新のたびに業者に依頼。時間もお金もかかる。
                </p>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <GlassCard className="p-8 h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                  <Smartphone className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">スマホ対応してない</h3>
                <p className="text-slate-400 leading-relaxed">
                  古いサイトのままで保護者に悪印象。
                </p>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection delay={400} className="md:col-span-2">
              <GlassCard className="p-8 h-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                  <Search className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">検索しても見つからない</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  SEO対策がされておらず、Googleで検索しても塾が見つからない。
                  近隣の保護者に存在を知ってもらえていない。
                </p>
              </GlassCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <FloatingBadge className="mb-6">
                <Zap className="w-4 h-4 text-indigo-400" />
                JUKUBAならすべて解決
              </FloatingBadge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  3つの特徴
                </span>
                で選ばれています
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layout,
                title: '10種類のテンプレート',
                desc: '塾専用に設計されたプロ品質のデザイン。選ぶだけで完成。',
                gradient: 'from-indigo-500 to-blue-500'
              },
              {
                icon: Edit3,
                title: '自分で簡単に更新',
                desc: '専門知識不要。テキストを入力するだけで更新完了。',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Smartphone,
                title: 'スマホ完全対応',
                desc: '自動でレスポンシブ。どのデバイスでも美しく表示。',
                gradient: 'from-pink-500 to-orange-500'
              }
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 150}>
                <GlassCard className="p-8 h-full group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">30秒</span>
                でわかる操作感
              </h2>
              <p className="text-xl text-slate-400">
                実際の管理画面を使った編集の様子をご覧ください
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200} direction="scale">
            <div className="max-w-5xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl scale-105" />
                <GlassCard className="relative overflow-hidden" hover={false}>
                  <div className="bg-slate-800/50 px-4 py-3 flex items-center gap-3 border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-slate-700/50 rounded-lg px-4 py-2 text-xs text-slate-400 max-w-sm mx-auto text-center flex items-center justify-center gap-2">
                        <Play className="w-3 h-3" />
                        JUKUBA 管理画面デモ
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video bg-slate-900/50 overflow-hidden">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/JUKUBA.mov" type="video/mp4" />
                    </video>
                  </div>
                </GlassCard>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Admin Screenshots - Bento Style */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                直感的な
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">管理画面</span>
              </h2>
              <p className="text-xl text-slate-400">
                専門知識がなくても、見たまま編集できます
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedSection delay={100} direction="left">
              <GlassCard className="overflow-hidden h-full">
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="font-medium">セクション編集画面</span>
                </div>
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/JUKUBA-1.png"
                    alt="JUKUBA管理画面 - セクション編集"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-2">セクションを選んで編集</h4>
                  <p className="text-slate-400">
                    左のリストからセクションを選択し、右側で内容を編集。テキストを入力するだけで更新できます。
                  </p>
                </div>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection delay={200} direction="right">
              <GlassCard className="overflow-hidden h-full">
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="font-medium">プレビュー画面</span>
                </div>
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/JUKUBA-2.png"
                    alt="JUKUBA管理画面 - プレビュー"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-2">リアルタイムでプレビュー</h4>
                  <p className="text-slate-400">
                    PC・タブレット・スマホの表示を確認しながら編集。公開前に見た目をチェックできます。
                  </p>
                </div>
              </GlassCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section - Alternating */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">主な機能</h2>
              <p className="text-xl text-slate-400">塾サイトに必要な機能がすべて揃っています</p>
            </div>
          </AnimatedSection>

          <div className="space-y-32">
            {[
              {
                title: 'ドラッグ&ドロップで簡単編集',
                desc: 'セクションの並び替えも、テキストの編集も、すべて直感的な操作で完結。HTMLやCSSの知識は一切不要です。',
                features: ['リアルタイムプレビュー', '画像のアップロード', 'セクションの追加・削除'],
                image: '/JUKUBA-1.png',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                title: 'スマホ・PC両方で確認',
                desc: '編集中にいつでもプレビュー可能。スマートフォン、タブレット、PCの見た目を切り替えて確認できます。',
                features: ['デバイス切り替え表示', '公開前チェック', '即時反映'],
                image: '/JUKUBA-2.png',
                gradient: 'from-purple-500 to-pink-500'
              },
            ].map((feature, i) => (
              <div key={i} className={`grid md:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <AnimatedSection delay={100} direction={i % 2 === 0 ? 'left' : 'right'} className={i % 2 === 1 ? 'md:order-2' : ''}>
                  <FloatingBadge className="mb-6">
                    <Palette className="w-4 h-4" />
                    機能 {String(i + 1).padStart(2, '0')}
                  </FloatingBadge>
                  <h3 className="text-3xl md:text-4xl font-bold mb-6">{feature.title}</h3>
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed">{feature.desc}</p>
                  <ul className="space-y-4">
                    {feature.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg">{f}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedSection>
                <AnimatedSection delay={200} direction={i % 2 === 0 ? 'right' : 'left'} className={i % 2 === 1 ? 'md:order-1' : ''}>
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 rounded-3xl blur-2xl scale-110`} />
                    <GlassCard className="overflow-hidden" hover={false}>
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                    </GlassCard>
                  </div>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Included Sections */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">含まれるセクション</h2>
              <p className="text-xl text-slate-400">塾サイトに必要なすべてのセクションを用意</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'ヒーロー', 'コース・料金', '講師紹介', '合格実績',
              '教室の特徴', '時間割', 'FAQ', 'アクセス',
              'お問い合わせ', 'ブログ', 'ギャラリー', '保護者の声'
            ].map((section, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <GlassCard className="p-5 text-center group cursor-default">
                  <span className="font-medium group-hover:text-indigo-400 transition-colors">{section}</span>
                </GlassCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">作成事例</h2>
              <p className="text-xl text-slate-400">JUKUBAで作成された塾サイトをご覧ください</p>
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
                  className="block group"
                >
                  <GlassCard className="overflow-hidden">
                    <div className="aspect-[16/10] bg-slate-800/50 relative overflow-hidden">
                      <iframe
                        src={example.url}
                        className="w-full h-full border-0 scale-100 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                        title={example.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                        <span className="text-white font-medium flex items-center gap-2">
                          サイトを見る <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-lg mb-1">{example.title}</h4>
                      <p className="text-sm text-slate-400">{example.desc}</p>
                    </div>
                  </GlassCard>
                </a>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-12 text-center">
            <GradientButton href="/lp/juku-site/contact" variant="secondary">
              もっと事例を見る
              <ArrowRight className="w-4 h-4" />
            </GradientButton>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">料金プラン</h2>
              <p className="text-xl text-slate-400">塾の規模やニーズに合わせて選べます</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'ライト',
                price: '4,980',
                desc: 'まずは試してみたい方に',
                features: ['テンプレート10種', '自分で更新', 'スマホ対応', 'お問い合わせフォーム', 'SSL対応'],
                gradient: 'from-slate-600 to-slate-700',
                highlight: false
              },
              {
                name: 'スタンダード',
                price: '9,800',
                desc: '本気で集客したい塾に',
                features: ['ライトの全機能', '月1回更新代行', '月1回オンライン相談', 'ブログ代行オプション', 'MEO対策サポート'],
                gradient: 'from-indigo-500 via-purple-500 to-pink-500',
                highlight: true
              },
              {
                name: 'プロ',
                price: '19,800',
                desc: '複数教室・拡大中の塾に',
                features: ['スタンダードの全機能', '週1回更新代行', '広告運用サポート', '独自ドメイン対応', '優先サポート'],
                gradient: 'from-slate-600 to-slate-700',
                highlight: false
              },
            ].map((plan, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className={`relative rounded-3xl p-[2px] ${plan.highlight ? `bg-gradient-to-br ${plan.gradient}` : ''}`}>
                  <GlassCard className={`p-8 h-full ${plan.highlight ? 'bg-slate-900' : ''}`} hover={!plan.highlight}>
                    {plan.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                          人気No.1
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
                    <div className="mb-8">
                      <span className="text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">¥{plan.price}</span>
                      <span className="text-slate-400">/月</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm">
                          <div className={`w-5 h-5 rounded-full ${plan.highlight ? 'bg-indigo-500' : 'bg-white/10'} flex items-center justify-center`}>
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.highlight ? (
                      <GradientButton href="/lp/juku-site/contact" className="w-full justify-center">
                        相談する
                      </GradientButton>
                    ) : (
                      <GradientButton href="/lp/juku-site/contact" variant="secondary" className="w-full justify-center">
                        相談する
                      </GradientButton>
                    )}
                  </GlassCard>
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
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">ご利用の流れ</h2>
              <p className="text-xl text-slate-400">最短2週間で公開できます</p>
            </div>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { num: '01', title: '無料相談', desc: 'お問い合わせフォームからご連絡', gradient: 'from-indigo-500 to-blue-500' },
                { num: '02', title: 'お見積り', desc: 'ご要望をヒアリングしてお見積り', gradient: 'from-blue-500 to-purple-500' },
                { num: '03', title: '素材提供', desc: 'テンプレート選択・写真・文章を提供', gradient: 'from-purple-500 to-pink-500' },
                { num: '04', title: '公開', desc: '初期設定後、サイト公開！', gradient: 'from-pink-500 to-orange-500' },
              ].map((step, i) => (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-indigo-500/20`}>
                      {step.num}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 relative">
        <div className="max-w-3xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">よくある質問</h2>
            </div>
          </AnimatedSection>

          <GlassCard className="p-8" hover={false}>
            <FAQItem
              index={0}
              question="本当に自分で更新できますか？"
              answer="はい、HTMLやCSSの知識がなくても大丈夫です。テキストを入力したり、画像をアップロードするだけで更新できます。操作方法のサポートも行っています。"
            />
            <FAQItem
              index={1}
              question="最低契約期間はありますか？"
              answer="最低6ヶ月からのご契約となります。その後は1ヶ月単位で継続いただけます。"
            />
            <FAQItem
              index={2}
              question="独自ドメインは使えますか？"
              answer="プレミアムプラン以上で独自ドメインに対応しています。既存のドメインの移管もサポートいたします。"
            />
            <FAQItem
              index={3}
              question="対面でのサポートは受けられますか？"
              answer="関西圏（大阪・兵庫・京都・奈良・滋賀・和歌山）限定で、訪問でのサポートを行っています。初回の操作説明なども対面で実施可能です。"
            />
            <FAQItem
              index={4}
              question="解約したらデータはどうなりますか？"
              answer="解約後30日間はデータを保持しています。その間にテキストや画像をダウンロードいただけます。"
            />
          </GlassCard>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-purple-500/10" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <AnimatedSection>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              まずは
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">無料相談</span>
              から
            </h2>
            <p className="text-xl text-slate-400 mb-12">
              塾のホームページについてお気軽にご相談ください。<br />
              オンライン・対面どちらでも対応可能です。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GradientButton href="/lp/juku-site/contact" className="text-lg">
                無料で相談する
                <ArrowRight className="w-5 h-5" />
              </GradientButton>
              <GradientButton href="/lp/juku-site/contact" variant="secondary" className="text-lg">
                資料をダウンロード
              </GradientButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Image
                  src="/images/jukuba-icon.png"
                  alt="JUKUBA"
                  width={24}
                  height={24}
                  className="brightness-0 invert"
                />
              </div>
              <span className="font-bold text-xl">JUKUBA</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <Link href="/company" className="hover:text-white transition-colors">会社概要</Link>
              <Link href="/lp/juku-site/contact" className="hover:text-white transition-colors">お問い合わせ</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
            &copy; 2025 Edore Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
