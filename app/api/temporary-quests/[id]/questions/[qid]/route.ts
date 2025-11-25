import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PUT: 問題更新（講師のみ）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const { qid } = await params
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
    if (question_text !== undefined && !question_text) {
      return NextResponse.json({ error: 'Question text cannot be empty' }, { status: 400 })
    }

    if (choices !== undefined) {
      if (!Array.isArray(choices) || choices.length < 2 || choices.length > 6) {
        return NextResponse.json({ error: 'Choices must be an array with 2-6 items' }, { status: 400 })
      }
    }

    if (correct_answer !== undefined && choices !== undefined) {
      if (correct_answer < 0 || correct_answer >= choices.length) {
        return NextResponse.json({ error: 'Invalid correct answer index' }, { status: 400 })
      }
    }

    if (points !== undefined && (points < 1 || points > 10)) {
      return NextResponse.json({ error: 'Points must be between 1 and 10' }, { status: 400 })
    }

    // undefined フィールドを除外してupdateDataを構築
    const updateData: Record<string, unknown> = {}
    if (question_text !== undefined) updateData.question_text = question_text
    if (choices !== undefined) updateData.choices = choices
    if (correct_answer !== undefined) updateData.correct_answer = correct_answer
    if (points !== undefined) updateData.points = points
    if (explanation !== undefined) updateData.explanation = explanation
    if (order_num !== undefined) updateData.order_num = order_num

    const { data, error } = await supabase
      .from('mukimuki_temporary_quest_questions')
      .update(updateData)
      .eq('id', qid)
      .select()
      .single()

    if (error) {
      console.error('Failed to update question:', error)
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }

    return NextResponse.json({ question: data })

  } catch (error) {
    console.error('Unexpected error in PUT /api/temporary-quests/[id]/questions/[qid]:', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

// DELETE: 問題削除（講師のみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const { qid } = await params
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

    const { error } = await supabase
      .from('mukimuki_temporary_quest_questions')
      .delete()
      .eq('id', qid)

    if (error) {
      console.error('Failed to delete question:', error)
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/temporary-quests/[id]/questions/[qid]:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
