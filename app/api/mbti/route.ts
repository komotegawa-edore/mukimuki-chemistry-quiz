import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug log
  console.log('MBTI API called', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 30),
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Server configuration error', debug: 'Missing env vars' },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const body = await request.json()
    console.log('Request body:', body)

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

    console.log('Inserting MBTI result:', { mbti_type, userAgent, referrer })

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
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Database error', code: error.code, message: error.message },
        { status: 500 }
      )
    }

    console.log('Insert successful:', data)

    return NextResponse.json({
      success: true,
      session_id: data.session_id,
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: String(err) },
      { status: 500 }
    )
  }
}
