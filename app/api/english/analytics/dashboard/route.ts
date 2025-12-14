import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者チェック
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const source = searchParams.get('source') // 特定のソースでフィルタ

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString()

    // 並列でデータ取得
    const [
      overviewResult,
      dailyResult,
      sourceResult,
      campaignResult,
      tiktokResult,
      funnelResult,
    ] = await Promise.all([
      // 概要統計
      getOverviewStats(supabaseAdmin, startDateStr, source),
      // 日別推移
      getDailyStats(supabaseAdmin, startDateStr, source),
      // ソース別
      getSourceStats(supabaseAdmin, startDateStr),
      // キャンペーン別
      getCampaignStats(supabaseAdmin, startDateStr, source),
      // TikTok詳細
      getTikTokStats(supabaseAdmin, startDateStr),
      // ファネル分析
      getFunnelStats(supabaseAdmin, startDateStr, source),
    ])

    return NextResponse.json({
      overview: overviewResult,
      daily: dailyResult,
      bySource: sourceResult,
      byCampaign: campaignResult,
      tiktok: tiktokResult,
      funnel: funnelResult,
      period: {
        start: startDateStr,
        end: new Date().toISOString(),
        days,
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOverviewStats(supabase: any, startDate: string, source: string | null) {
  // イベント統計
  let eventsQuery = supabase
    .from('english_analytics_events')
    .select('event_name', { count: 'exact' })
    .gte('event_time', startDate)

  if (source) {
    eventsQuery = eventsQuery.eq('ad_source', source)
  }

  const { count: totalEvents } = await eventsQuery

  // ユニークユーザー
  const { data: uniqueUsers } = await supabase
    .from('english_analytics_events')
    .select('user_id')
    .gte('event_time', startDate)
    .not('user_id', 'is', null)

  const uniqueUserCount = new Set(uniqueUsers?.map((u: { user_id: string }) => u.user_id)).size

  // 獲得統計
  let acquisitionQuery = supabase
    .from('english_user_acquisition')
    .select('*')
    .gte('signup_date', startDate)

  if (source) {
    acquisitionQuery = acquisitionQuery.eq('first_touch_source', source)
  }

  const { data: acquisitions } = await acquisitionQuery

  const totalSignups = acquisitions?.length || 0
  const totalSubscriptions = acquisitions?.filter((a: { is_subscribed: boolean }) => a.is_subscribed).length || 0
  const totalRevenue = acquisitions?.reduce((sum: number, a: { subscription_value: number | null }) => sum + (a.subscription_value || 0), 0) || 0
  const conversionRate = totalSignups > 0 ? (totalSubscriptions / totalSignups * 100).toFixed(2) : 0

  return {
    totalEvents,
    uniqueUsers: uniqueUserCount,
    totalSignups,
    totalSubscriptions,
    totalRevenue,
    conversionRate,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDailyStats(supabase: any, startDate: string, source: string | null) {
  let query = supabase
    .from('english_analytics_events')
    .select('event_time, event_name, session_id')
    .gte('event_time', startDate)
    .order('event_time', { ascending: true })

  if (source) {
    query = query.eq('ad_source', source)
  }

  const { data: events } = await query

  // 日別に集計
  const dailyMap = new Map<string, { pageViews: number; sessions: Set<string>; signups: number; subscriptions: number }>()

  events?.forEach((event: { event_time: string; event_name: string; session_id: string }) => {
    const date = event.event_time.split('T')[0]
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { pageViews: 0, sessions: new Set(), signups: 0, subscriptions: 0 })
    }
    const day = dailyMap.get(date)!

    if (event.event_name === 'page_view') {
      day.pageViews++
      if (event.session_id) day.sessions.add(event.session_id)
    }
    if (event.event_name === 'signup') day.signups++
    if (event.event_name === 'subscription_start') day.subscriptions++
  })

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    pageViews: data.pageViews,
    sessions: data.sessions.size,
    signups: data.signups,
    subscriptions: data.subscriptions,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSourceStats(supabase: any, startDate: string) {
  const { data: acquisitions } = await supabase
    .from('english_user_acquisition')
    .select('first_touch_source, is_subscribed, subscription_value')
    .gte('signup_date', startDate)

  // ソース別に集計
  const sourceMap = new Map<string, { signups: number; subscriptions: number; revenue: number }>()

  acquisitions?.forEach((a: { first_touch_source: string | null; is_subscribed: boolean; subscription_value: number | null }) => {
    const source = a.first_touch_source || 'direct'
    if (!sourceMap.has(source)) {
      sourceMap.set(source, { signups: 0, subscriptions: 0, revenue: 0 })
    }
    const stats = sourceMap.get(source)!
    stats.signups++
    if (a.is_subscribed) {
      stats.subscriptions++
      stats.revenue += a.subscription_value || 0
    }
  })

  return Array.from(sourceMap.entries())
    .map(([source, stats]) => ({
      source,
      signups: stats.signups,
      subscriptions: stats.subscriptions,
      revenue: stats.revenue,
      conversionRate: stats.signups > 0 ? (stats.subscriptions / stats.signups * 100).toFixed(2) : '0',
    }))
    .sort((a, b) => b.signups - a.signups)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCampaignStats(supabase: any, startDate: string, source: string | null) {
  let query = supabase
    .from('english_user_acquisition')
    .select('first_touch_campaign, first_touch_content, is_subscribed, subscription_value')
    .gte('signup_date', startDate)

  if (source) {
    query = query.eq('first_touch_source', source)
  }

  const { data: acquisitions } = await query

  // キャンペーン別に集計
  const campaignMap = new Map<string, { signups: number; subscriptions: number; revenue: number }>()

  acquisitions?.forEach((a: { first_touch_campaign: string | null; is_subscribed: boolean; subscription_value: number | null }) => {
    const campaign = a.first_touch_campaign || 'none'
    if (!campaignMap.has(campaign)) {
      campaignMap.set(campaign, { signups: 0, subscriptions: 0, revenue: 0 })
    }
    const stats = campaignMap.get(campaign)!
    stats.signups++
    if (a.is_subscribed) {
      stats.subscriptions++
      stats.revenue += a.subscription_value || 0
    }
  })

  return Array.from(campaignMap.entries())
    .map(([campaign, stats]) => ({
      campaign,
      signups: stats.signups,
      subscriptions: stats.subscriptions,
      revenue: stats.revenue,
      conversionRate: stats.signups > 0 ? (stats.subscriptions / stats.signups * 100).toFixed(2) : '0',
    }))
    .sort((a, b) => b.signups - a.signups)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTikTokStats(supabase: any, startDate: string) {
  // TikTokからの流入のみ
  const { data: events } = await supabase
    .from('english_analytics_events')
    .select('utm_campaign, utm_content, event_name, session_id')
    .gte('event_time', startDate)
    .or('ad_source.eq.tiktok,utm_source.ilike.%tiktok%,ttclid.not.is.null')

  // キャンペーン×コンテンツ別に集計
  const statsMap = new Map<string, { impressions: number; sessions: Set<string>; signups: number; conversions: number }>()

  events?.forEach((e: { utm_campaign: string | null; utm_content: string | null; event_name: string; session_id: string }) => {
    const key = `${e.utm_campaign || 'none'}|${e.utm_content || 'none'}`
    if (!statsMap.has(key)) {
      statsMap.set(key, { impressions: 0, sessions: new Set(), signups: 0, conversions: 0 })
    }
    const stats = statsMap.get(key)!

    if (e.event_name === 'page_view') {
      stats.impressions++
      if (e.session_id) stats.sessions.add(e.session_id)
    }
    if (e.event_name === 'signup') stats.signups++
    if (e.event_name === 'subscription_start') stats.conversions++
  })

  return Array.from(statsMap.entries())
    .map(([key, stats]) => {
      const [campaign, content] = key.split('|')
      return {
        campaign,
        content,
        impressions: stats.impressions,
        uniqueVisitors: stats.sessions.size,
        signups: stats.signups,
        conversions: stats.conversions,
        signupRate: stats.sessions.size > 0 ? (stats.signups / stats.sessions.size * 100).toFixed(2) : '0',
      }
    })
    .sort((a, b) => b.uniqueVisitors - a.uniqueVisitors)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getFunnelStats(supabase: any, startDate: string, source: string | null) {
  let query = supabase
    .from('english_analytics_events')
    .select('event_name, session_id')
    .gte('event_time', startDate)

  if (source) {
    query = query.eq('ad_source', source)
  }

  const { data: events } = await query

  // セッションベースでファネル分析
  const sessionEvents = new Map<string, Set<string>>()

  events?.forEach((e: { event_name: string; session_id: string }) => {
    if (!e.session_id) return
    if (!sessionEvents.has(e.session_id)) {
      sessionEvents.set(e.session_id, new Set())
    }
    sessionEvents.get(e.session_id)!.add(e.event_name)
  })

  let pageViews = 0
  let signups = 0
  let subscriptions = 0

  sessionEvents.forEach((events) => {
    if (events.has('page_view')) pageViews++
    if (events.has('signup')) signups++
    if (events.has('subscription_start')) subscriptions++
  })

  return {
    steps: [
      { name: 'ページ訪問', count: pageViews, rate: 100 },
      { name: '会員登録', count: signups, rate: pageViews > 0 ? (signups / pageViews * 100).toFixed(2) : 0 },
      { name: '有料登録', count: subscriptions, rate: signups > 0 ? (subscriptions / signups * 100).toFixed(2) : 0 },
    ],
    totalConversionRate: pageViews > 0 ? (subscriptions / pageViews * 100).toFixed(2) : 0,
  }
}
