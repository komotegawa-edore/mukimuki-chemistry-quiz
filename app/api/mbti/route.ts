import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Use anon key since RLS allows anyone to insert
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase env vars')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const body = await request.json()
    const { mbti_type } = body

    if (!mbti_type || typeof mbti_type !== 'string' || mbti_type.length !== 4) {
      return NextResponse.json({ error: 'Invalid MBTI type' }, { status: 400 })
    }

    // Get tracking info from headers
    const userAgent = request.headers.get('user-agent') || null
    const referrer = request.headers.get('referer') || null

    // Parse UTM params from body
    const utm_source = body.utm_source || null
    const utm_medium = body.utm_medium || null
    const utm_campaign = body.utm_campaign || null

    const { data, error } = await supabase
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
      return NextResponse.json({ error: 'Failed to save result', details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session_id: data.session_id
    })
  } catch (error) {
    console.error('Error in MBTI API:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
