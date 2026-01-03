import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const setId = searchParams.get('setId')

    if (setId) {
      // 特定のセットを取得
      const { data: set, error: setError } = await supabase
        .from('mukimuki_korean_listening_sets')
        .select('*')
        .eq('id', setId)
        .eq('is_published', true)
        .single()

      if (setError || !set) {
        return NextResponse.json({ error: 'Set not found' }, { status: 404 })
      }

      const { data: questions, error: questionsError } = await supabase
        .from('mukimuki_korean_listening_questions')
        .select('*')
        .eq('set_id', setId)
        .order('question_number')

      if (questionsError) {
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
      }

      return NextResponse.json({ set, questions })
    }

    // 全セット一覧を取得
    const { data: sets, error } = await supabase
      .from('mukimuki_korean_listening_sets')
      .select('id, set_number, category, audio_url')
      .eq('is_published', true)
      .order('set_number')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sets' }, { status: 500 })
    }

    return NextResponse.json({ sets })
  } catch (error) {
    console.error('Korean listening API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
