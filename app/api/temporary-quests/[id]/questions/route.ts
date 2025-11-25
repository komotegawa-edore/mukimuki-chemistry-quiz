import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: 臨時クエストの問題一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('mukimuki_temporary_quest_questions')
      .select('*')
      .eq('quest_id', id)
      .order('order_num', { ascending: true })

    if (error) {
      console.error('Failed to fetch questions:', error)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    return NextResponse.json({ questions: data })

  } catch (error) {
    console.error('Unexpected error in GET /api/temporary-quests/[id]/questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

// POST: 問題追加（講師のみ）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quest_id } = await params
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 講師権限チェック
    const { data: profile } = await supabase
      .from('mukimuki_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden - Teacher access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      question_text,
      choices,
      correct_answer,
      points,
      explanation,
      order_num
    } = body

    // 入力値バリデーション
    if (!question_text) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
    }

    if (!choices || !Array.isArray(choices) || choices.length < 2 || choices.length > 6) {
      return NextResponse.json({ error: 'Choices must be an array with 2-6 items' }, { status: 400 })
    }

    if (correct_answer === undefined || correct_answer < 0 || correct_answer >= choices.length) {
      return NextResponse.json({ error: 'Invalid correct answer index' }, { status: 400 })
    }

    if (points !== undefined && (points < 1 || points > 10)) {
      return NextResponse.json({ error: 'Points must be between 1 and 10' }, { status: 400 })
    }

    if (order_num === undefined) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('mukimuki_temporary_quest_questions')
      .insert({
        quest_id: parseInt(quest_id),
        question_text,
        choices,
        correct_answer,
        points: points || 1,
        explanation: explanation || null,
        order_num
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create question:', error)
      return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
    }

    return NextResponse.json({ question: data })

  } catch (error) {
    console.error('Unexpected error in POST /api/temporary-quests/[id]/questions:', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
