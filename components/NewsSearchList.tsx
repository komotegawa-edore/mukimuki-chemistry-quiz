'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, ChevronRight, Newspaper, Clock, Search, X, Filter } from 'lucide-react'

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
  science: { label: '科学', color: 'bg-cyan-100 text-cyan-700' },
  health: { label: '健康', color: 'bg-red-100 text-red-700' },
  politics: { label: '政治', color: 'bg-slate-100 text-slate-700' },
  economy: { label: '経済', color: 'bg-emerald-100 text-emerald-700' },
  automotive: { label: '自動車', color: 'bg-amber-100 text-amber-700' },
}

interface Props {
  news: DailyNews[]
}

export default function NewsSearchList({ news }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // フィルタリングされたニュース
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // カテゴリフィルタ
      if (selectedCategory && item.category !== selectedCategory) {
        return false
      }

      // キーワード検索
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
  }, [news, searchQuery, selectedCategory])

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

  // アクティブなフィルタの数
  const activeFilterCount = (selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
  }

  return (
    <div>
      {/* 検索・フィルタUI */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
        {/* 検索バー */}
        <div className="relative mb-3">
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

        {/* フィルタトグル */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
        >
          <Filter className="w-4 h-4" />
          カテゴリで絞り込む
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* カテゴリフィルタ */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedCategory === key
                      ? 'bg-blue-600 text-white'
                      : `${color} hover:opacity-80`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* アクティブフィルタ表示 */}
        {activeFilterCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredNews.length}件の記事が見つかりました
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              フィルタをクリア
            </button>
          </div>
        )}
      </div>

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
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            フィルタをクリア
          </button>
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
                  {items.map((item) => {
                    const category = CATEGORY_LABELS[item.category] || {
                      label: item.category,
                      color: 'bg-gray-100 text-gray-700',
                    }
                    const wordCount = item.english_script.split(' ').length
                    const readingTime = Math.ceil(wordCount / 150)

                    // ニュースIDからインデックスを取得
                    const allItemsForDate = news.filter(n => n.news_date === date)
                    const index = allItemsForDate.findIndex(n => n.id === item.id)

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
    </div>
  )
}
