'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ExternalLink,
  RefreshCw,
  Calendar,
  Filter,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

interface OverviewStats {
  totalEvents: number
  uniqueUsers: number
  totalSignups: number
  totalSubscriptions: number
  totalRevenue: number
  conversionRate: string | number
}

interface DailyStats {
  date: string
  pageViews: number
  sessions: number
  signups: number
  subscriptions: number
}

interface SourceStats {
  source: string
  signups: number
  subscriptions: number
  revenue: number
  conversionRate: string
}

interface CampaignStats {
  campaign: string
  signups: number
  subscriptions: number
  revenue: number
  conversionRate: string
}

interface TikTokStats {
  campaign: string
  content: string
  impressions: number
  uniqueVisitors: number
  signups: number
  conversions: number
  signupRate: string
}

interface FunnelStats {
  steps: Array<{ name: string; count: number; rate: number | string }>
  totalConversionRate: string | number
}

interface DashboardData {
  overview: OverviewStats
  daily: DailyStats[]
  bySource: SourceStats[]
  byCampaign: CampaignStats[]
  tiktok: TikTokStats[]
  funnel: FunnelStats
  period: { start: string; end: string; days: number }
}

export default function AdsAnalyticsDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [sourceFilter, setSourceFilter] = useState<string>('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days: days.toString() })
      if (sourceFilter) params.append('source', sourceFilter)

      const res = await fetch(`/api/english/analytics/dashboard?${params}`)
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (res.status === 403) {
        setError('アクセス権限がありません')
        return
      }
      if (!res.ok) throw new Error('データ取得に失敗しました')

      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [days, sourceFilter, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-blue-600 hover:underline"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Roopy English 広告分析
                  </h1>
                  <p className="text-sm text-gray-500">TikTok広告パフォーマンス</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* 期間選択 */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value={7}>過去7日</option>
                  <option value={14}>過去14日</option>
                  <option value={30}>過去30日</option>
                  <option value={90}>過去90日</option>
                </select>
              </div>

              {/* ソースフィルタ */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">全ソース</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="organic">Organic</option>
                  <option value="direct">Direct</option>
                </select>
              </div>

              {/* 更新ボタン */}
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                更新
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="ユニークユーザー"
                value={data.overview.uniqueUsers.toLocaleString()}
                icon={<Users className="w-5 h-5" />}
                color="blue"
              />
              <StatCard
                title="会員登録"
                value={data.overview.totalSignups.toLocaleString()}
                icon={<Target className="w-5 h-5" />}
                color="green"
              />
              <StatCard
                title="有料登録"
                value={data.overview.totalSubscriptions.toLocaleString()}
                icon={<TrendingUp className="w-5 h-5" />}
                color="purple"
              />
              <StatCard
                title="収益"
                value={`¥${data.overview.totalRevenue.toLocaleString()}`}
                icon={<DollarSign className="w-5 h-5" />}
                color="yellow"
                subtitle={`CVR: ${data.overview.conversionRate}%`}
              />
            </div>

            {/* Funnel Analysis */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">ファネル分析</h2>
              <div className="flex items-center justify-between gap-4">
                {data.funnel.steps.map((step, index) => (
                  <div key={step.name} className="flex-1 text-center">
                    <div
                      className="mx-auto mb-2 rounded-lg flex items-center justify-center"
                      style={{
                        width: `${Math.max(40, 100 - index * 20)}%`,
                        height: '60px',
                        backgroundColor: `rgba(59, 130, 246, ${1 - index * 0.25})`,
                      }}
                    >
                      <span className="text-white font-bold text-lg">
                        {step.count.toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{step.name}</p>
                    <p className="text-sm text-gray-500">{step.rate}%</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                全体コンバージョン率: <span className="font-bold text-blue-600">{data.funnel.totalConversionRate}%</span>
              </div>
            </div>

            {/* TikTok Stats */}
            {data.tiktok.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold">TikTok キャンペーン別</h2>
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                    TikTok
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 font-medium">キャンペーン</th>
                        <th className="pb-3 font-medium">コンテンツ</th>
                        <th className="pb-3 font-medium text-right">訪問者</th>
                        <th className="pb-3 font-medium text-right">登録</th>
                        <th className="pb-3 font-medium text-right">有料化</th>
                        <th className="pb-3 font-medium text-right">登録率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tiktok.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 font-medium">{row.campaign}</td>
                          <td className="py-3 text-gray-600">{row.content}</td>
                          <td className="py-3 text-right">{row.uniqueVisitors.toLocaleString()}</td>
                          <td className="py-3 text-right">{row.signups}</td>
                          <td className="py-3 text-right">{row.conversions}</td>
                          <td className="py-3 text-right font-medium text-blue-600">
                            {row.signupRate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Source & Campaign Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Source */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">流入元別</h2>
                <div className="space-y-3">
                  {data.bySource.map((source) => (
                    <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <SourceIcon source={source.source} />
                        <div>
                          <p className="font-medium capitalize">{source.source}</p>
                          <p className="text-sm text-gray-500">
                            {source.signups}登録 / {source.subscriptions}有料
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">¥{source.revenue.toLocaleString()}</p>
                        <p className="text-sm text-green-600">CVR {source.conversionRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Campaign */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">キャンペーン別</h2>
                <div className="space-y-3">
                  {data.byCampaign.slice(0, 5).map((campaign) => (
                    <div key={campaign.campaign} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{campaign.campaign}</p>
                        <p className="text-sm text-gray-500">
                          {campaign.signups}登録 / {campaign.subscriptions}有料
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">¥{campaign.revenue.toLocaleString()}</p>
                        <p className="text-sm text-green-600">CVR {campaign.conversionRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Trend */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">日別推移</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 font-medium">日付</th>
                      <th className="pb-3 font-medium text-right">PV</th>
                      <th className="pb-3 font-medium text-right">セッション</th>
                      <th className="pb-3 font-medium text-right">登録</th>
                      <th className="pb-3 font-medium text-right">有料化</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.slice(-14).reverse().map((day) => (
                      <tr key={day.date} className="border-b last:border-0">
                        <td className="py-3">{formatDate(day.date)}</td>
                        <td className="py-3 text-right">{day.pageViews.toLocaleString()}</td>
                        <td className="py-3 text-right">{day.sessions.toLocaleString()}</td>
                        <td className="py-3 text-right font-medium text-blue-600">{day.signups}</td>
                        <td className="py-3 text-right font-medium text-green-600">{day.subscriptions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">クイックリンク</h2>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://ads.tiktok.com/i18n/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <span>TikTok Ads Manager</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://business.tiktok.com/ads-pixel/events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <span>TikTok Pixel Events</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <span>メインダッシュボード</span>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow'
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

// Source Icon Component
function SourceIcon({ source }: { source: string }) {
  const getColor = () => {
    switch (source.toLowerCase()) {
      case 'tiktok':
        return 'bg-pink-500'
      case 'instagram':
        return 'bg-gradient-to-br from-purple-500 to-pink-500'
      case 'google':
        return 'bg-blue-500'
      case 'facebook':
        return 'bg-blue-600'
      case 'twitter':
        return 'bg-sky-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className={`w-8 h-8 rounded-full ${getColor()} flex items-center justify-center text-white text-xs font-bold`}>
      {source.charAt(0).toUpperCase()}
    </div>
  )
}

// Date formatter
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
