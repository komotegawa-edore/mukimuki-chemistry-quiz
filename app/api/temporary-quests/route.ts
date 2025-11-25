import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: 臨時クエスト一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ロール取得
    const { data: profile } = await supabase
      .from('mukimuki_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isTeacher = profile?.role === 'teacher'

    let query = supabase
      .from('mukimuki_temporary_quests')
      .select('*')
      .order('created_at', { ascending: false })

    // 生徒の場合は公開済みで有効なクエストのみ
    if (!isTeacher) {
      const now = new Date().toISOString()
      query = query
        .eq('is_published', true)
        .lte('start_date', now)
        .gte('end_date', now)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch temporary quests:', error)
      return NextResponse.json({ error: 'Failed to fetch temporary quests' }, { status: 500 })
    }

    return NextResponse.json({ quests: data })

  } catch (error) {
    console.error('Unexpected error in GET /api/temporary-quests:', error)
    return NextResponse.json({ error: 'Failed to fetch temporary quests' }, { status: 500 })
  }
}

// POST: 臨時クエスト作成（講師のみ）
export async function POST(request: NextRequest) {
  try {
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
      title,
      description,
      thumbnail_url,
      reward_points,
      passing_score,
      start_date,
      end_date,
      is_published
    } = body

    // 入力値バリデーション
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    if (!start_date || !end_date) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    if (reward_points && (reward_points < 1 || reward_points > 100)) {
      return NextResponse.json({ error: 'Reward points must be between 1 and 100' }, { status: 400 })
    }

    if (passing_score && (passing_score < 1 || passing_score > 100)) {
      return NextResponse.json({ error: 'Passing score must be between 1 and 100' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('mukimuki_temporary_quests')
      .insert({
        title,
        description,
        thumbnail_url: thumbnail_url || null,
        reward_points: reward_points || 5,
        passing_score: passing_score || 80,
        start_date,
        end_date,
        is_published: is_published || false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create temporary quest:', error)
      return NextResponse.json({ error: 'Failed to create temporary quest' }, { status: 500 })
    }

    return NextResponse.json({ quest: data })

  } catch (error) {
    console.error('Unexpected error in POST /api/temporary-quests:', error)
    return NextResponse.json({ error: 'Failed to create temporary quest' }, { status: 500 })
  }
}
