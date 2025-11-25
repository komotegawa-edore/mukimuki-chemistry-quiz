import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: お知らせ一覧取得
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
      .from('mukimuki_announcements')
      .select('*')
      .order('created_at', { ascending: false })

    // 生徒の場合は公開済みで有効なお知らせのみ
    if (!isTeacher) {
      const now = new Date().toISOString()
      query = query
        .eq('is_published', true)
        .lte('valid_from', now)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch announcements:', error)
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
    }

    return NextResponse.json({ announcements: data })

  } catch (error) {
    console.error('Unexpected error in GET /api/announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

// POST: お知らせ作成（講師のみ）
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
    const { title, content, priority, is_published, valid_from, valid_until } = body

    // 入力値バリデーション
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    if (priority && !['normal', 'important', 'urgent'].includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority value' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('mukimuki_announcements')
      .insert({
        title,
        content,
        priority: priority || 'normal',
        is_published: is_published || false,
        valid_from: valid_from || new Date().toISOString(),
        valid_until: valid_until || null,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create announcement:', error)
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
    }

    return NextResponse.json({ announcement: data })

  } catch (error) {
    console.error('Unexpected error in POST /api/announcements:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
