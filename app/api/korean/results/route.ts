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
    const { sessionId, category, score, total, phraseIds, answers } = body

    if (!sessionId || score === undefined || total === undefined || !phraseIds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('mukimuki_korean_quiz_results')
      .insert({
        session_id: sessionId,
        category: category || null,
        score,
        total,
        phrase_ids: phraseIds,
        answers: answers || null,
      })

    if (error) {
      console.error('Error saving korean quiz result:', error)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Korean quiz results API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
