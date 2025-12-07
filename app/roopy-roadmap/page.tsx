import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import {
  CheckCircle2,
  Map,
  Calendar,
  Target,
  Bell,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Roopy ロードマップ | 大学受験をゲームする学習ロードマップ',
  description:
    '今の学力・残り日数・1日の勉強時間から、あなただけの「攻略ルート」を自動で作成。あとはロードマップ通りに進めるだけで、迷わず受験勉強を進められます。',
  openGraph: {
    title: 'Roopy ロードマップ | 大学受験をゲームする学習ロードマップ',
    description:
      '今の学力・残り日数・1日の勉強時間から、あなただけの「攻略ルート」を自動で作成。',
    type: 'website',
  },
}

// FAQ Accordion Item Component
function FAQItem({
  question,
  answer,
}: {
  question: string
  answer: React.ReactNode
}) {
  return (
    <details className="group bg-[#F4F9F7] rounded-xl">
      <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-[#3A405A] list-none">
        <span>{question}</span>
        <ChevronDown className="w-5 h-5 text-[#5DDFC3] group-open:hidden" />
        <ChevronUp className="w-5 h-5 text-[#5DDFC3] hidden group-open:block" />
      </summary>
      <div className="px-6 pb-6 text-[#3A405A] opacity-80 text-sm leading-relaxed">
        {answer}
      </div>
    </details>
  )
}

export default function RoopyRoadmapPage() {
  return (
    <div
      className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}
    >
      {/* Navigation Header */}
      <nav className="bg-white border-b border-[#E0F7F1] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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
            {/* TODO: App Storeリンクに差し替え */}
            <Link
              href="#trial"
              className="bg-[#5DDFC3] text-white px-6 py-2 rounded-full font-bold hover:bg-[#4ECFB3] transition-colors"
            >
              無料で試す
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <header className="bg-gradient-to-b from-white to-[#F4F9F7] py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-[#3A405A]">
              大学受験を
              <span className="text-[#5DDFC3]">ゲームする</span>
              <br className="md:hidden" />
              学習ロードマップ
            </h1>

            <p className="text-lg md:text-xl mb-8 leading-relaxed text-[#3A405A] opacity-80 max-w-2xl mx-auto">
              今の学力・残り日数・1日の勉強時間から、
              <br className="hidden md:block" />
              あなただけの「攻略ルート」を自動で作成。
              <br />
              あとはロードマップ通りに進めるだけで、
              <br className="hidden md:block" />
              迷わず受験勉強を進められます。
            </p>

            <ul className="text-left max-w-md mx-auto mb-8 space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                <span className="text-[#3A405A]">
                  今のレベルと志望校から自動でロードマップ生成
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                <span className="text-[#3A405A]">
                  ロードマップを保存して、今日やることが一目でわかる
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                <span className="text-[#3A405A]">
                  進捗に合わせて更新＆リマインド通知
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                <span className="text-[#3A405A]">
                  無機化学・英単語・古文単語など、暗記系もまとめて管理
                </span>
              </li>
            </ul>

            {/* TODO: App Storeリンクに差し替え */}
            <Link
              href="#trial"
              className="inline-block bg-[#5DDFC3] text-white text-lg font-bold py-4 px-10 rounded-full shadow-[0_8px_20px_rgba(93,223,195,0.4)] hover:shadow-[0_12px_24px_rgba(93,223,195,0.5)] hover:-translate-y-1 transition-all"
            >
              今すぐ無料で試してみる（7日間無料）
            </Link>

            <p className="mt-6 text-sm text-[#3A405A] opacity-60">
              7日間はすべての機能が無料。続けたいと思ったら、月額1,000円でそのまま継続できます。
            </p>
          </div>
        </header>

        {/* Problem Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#3A405A]">
              受験勉強、こんな悩みはありませんか？
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
              <div className="bg-red-50 rounded-xl p-6">
                <p className="font-bold text-[#3A405A]">
                  何から手をつければいいかわからない
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-6">
                <p className="font-bold text-[#3A405A]">
                  参考書を買ったのに、最後までやり切れない
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-6">
                <p className="font-bold text-[#3A405A]">
                  模試のたびに「このままで間に合うのか」不安になる
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-6">
                <p className="font-bold text-[#3A405A]">
                  スマホを触っている間に、1日が終わってしまう
                </p>
              </div>
            </div>

            <p className="text-center text-[#3A405A] opacity-80 text-lg max-w-2xl mx-auto">
              勉強は「やる気」よりも、やることが明確で、続けられる仕組みがあるかどうかで決まります。
            </p>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16 px-4 bg-[#F4F9F7]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-[#3A405A]">
              Roopyの学習ロードマップがやること
            </h2>

            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm max-w-3xl mx-auto">
              <p className="text-[#3A405A] leading-relaxed mb-6">
                Roopyは、大学受験を「攻略ゲーム」のように進められるようにするための学習ロードマップ作成・管理アプリです。
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-[#3A405A] mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#5DDFC3]" />
                    入力する情報
                  </h3>
                  <ul className="space-y-2 text-[#3A405A] opacity-80 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5DDFC3]">•</span>
                      現在の学力（レベル / 偏差値の目安）
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5DDFC3]">•</span>
                      志望校・目標レベル
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5DDFC3]">•</span>
                      試験までの日数
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5DDFC3]">•</span>
                      1日に使える勉強時間
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5DDFC3]">•</span>
                      苦手分野・使いたい教材
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-[#3A405A] mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5 text-[#5DDFC3]" />
                    出力される結果
                  </h3>
                  <p className="text-[#3A405A] opacity-80 text-sm leading-relaxed">
                    「いつ・何を・どれくらい」やればいいかを自動でスケジュール化。
                    <br />
                    あなた専用のロードマップが作成されます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#3A405A]">
              Roopy ロードマップでできること
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#F4F9F7] rounded-2xl p-8">
                <div className="bg-[#E0F7F1] w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#5DDFC3]" />
                </div>
                <h3 className="font-bold text-lg text-[#3A405A] mb-3">
                  今の自分に合った"攻略ルート"が一瞬で決まる
                </h3>
                <p className="text-[#3A405A] opacity-70 text-sm leading-relaxed">
                  現在レベルと志望校から、「どの教材をどの順番で進めるか」を自動で提案。
                  もう「この参考書で合ってるのか？」と悩む時間はいりません。
                </p>
              </div>

              <div className="bg-[#F4F9F7] rounded-2xl p-8">
                <div className="bg-[#E0F7F1] w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-[#5DDFC3]" />
                </div>
                <h3 className="font-bold text-lg text-[#3A405A] mb-3">
                  今日やることが一目でわかる
                </h3>
                <p className="text-[#3A405A] opacity-70 text-sm leading-relaxed">
                  ロードマップは1日ごとのタスクに分解されます。「今日は◯◯を◯ページ」「英単語を◯個」など、アプリを開けばやることが2秒で決まる状態に。
                </p>
              </div>

              <div className="bg-[#F4F9F7] rounded-2xl p-8">
                <div className="bg-[#E0F7F1] w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-[#5DDFC3]" />
                </div>
                <h3 className="font-bold text-lg text-[#3A405A] mb-3">
                  進捗管理＆リマインドで、サボりにくい
                </h3>
                <p className="text-[#3A405A] opacity-70 text-sm leading-relaxed">
                  勉強が終わったらタスクにチェックをつけるだけ。達成度が可視化されるので、ゲーム感覚で続けられます。やり残しがある日はリマインド通知でお知らせ。
                </p>
              </div>

              <div className="bg-[#F4F9F7] rounded-2xl p-8">
                <div className="bg-[#E0F7F1] w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-[#5DDFC3]" />
                </div>
                <h3 className="font-bold text-lg text-[#3A405A] mb-3">
                  暗記系もまとめて管理
                </h3>
                <p className="text-[#3A405A] opacity-70 text-sm leading-relaxed">
                  無機化学・英単語・古文単語など、Roopyのクイズ機能と組み合わせて、「暗記」「演習」「過去問」のバランスも一括で管理できます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-16 px-4 bg-[#F4F9F7]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#3A405A]">
              使い方はかんたん、3ステップ
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 bg-[#5DDFC3] text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6">
                  1
                </div>
                <h3 className="font-bold text-lg text-[#3A405A] mb-3">
                  自分の状況を入力
                </h3>
                <p className="text-[#3A405A] opacity-70 text-sm leading-relaxed">
                  現在のレベル・志望校・日数・1日の勉強時間を入力。使っている（使いたい）参考書も選択できる。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 bg-[#5DDFC3] text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6">
                  2
                </div>
                <h3 className="font-bold text-lg text-[#3A405A] mb-3">
                  ロードマップが自動生成される
                </h3>
                <p className="text-[#3A405A] opacity-70 text-sm leading-relaxed">
                  ステージごとに、どの参考書をどの期間で進めるかが決定。1日ごとのタスクとして、カレンダーとガントチャートに表示。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 bg-[#5DDFC3] text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6">
                  3
                </div>
                <h3 className="font-bold text-lg text-[#3A405A] mb-3">
                  あとはタスク通りに進めるだけ
                </h3>
                <p className="text-[#3A405A] opacity-70 text-sm leading-relaxed">
                  毎日アプリを開いて、その日のタスクをこなすだけ。進捗に合わせてロードマップを更新しながら、試験日までの「攻略」を続けていく。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-[#3A405A]">
              料金プラン
            </h2>

            <div className="bg-[#3A405A] rounded-2xl p-8 md:p-10 text-white max-w-2xl mx-auto shadow-xl">
              <p className="text-center mb-6 opacity-90">
                Roopy
                ロードマップ機能は、月額1,000円のシンプルなサブスクで利用できます。
              </p>

              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-[#5DDFC3]">¥1,000</span>
                  <span className="text-lg opacity-90"> / 月</span>
                </div>
                <p className="text-center text-sm opacity-90 mb-4">
                  7日間の無料トライアル付き
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                    期間中はすべての有料機能が利用可能
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                    期間内に解約すれば料金は発生しない
                  </li>
                </ul>
              </div>

              <h4 className="font-bold mb-3 text-[#5DDFC3]">含まれる機能：</h4>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  学習ロードマップ自動作成（教材×期間×学力レベル）
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  ロードマップ保存・編集
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  ガントチャート表示
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  日次タスク表示
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  進捗管理・リマインド通知
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  PDF出力（先生や保護者と共有可能）
                </li>
              </ul>

              <p className="text-xs opacity-70 text-center">
                ※ 年額プラン（¥9,800/年）も準備中です。
              </p>
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="py-16 px-4 bg-[#F4F9F7]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#3A405A]">
              こんな受験生におすすめです
            </h2>

            <div className="max-w-2xl mx-auto">
              <ul className="space-y-4">
                <li className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  <span className="text-[#3A405A]">
                    参考書は揃えたけど、「このままで間に合うのか」不安な人
                  </span>
                </li>
                <li className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  <span className="text-[#3A405A]">
                    勉強計画を立てても、いつも三日坊主で終わってしまう人
                  </span>
                </li>
                <li className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  <span className="text-[#3A405A]">
                    志望校ごとに「何をどこまでやるべきか」をはっきりさせたい人
                  </span>
                </li>
                <li className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  <span className="text-[#3A405A]">
                    無機化学・英単語・古文単語など、暗記系をもっと効率的に回したい人
                  </span>
                </li>
                <li className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#5DDFC3] flex-shrink-0 mt-0.5" />
                  <span className="text-[#3A405A]">
                    自分専用の「受験攻略ルート」を、アプリで管理したい人
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#3A405A]">
              よくある質問
            </h2>

            <div className="space-y-4">
              <FAQItem
                question="無料でも使えますか？"
                answer={
                  <>
                    一部機能は無料で利用できます。無料版ではクイズ機能やポイント・ランキングなどが使えます。
                    <br />
                    ロードマップの作成・保存・ガントチャート表示・リマインドは有料機能となります。
                  </>
                }
              />

              <FAQItem
                question="どのタイミングで課金されますか？"
                answer={
                  <>
                    初回登録から7日間は無料トライアル期間です。7日間が経過すると自動的に月額1,000円が課金されます。
                    <br />
                    期間中に解約すれば料金は発生しません。
                  </>
                }
              />

              <FAQItem
                question="高1・高2でも使えますか？"
                answer="共通テストレベルから難関大レベルまで、現在のレベルに合わせてロードマップを作成できます。"
              />

              <FAQItem
                question="塾や学校と一緒に使うことはできますか？"
                answer={
                  <>
                    PDF出力機能で先生と共有できます。
                    <br />
                    将来的に塾・予備校向けプランも提供予定です。
                  </>
                }
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section
          id="trial"
          className="py-20 px-4 bg-gradient-to-b from-[#F4F9F7] to-white"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#3A405A]">
              受験勉強を、「不安なマラソン」から
              <br className="hidden md:block" />
              「攻略ゲーム」に。
            </h2>

            <p className="text-lg text-[#3A405A] opacity-80 mb-10 max-w-2xl mx-auto leading-relaxed">
              「何を、いつまでに、どれくらい」やるべきかが決まれば、あとは毎日のタスクをこなすだけです。そのためのロードマップ作りと管理を、Roopyが全部引き受けます。
            </p>

            {/* TODO: App Storeリンクに差し替え */}
            <Link
              href="#trial"
              className="inline-block bg-[#5DDFC3] text-white text-lg font-bold py-4 px-10 rounded-full shadow-[0_8px_20px_rgba(93,223,195,0.4)] hover:shadow-[0_12px_24px_rgba(93,223,195,0.5)] hover:-translate-y-1 transition-all"
            >
              Roopy ロードマップを無料で試してみる（7日間無料）
            </Link>

            <p className="mt-6 text-[#3A405A] opacity-60">
              今すぐ始めて、あなた専用の受験ロードマップを作りましょう。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0F7F1] py-12 px-4">
        <div className="max-w-5xl mx-auto">
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
                <span className="font-bold text-lg text-[#3A405A]">Roopy</span>
              </div>
              <p className="text-sm text-[#3A405A] opacity-70">
                大学受験を"毎日つづけられる"ゲームにする
              </p>
            </div>

            {/* サービス */}
            <div>
              <h3 className="font-bold mb-3 text-[#3A405A]">サービス</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/home"
                    className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
                  >
                    Roopy トップ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
                  >
                    ブログ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
                  >
                    ログイン
                  </Link>
                </li>
              </ul>
            </div>

            {/* 法的情報 */}
            <div>
              <h3 className="font-bold mb-3 text-[#3A405A]">法的情報</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
                  >
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>

            {/* お問い合わせ */}
            <div>
              <h3 className="font-bold mb-3 text-[#3A405A]">お問い合わせ</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="https://x.com/Edore_handai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#5DDFC3] hover:text-[#4ECFB3] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

          <div className="border-t border-[#E0F7F1] pt-6 text-center text-sm text-[#3A405A] opacity-60">
            <p>&copy; 2025 Edore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
