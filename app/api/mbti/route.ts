import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Service role client for anonymous inserts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mbti_type } = body

    if (!mbti_type || typeof mbti_type !== 'string' || mbti_type.length !== 4) {
      return NextResponse.json({ error: 'Invalid MBTI type' }, { status: 400 })
    }

    // Get tracking info from headers and URL
    const userAgent = request.headers.get('user-agent') || null
    const referrer = request.headers.get('referer') || null

    // Parse URL for UTM params
    const url = new URL(request.url)
    const utm_source = body.utm_source || url.searchParams.get('utm_source')
    const utm_medium = body.utm_medium || url.searchParams.get('utm_medium')
    const utm_campaign = body.utm_campaign || url.searchParams.get('utm_campaign')

    const { data, error } = await supabaseAdmin
      .from('mukimuki_mbti_results')
      .insert({
        mbti_type: mbti_type.toUpperCase(),
        user_agent: userAgent,
        referrer: referrer,
        utm_source,
        utm_medium,
        utm_campaign,
      })
      .select('session_id')
      .single()

    if (error) {
      console.error('Error saving MBTI result:', error)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session_id: data.session_id
    })
  } catch (error) {
    console.error('Error in MBTI API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
