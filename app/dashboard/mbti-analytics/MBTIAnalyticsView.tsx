'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brain, Users, TrendingUp, MapPin, CheckCircle } from 'lucide-react'

interface MBTIResult {
  id: number
  mbti_type: string
  session_id: string
  user_agent: string | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  country: string | null
  region: string | null
  created_at: string
  converted_at: string | null
  converted_user_id: string | null
}

interface TypeCount {
  mbti_type: string
  count: number
}

interface DailyCount {
  date: string
  count: number
}

export default function MBTIAnalyticsView() {
  const [results, setResults] = useState<MBTIResult[]>([])
  const [typeCounts, setTypeCounts] = useState<TypeCount[]>([])
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [convertedCount, setConvertedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)

    let query = supabase
      .from('mukimuki_mbti_results')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply date filter
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching MBTI results:', error)
      setLoading(false)
      return
    }

    const results = (data || []) as MBTIResult[]
    setResults(results)
    setTotalCount(results.length)
    setConvertedCount(results.filter((r: MBTIResult) => r.converted_at).length)

    // Calculate type counts
    const typeMap = new Map<string, number>()
    results.forEach((result: MBTIResult) => {
      typeMap.set(result.mbti_type, (typeMap.get(result.mbti_type) || 0) + 1)
    })
    const counts = Array.from(typeMap.entries())
      .map(([mbti_type, count]) => ({ mbti_type, count }))
      .sort((a, b) => b.count - a.count)
    setTypeCounts(counts)

    // Calculate daily counts
    const dailyMap = new Map<string, number>()
    results.forEach((result: MBTIResult) => {
      const date = result.created_at.split('T')[0]
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
    })
    const daily = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
    setDailyCounts(daily)

    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDeviceType = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown'
    if (/mobile/i.test(userAgent)) return 'Mobile'
    if (/tablet/i.test(userAgent)) return 'Tablet'
    return 'Desktop'
  }

  const conversionRate = totalCount > 0 ? ((convertedCount / totalCount) * 100).toFixed(1) : '0'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DDFC3]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex gap-2">
        {(['7d', '30d', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === range
                ? 'bg-[#5DDFC3] text-white'
                : 'bg-white text-[#3A405A] hover:bg-gray-100'
            }`}
          >
            {range === '7d' ? '7日間' : range === '30d' ? '30日間' : '全期間'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#E0F7F1] rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-[#5DDFC3]" />
            </div>
            <span className="text-sm text-gray-500">総診断数</span>
          </div>
          <p className="text-3xl font-bold text-[#3A405A]">{totalCount}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-gray-500">登録転換数</span>
          </div>
          <p className="text-3xl font-bold text-[#3A405A]">{convertedCount}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-gray-500">転換率</span>
          </div>
          <p className="text-3xl font-bold text-[#3A405A]">{conversionRate}%</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-gray-500">タイプ数</span>
          </div>
          <p className="text-3xl font-bold text-[#3A405A]">{typeCounts.length}</p>
        </div>
      </div>

      {/* Type Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#3A405A] mb-4">タイプ分布</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {[
            'INTJ', 'INTP', 'ENTJ', 'ENTP',
            'INFJ', 'INFP', 'ENFJ', 'ENFP',
            'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
            'ISTP', 'ISFP', 'ESTP', 'ESFP',
          ].map((type) => {
            const typeData = typeCounts.find((t) => t.mbti_type === type)
            const count = typeData?.count || 0
            const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : '0'
            return (
              <div
                key={type}
                className={`p-3 rounded-lg text-center ${
                  count > 0 ? 'bg-[#E0F7F1]' : 'bg-gray-50'
                }`}
              >
                <p className="font-bold text-sm text-[#3A405A]">{type}</p>
                <p className="text-lg font-bold text-[#5DDFC3]">{count}</p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily Chart (Simple) */}
      {dailyCounts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#3A405A] mb-4">日別診断数</h2>
          <div className="flex items-end gap-1 h-32">
            {dailyCounts.slice(-14).map((day) => {
              const maxCount = Math.max(...dailyCounts.map((d) => d.count))
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-[#5DDFC3] rounded-t"
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                  />
                  <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                    {day.date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* UTM Source Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#3A405A] mb-4">流入元分析</h2>
        <div className="space-y-2">
          {(() => {
            const sourceMap = new Map<string, number>()
            results.forEach((r) => {
              const source = r.utm_source || r.referrer || 'Direct'
              sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
            })
            return Array.from(sourceMap.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([source, count]) => (
                <div key={source} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-[#3A405A] truncate max-w-[70%]">{source}</span>
                  <span className="text-sm font-medium text-[#5DDFC3]">{count}件</span>
                </div>
              ))
          })()}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#3A405A] mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#5DDFC3]" />
          地域分布
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country Distribution */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">国別</h3>
            <div className="space-y-2">
              {(() => {
                const countryMap = new Map<string, number>()
                results.forEach((r) => {
                  const country = r.country || 'Unknown'
                  countryMap.set(country, (countryMap.get(country) || 0) + 1)
                })
                return Array.from(countryMap.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-[#3A405A]">{country === 'JP' ? '🇯🇵 日本' : country}</span>
                      <span className="text-sm font-medium text-[#5DDFC3]">{count}件</span>
                    </div>
                  ))
              })()}
            </div>
          </div>
          {/* Region Distribution (Japan only) */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">都道府県別（日本）</h3>
            <div className="space-y-2">
              {(() => {
                const regionMap = new Map<string, number>()
                results
                  .filter((r) => r.country === 'JP')
                  .forEach((r) => {
                    const region = r.region || 'Unknown'
                    regionMap.set(region, (regionMap.get(region) || 0) + 1)
                  })
                return Array.from(regionMap.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([region, count]) => (
                    <div key={region} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-[#3A405A]">{region}</span>
                      <span className="text-sm font-medium text-[#5DDFC3]">{count}件</span>
                    </div>
                  ))
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Results Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#3A405A] mb-4">最近の診断結果</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">日時</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">タイプ</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">デバイス</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">地域</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">流入元</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">転換</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 20).map((result) => (
                <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-[#3A405A]">{formatDate(result.created_at)}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-1 bg-[#E0F7F1] text-[#5DDFC3] rounded font-bold">
                      {result.mbti_type}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">{getDeviceType(result.user_agent)}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs">
                    {result.country === 'JP' && result.region ? result.region : (result.country || '-')}
                  </td>
                  <td className="py-3 px-2 text-gray-500 truncate max-w-[150px]">
                    {result.utm_source || result.utm_campaign || '-'}
                  </td>
                  <td className="py-3 px-2">
                    {result.converted_at ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
