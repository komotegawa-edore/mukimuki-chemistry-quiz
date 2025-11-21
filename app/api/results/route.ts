import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const chapterId = searchParams.get('chapterId')

    let query = supabase
      .from('mukimuki_test_results')
      .select('*, mukimuki_chapters(id, title, order_num)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (chapterId) {
      query = query.eq('chapter_id', parseInt(chapterId))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch results' },
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
    const { chapter_id, score, total, answers } = body

    // テスト結果を保存
    const { data, error } = await supabase
      .from('mukimuki_test_results')
      .insert({
        user_id: user.id,
        chapter_id,
        score,
        total,
        answers,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 100%達成の場合、ポイントを付与（1日1回のみ）
    let pointsAwarded = false
    if (score === total && score > 0) {
      const { error: pointError } = await supabase
        .from('mukimuki_chapter_clears')
        .insert({
          user_id: user.id,
          chapter_id,
          points: 1,
        })

      // UNIQUE制約違反（すでに今日獲得済み）の場合はエラーを無視
      if (!pointError || pointError.code === '23505') {
        pointsAwarded = !pointError
      }
    }

    return NextResponse.json({ ...data, pointsAwarded }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create result' },
      { status: 500 }
    )
  }
}
