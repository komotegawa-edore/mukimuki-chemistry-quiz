import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 動的ルートとして明示
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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
      choice_a,
      choice_b,
      choice_c,
      choice_d,
      correct_answer,
      explanation,
      media_type,
      question_image_url,
      question_audio_url,
      choice_a_image_url,
      choice_b_image_url,
      choice_c_image_url,
      choice_d_image_url,
      explanation_image_url,
      is_published,
    } = body

    // undefined フィールドを除外
    const updateData: Record<string, unknown> = {}
    if (question_text !== undefined) updateData.question_text = question_text
    if (choice_a !== undefined) updateData.choice_a = choice_a
    if (choice_b !== undefined) updateData.choice_b = choice_b
    if (choice_c !== undefined) updateData.choice_c = choice_c
    if (choice_d !== undefined) updateData.choice_d = choice_d
    if (correct_answer !== undefined) updateData.correct_answer = correct_answer
    if (explanation !== undefined) updateData.explanation = explanation
    if (media_type !== undefined) updateData.media_type = media_type
    if (question_image_url !== undefined) updateData.question_image_url = question_image_url
    if (question_audio_url !== undefined) updateData.question_audio_url = question_audio_url
    if (choice_a_image_url !== undefined) updateData.choice_a_image_url = choice_a_image_url
    if (choice_b_image_url !== undefined) updateData.choice_b_image_url = choice_b_image_url
    if (choice_c_image_url !== undefined) updateData.choice_c_image_url = choice_c_image_url
    if (choice_d_image_url !== undefined) updateData.choice_d_image_url = choice_d_image_url
    if (explanation_image_url !== undefined) updateData.explanation_image_url = explanation_image_url
    if (is_published !== undefined) updateData.is_published = is_published
    updateData.updated_by = user.id

    const { data, error } = await supabase
      .from('mukimuki_questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update question:', error)
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in PUT /api/questions/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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

    const { error } = await supabase.from('mukimuki_questions').delete().eq('id', id)

    if (error) {
      console.error('Failed to delete question:', error)
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/questions/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
