import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import EnglishInstallPrompt from '@/components/EnglishInstallPrompt'
import EnglishBottomNav from '@/components/EnglishBottomNav'
import { Newspaper } from 'lucide-react'
import NewsSearchList from '@/components/NewsSearchList'

interface DailyNews {
  id: string
  news_date: string
  category: string
  original_title: string
  english_script: string
  level: string
  audio_url: string | null
}

export default async function EnglishNewsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/english/login')
  }

  const supabase = await createClient()

  // 最新のニュースを取得（最大100件）
  const { data: news } = await supabase
    .from('mukimuki_daily_news')
    .select('*')
    .eq('is_published', true)
    .order('news_date', { ascending: false })
    .order('id', { ascending: true })
    .limit(100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EnglishInstallPrompt />
      <Header
        rightContent={
          <>
            <Link
              href="/english"
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded font-medium"
            >
              English Top
            </Link>
            <Link
              href="/"
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded font-medium"
            >
              受験対策へ
            </Link>
          </>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Newspaper className="w-5 h-5" />
            <span className="font-medium">Daily News</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            英語ニュース一覧
          </h1>
          <p className="text-gray-600 mt-2">
            毎日更新される英語ニュースを聞いて、リスニング力を鍛えましょう
          </p>
        </div>

        {!news || news.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              まだニュースがありません
            </h2>
            <p className="text-gray-600">
              毎朝7時に最新ニュースが配信されます
            </p>
          </div>
        ) : (
          <NewsSearchList news={news as DailyNews[]} />
        )}

        {/* ナビゲーションバー用の余白 */}
        <div className="h-20" />
      </main>

      <EnglishBottomNav />
    </div>
  )
}
