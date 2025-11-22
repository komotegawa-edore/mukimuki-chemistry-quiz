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
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
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

    const body = await request.json()
    const {
      chapter_id,
      question_text,
      choice_a,
      choice_b,
      choice_c,
      choice_d,
      correct_answer,
    } = body

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
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
