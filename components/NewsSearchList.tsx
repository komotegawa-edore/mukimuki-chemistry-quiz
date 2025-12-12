'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, ChevronRight, Clock, Search, X, Lock, Sparkles, Headphones } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

interface DailyNews {
  id: string
  news_date: string
  category: string
  original_title: string
  english_script: string
  level: string
  audio_url: string | null
}

// カテゴリの優先順位（この順番でソート）
const CATEGORY_ORDER = [
  'top',
  'headlines',
  'business',
  'technology',
  'world',
  'politics',
  'economy',
  'science',
  'health',
  'sports',
  'entertainment',
  'lifestyle',
  'environment',
  'automotive',
]

// 無料で閲覧できる当日ニュースの数
const FREE_TODAY_LIMIT = 2

interface Props {
  news: DailyNews[]
}

export default function NewsSearchList({ news }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const { hasAccess, loading: subscriptionLoading } = useSubscription()

  // 今日の日付（JST）
  const today = useMemo(() => {
    const now = new Date()
    const jstOffset = 9 * 60 * 60 * 1000
    const jst = new Date(now.getTime() + jstOffset)
    return jst.toISOString().split('T')[0]
  }, [])

  // 重複排除＆カテゴリ順ソート＆フィルタリング
  const filteredNews = useMemo(() => {
    // タイトルで重複を排除
    const seenTitles = new Set<string>()
    const deduped = news.filter((item) => {
      if (seenTitles.has(item.original_title)) {
        return false
      }
      seenTitles.add(item.original_title)
      return true
    })

    // カテゴリ順でソート
    const sorted = [...deduped].sort((a, b) => {
      const orderA = CATEGORY_ORDER.indexOf(a.category)
      const orderB = CATEGORY_ORDER.indexOf(b.category)
      // 見つからない場合は末尾に
      const indexA = orderA === -1 ? 999 : orderA
      const indexB = orderB === -1 ? 999 : orderB
      return indexA - indexB
    })

    // キーワード検索
    return sorted.filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = item.original_title.toLowerCase().includes(query)
        const matchesScript = item.english_script.toLowerCase().includes(query)
        if (!matchesTitle && !matchesScript) {
          return false
        }
      }
      return true
    })
  }, [news, searchQuery])

  // 日付でグループ化
  const newsByDate = useMemo(() => {
    const map = new Map<string, DailyNews[]>()
    filteredNews.forEach((item) => {
      const date = item.news_date
      if (!map.has(date)) {
        map.set(date, [])
      }
      map.get(date)?.push(item)
    })
    return map
  }, [filteredNews])

  const dates = Array.from(newsByDate.keys())

  const clearSearch = () => {
    setSearchQuery('')
  }

  // 今日のおすすめを取得（今日の最初の記事）
  const todayItems = newsByDate.get(today) || []
  const recommendedItem = todayItems.length > 0 ? todayItems[0] : null

  return (
    <div>
      {/* 検索UI */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワードで検索..."
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredNews.length}件の記事が見つかりました
            </span>
            <button
              onClick={clearSearch}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              クリア
            </button>
          </div>
        )}
      </div>

      {/* 今日のおすすめ */}
      {recommendedItem && !searchQuery && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">今日のおすすめ</h2>
          </div>
          <RecommendedCard
            item={recommendedItem}
            hasAccess={hasAccess}
            news={news}
          />
        </div>
      )}

      {/* ニュース一覧 */}
      {dates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            該当する記事が見つかりません
          </h2>
          <p className="text-gray-600 mb-4">
            検索条件を変更してお試しください
          </p>
          <button
            onClick={clearSearch}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            検索をクリア
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map((date) => {
            const items = newsByDate.get(date) || []
            const dateObj = new Date(date)
            const isToday = date === today
            // 今日のおすすめを除外（重複表示を避ける）
            const displayItems = isToday && !searchQuery
              ? items.slice(1)
              : items

            if (displayItems.length === 0) return null

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

                <div className="grid gap-3 sm:grid-cols-2">
                  {displayItems.map((item, itemIndex) => {
                    // おすすめを除外した後のインデックス調整
                    const actualIndex = isToday && !searchQuery ? itemIndex + 1 : itemIndex
                    const wordCount = item.english_script.split(' ').length
                    const readingTime = Math.ceil(wordCount / 150)

                    const allItemsForDate = news.filter(n => n.news_date === date)
                    const index = allItemsForDate.findIndex(n => n.id === item.id)

                    const isLocked = !hasAccess && (
                      !isToday || actualIndex >= FREE_TODAY_LIMIT
                    )

                    if (isLocked) {
                      return (
                        <div
                          key={item.id}
                          className="bg-white/60 rounded-xl p-4 border border-gray-200 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent backdrop-blur-[2px]" />
                          <div className="opacity-50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                約{readingTime}分
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2">
                              {item.original_title}
                            </h3>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Link
                              href="/lp/english"
                              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-shadow"
                            >
                              <Lock className="w-3 h-3" />
                              プレミアム
                            </Link>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.id}
                        href={`/english/news/${date}?index=${index}`}
                        className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            約{readingTime}分
                          </span>
                          {actualIndex < FREE_TODAY_LIMIT && isToday && !hasAccess && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                              無料
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                          {item.original_title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {item.english_script.substring(0, 80)}...
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// おすすめカード用のコンポーネント
function RecommendedCard({
  item,
  hasAccess,
  news
}: {
  item: DailyNews
  hasAccess: boolean
  news: DailyNews[]
}) {
  const wordCount = item.english_script.split(' ').length
  const readingTime = Math.ceil(wordCount / 150)
  const allItemsForDate = news.filter(n => n.news_date === item.news_date)
  const index = allItemsForDate.findIndex(n => n.id === item.id)

  // おすすめ記事は常に無料（最初の記事なので）
  return (
    <Link
      href={`/english/news/${item.news_date}?index=${index}`}
      className="block bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white hover:shadow-xl transition-all group relative overflow-hidden"
    >
      {/* 装飾 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 rounded-full p-2">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              約{readingTime}分
            </span>
            {!hasAccess && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/20">
                無料
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:underline underline-offset-2">
          {item.original_title}
        </h3>

        <p className="text-sm opacity-80 line-clamp-2 mb-4">
          {item.english_script.substring(0, 120)}...
        </p>

        <div className="flex items-center gap-2 text-sm font-medium">
          今すぐ聞く
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
