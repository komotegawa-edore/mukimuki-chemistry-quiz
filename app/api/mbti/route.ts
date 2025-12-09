import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// シンプルなインメモリレートリミット（同一セッションからの連続リクエスト防止）
const recentRequests = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分
const MAX_REQUESTS_PER_WINDOW = 5

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // 古いエントリを削除
  const keysToDelete: string[] = []
  recentRequests.forEach((timestamp, key) => {
    if (timestamp < windowStart) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => recentRequests.delete(key))

  // このidentifierのリクエスト数をカウント
  let count = 0
  recentRequests.forEach((timestamp, key) => {
    if (key.startsWith(identifier) && timestamp >= windowStart) {
      count++
    }
  })

  if (count >= MAX_REQUESTS_PER_WINDOW) {
    return false // レートリミット超過
  }

  // 新しいリクエストを記録
  recentRequests.set(`${identifier}_${now}`, now)
  return true
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  // Vercelのジオヘッダーから位置情報を取得（IPアドレス自体は保存しない）
  const country = request.headers.get('x-vercel-ip-country') || null
  const region = request.headers.get('x-vercel-ip-country-region') || null
  const city = request.headers.get('x-vercel-ip-city') || null

  // レートリミット用のidentifier（国+地域で大まかに識別、プライバシー配慮）
  const rateLimitId = `${country || 'unknown'}_${region || 'unknown'}`

  if (!checkRateLimit(rateLimitId)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const body = await request.json()

    const { mbti_type } = body

    if (!mbti_type || typeof mbti_type !== 'string' || mbti_type.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid MBTI type', received: mbti_type },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || null
    const referrer = request.headers.get('referer') || null
    const utm_source = body.utm_source || null
    const utm_medium = body.utm_medium || null
    const utm_campaign = body.utm_campaign || null

    // SECURITY DEFINER関数を使用してRLSをバイパス
    const { data, error } = await supabase.rpc('insert_mbti_result', {
      p_mbti_type: mbti_type.toUpperCase(),
      p_user_agent: userAgent,
      p_referrer: referrer,
      p_utm_source: utm_source,
      p_utm_medium: utm_medium,
      p_utm_campaign: utm_campaign,
      p_country: country,
      p_region: region,
      p_city: city,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Database error', code: error.code, message: error.message },
        { status: 500 }
      )
    }

    console.log('Insert successful:', data)

    return NextResponse.json({
      success: true,
      session_id: data, // rpcは直接UUIDを返す
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: String(err) },
      { status: 500 }
    )
  }
}
