import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Image from 'next/image'
import { Newspaper, Headphones, TrendingUp, Calendar, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

export default async function EnglishHomePage() {
  const profile = await getCurrentProfile()

  // ログイン済みの場合はニュース一覧へリダイレクト
  if (profile) {
    const { redirect } = await import('next/navigation')
    redirect('/english/news')
  }

  // 未ログインの場合は公開ホームページを表示
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/english" className="flex items-center gap-2">
            <Image
              src="/english/favicon-48x48.png"
              alt="Roopy English"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-[#3A405A]">Roopy English</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/english/login"
              className="text-[#3A405A] hover:text-cyan-600 font-medium transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/english/signup"
              className="bg-cyan-500 text-white px-4 py-2 rounded-full font-bold hover:bg-cyan-600 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            毎朝届く英語ニュース
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#3A405A] mb-6 leading-tight">
            日本のニュースを<br />
            <span className="text-cyan-600">英語で聴く</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            毎朝7時頃に約20本の最新ニュースを英語音声で配信。
            リスニング力を毎日コツコツ鍛えましょう。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/english/signup"
              className="inline-flex items-center justify-center gap-2 bg-cyan-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-cyan-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <Headphones className="w-5 h-5" />
              無料で始める
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/english/news"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#3A405A] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors border-2 border-gray-200"
            >
              <Newspaper className="w-5 h-5" />
              今日のニュースを見る
            </Link>
          </div>

          {/* Free Trial Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            毎日2本まで無料で視聴可能
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center text-[#3A405A] mb-12">
            Roopy Englishの<span className="text-cyan-600">特徴</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="font-bold text-[#3A405A] text-lg mb-2">毎日更新</h3>
              <p className="text-gray-600">
                毎朝7時頃に最新の日本ニュースを英語スクリプト付きで配信
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-[#3A405A] text-lg mb-2">レベル調整済み</h3>
              <p className="text-gray-600">
                受験レベル（CEFR A2-B1）の英語で無理なく学習を続けられます
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-[#3A405A] text-lg mb-2">字幕・速度調整</h3>
              <p className="text-gray-600">
                英語/日本語字幕の切り替え、再生速度の調整が可能
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-[#3A405A] mb-4">
            料金プラン
          </h2>
          <p className="text-center text-gray-600 mb-12">
            まずは無料で試してみてください
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 無料プラン */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <h3 className="font-bold text-[#3A405A] text-lg mb-2">無料プラン</h3>
              <div className="text-3xl font-black text-[#3A405A] mb-4">¥0</div>
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  当日のニュース2本まで
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  英語音声・スクリプト
                </li>
              </ul>
              <Link
                href="/english/signup"
                className="block w-full py-3 bg-gray-100 text-[#3A405A] text-center rounded-full font-bold hover:bg-gray-200 transition-colors"
              >
                無料で始める
              </Link>
            </div>

            {/* 月額プラン */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <h3 className="font-bold text-[#3A405A] text-lg mb-2">月額プラン</h3>
              <div className="text-3xl font-black text-[#3A405A] mb-4">
                ¥980<span className="text-base font-normal text-gray-500">/月</span>
              </div>
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  全ニュース見放題
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  日本語字幕
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  重要単語リスト
                </li>
              </ul>
              <Link
                href="/english/signup?plan=monthly"
                className="block w-full py-3 bg-cyan-500 text-white text-center rounded-full font-bold hover:bg-cyan-600 transition-colors"
              >
                月額プランで始める
              </Link>
            </div>

            {/* 年間プラン */}
            <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-6 text-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  2ヶ月分お得
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2 pt-2">年間プラン</h3>
              <div className="text-3xl font-black mb-1">
                ¥9,800<span className="text-base font-normal opacity-80">/年</span>
              </div>
              <p className="text-xs opacity-80 mb-4">月あたり約¥817</p>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-300" />
                  全ニュース見放題
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-300" />
                  日本語字幕
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-300" />
                  重要単語リスト
                </li>
              </ul>
              <Link
                href="/english/signup?plan=yearly"
                className="block w-full py-3 bg-white text-cyan-600 text-center rounded-full font-bold hover:bg-opacity-90 transition-colors"
              >
                年間プランで始める
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-cyan-500 to-teal-500">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-black mb-4">
            今すぐ始めよう
          </h2>
          <p className="mb-8 opacity-90">
            毎日2本のニュースを無料で視聴できます
          </p>
          <Link
            href="/english/signup"
            className="inline-flex items-center gap-2 bg-white text-cyan-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-colors shadow-lg"
          >
            無料アカウントを作成
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#3A405A] text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/english/favicon-48x48.png"
                alt="Roopy English"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold">Roopy English</span>
            </div>
            <div className="flex gap-6 text-sm opacity-80">
              <Link href="/english/terms" className="hover:opacity-100">利用規約</Link>
              <Link href="/english/privacy" className="hover:opacity-100">プライバシー</Link>
              <Link href="/english/legal" className="hover:opacity-100">特定商取引法</Link>
            </div>
          </div>
          <div className="text-center text-sm opacity-60 mt-6">
            © 2024 Edore. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
