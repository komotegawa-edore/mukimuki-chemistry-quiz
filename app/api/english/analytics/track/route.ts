import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 許可するイベント名
const ALLOWED_EVENTS = [
  'page_view',
  'signup',
  'login',
  'subscription_start',
  'subscription_cancel',
  'news_play',
  'news_complete',
  'cta_click',
  'form_submit',
  'early_discount_view',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      event_name,
      user_id,
      session_id,
      ad_source,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      ttclid,
      page_path,
      landing_page,
      referrer,
      event_data,
    } = body

    // イベント名の検証
    if (!event_name || !ALLOWED_EVENTS.includes(event_name)) {
      return NextResponse.json(
        { error: 'Invalid event name' },
        { status: 400 }
      )
    }

    // デバイス情報を取得
    const userAgent = request.headers.get('user-agent') || ''
    const deviceType = getDeviceType(userAgent)
    const browser = getBrowser(userAgent)
    const os = getOS(userAgent)

    // 地域情報（Vercelのヘッダーから取得）
    const country = request.headers.get('x-vercel-ip-country') || null
    const region = request.headers.get('x-vercel-ip-country-region') || null

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // イベントを記録
    const { error } = await supabaseAdmin
      .from('english_analytics_events')
      .insert({
        user_id: user_id || null,
        session_id: session_id || generateSessionId(),
        event_name,
        event_time: new Date().toISOString(),
        ad_source: ad_source || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        ttclid: ttclid || null,
        page_path: page_path || null,
        landing_page: landing_page || null,
        referrer: referrer || null,
        event_data: event_data || {},
        device_type: deviceType,
        browser,
        os,
        country,
        region,
      })

    if (error) {
      console.error('Analytics tracking error:', error)
      // エラーでもクライアントには成功を返す（トラッキングの失敗でUXを損なわないため）
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ success: true }) // エラーでも成功を返す
  }
}

// セッションID生成
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// デバイスタイプ判定
function getDeviceType(userAgent: string): string {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

// ブラウザ判定
function getBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edg')) return 'Edge'
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'IE'
  return 'Other'
}

// OS判定
function getOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac')) return 'macOS'
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('Linux')) return 'Linux'
  return 'Other'
}
