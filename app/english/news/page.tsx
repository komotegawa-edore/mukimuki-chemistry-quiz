import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import { Calendar, ChevronRight, Newspaper, Clock, Tag } from 'lucide-react'

interface DailyNews {
  id: string
  news_date: string
  category: string
  original_title: string
  english_script: string
  level: string
  audio_url: string | null
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  technology: { label: 'テクノロジー', color: 'bg-blue-100 text-blue-700' },
  business: { label: 'ビジネス', color: 'bg-green-100 text-green-700' },
  sports: { label: 'スポーツ', color: 'bg-orange-100 text-orange-700' },
  entertainment: { label: 'エンタメ', color: 'bg-pink-100 text-pink-700' },
  world: { label: '国際', color: 'bg-purple-100 text-purple-700' },
}

export default async function EnglishNewsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  const supabase = await createClient()

  // 最新のニュースを日付でグループ化して取得
  const { data: news } = await supabase
    .from('mukimuki_daily_news')
    .select('*')
    .eq('is_published', true)
    .order('news_date', { ascending: false })
    .order('id', { ascending: true })
    .limit(50)

  // 日付でグループ化
  const newsByDate = new Map<string, DailyNews[]>()
  news?.forEach((item) => {
    const date = item.news_date
    if (!newsByDate.has(date)) {
      newsByDate.set(date, [])
    }
    newsByDate.get(date)?.push(item)
  })

  const dates = Array.from(newsByDate.keys())

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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

        {dates.length === 0 ? (
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
          <div className="space-y-8">
            {dates.map((date) => {
              const items = newsByDate.get(date) || []
              const dateObj = new Date(date)
              const isToday = date === new Date().toISOString().split('T')[0]

              return (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-800">
                      {dateObj.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </h2>
                    {isToday && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4">
                    {items.map((item, index) => {
                      const category = CATEGORY_LABELS[item.category] || {
                        label: item.category,
                        color: 'bg-gray-100 text-gray-700',
                      }
                      const wordCount = item.english_script.split(' ').length
                      const readingTime = Math.ceil(wordCount / 150) // 150 words per minute

                      return (
                        <Link
                          key={item.id}
                          href={`/english/news/${date}?index=${index}`}
                          className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${category.color}`}
                                >
                                  {category.label}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  約{readingTime}分
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {item.original_title}
                              </h3>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {item.english_script.substring(0, 100)}...
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
