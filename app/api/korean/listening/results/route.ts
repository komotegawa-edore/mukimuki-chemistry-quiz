import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service Role Client（RLSバイパス）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, setId, category, score, total, answers } = body

    if (!sessionId || !setId || score === undefined || total === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('mukimuki_korean_listening_results')
      .insert({
        session_id: sessionId,
        set_id: setId,
        category: category || null,
        score,
        total,
        answers: answers || null,
      })

    if (error) {
      console.error('Error saving korean listening result:', error)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Korean listening results API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 統計取得（将来用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('mukimuki_korean_listening_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching listening results:', error)
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }

    return NextResponse.json({ results: data })
  } catch (error) {
    console.error('Korean listening results API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
