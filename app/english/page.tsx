import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import EnglishInstallPrompt from '@/components/EnglishInstallPrompt'
import EnglishBottomNav from '@/components/EnglishBottomNav'
import { Newspaper, Headphones, TrendingUp, Calendar } from 'lucide-react'

export default async function EnglishPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EnglishInstallPrompt />
      <Header
        rightContent={
          <>
            <Link
              href="/"
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded font-medium"
            >
              受験対策へ
            </Link>
          </>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Headphones className="w-4 h-4" />
            Roopy English
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            毎日の英語ニュースで<br />リスニング力を鍛えよう
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            日本のニュースを英語で聞く。毎朝5本の最新ニュースが届きます。
            受験対策から社会人の英語学習まで、継続的なリスニングトレーニングに。
          </p>
        </div>

        {/* Main CTA */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Today&apos;s News</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                今日のニュースを聞く
              </h2>
              <p className="text-gray-600 mb-4">
                5つのカテゴリ（テクノロジー、ビジネス、スポーツ、エンタメ、国際）から
                厳選されたニュースを英語で聞けます。
              </p>
              <Link
                href="/english/news"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                <Newspaper className="w-5 h-5" />
                ニュースを聞く
              </Link>
            </div>
            <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
              <Headphones className="w-24 h-24 text-white/80" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Newspaper className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">毎日更新</h3>
            <p className="text-gray-600 text-sm">
              毎朝7時に最新の日本ニュースが英語スクリプト付きで届きます
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">レベル調整済み</h3>
            <p className="text-gray-600 text-sm">
              受験レベル（CEFR A2-B1）の英語で、
              無理なく学習を続けられます
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Headphones className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">字幕切り替え</h3>
            <p className="text-gray-600 text-sm">
              英語字幕・日本語訳を切り替えて、
              理解度に合わせた学習ができます
            </p>
          </div>
        </div>

        {/* ナビゲーションバー用の余白 */}
        <div className="h-20" />
      </main>

      <EnglishBottomNav />
    </div>
  )
}
