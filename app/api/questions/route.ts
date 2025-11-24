import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('chapterId')

    // ユーザー情報を取得
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // プロフィール情報を取得してロールを確認
    let isTeacher = false
    if (user) {
      const { data: profile } = await supabase
        .from('mukimuki_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      isTeacher = profile?.role === 'teacher'
    }

    let query = supabase.from('mukimuki_questions').select('*').order('id', { ascending: true })

    if (chapterId) {
      query = query.eq('chapter_id', parseInt(chapterId))
    }

    // 生徒の場合は公開済み問題のみ取得
    if (!isTeacher) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch questions:', error)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in GET /api/questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
      chapter_id,
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

    // 入力値バリデーション
    if (!chapter_id || !Number.isInteger(chapter_id) || chapter_id <= 0) {
      return NextResponse.json({ error: 'Invalid chapter_id' }, { status: 400 })
    }

    if (!question_text || typeof question_text !== 'string' || question_text.trim() === '') {
      return NextResponse.json({ error: 'Invalid question_text' }, { status: 400 })
    }

    if (!choice_a || typeof choice_a !== 'string' || choice_a.trim() === '') {
      return NextResponse.json({ error: 'Invalid choice_a' }, { status: 400 })
    }

    if (!choice_b || typeof choice_b !== 'string' || choice_b.trim() === '') {
      return NextResponse.json({ error: 'Invalid choice_b' }, { status: 400 })
    }

    if (!choice_c || typeof choice_c !== 'string' || choice_c.trim() === '') {
      return NextResponse.json({ error: 'Invalid choice_c' }, { status: 400 })
    }

    if (!choice_d || typeof choice_d !== 'string' || choice_d.trim() === '') {
      return NextResponse.json({ error: 'Invalid choice_d' }, { status: 400 })
    }

    if (!['A', 'B', 'C', 'D'].includes(correct_answer)) {
      return NextResponse.json({ error: 'Invalid correct_answer. Must be A, B, C, or D' }, { status: 400 })
    }

    const validMediaTypes = ['text', 'image', 'audio', 'mixed']
    if (media_type && !validMediaTypes.includes(media_type)) {
      return NextResponse.json({ error: 'Invalid media_type' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('mukimuki_questions')
      .insert({
        chapter_id,
        question_text,
        choice_a,
        choice_b,
        choice_c,
        choice_d,
        correct_answer,
        explanation,
        media_type: media_type || 'text',
        question_image_url,
        question_audio_url,
        choice_a_image_url,
        choice_b_image_url,
        choice_c_image_url,
        choice_d_image_url,
        explanation_image_url,
        is_published: is_published ?? true,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create question:', error)
      return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/questions:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
