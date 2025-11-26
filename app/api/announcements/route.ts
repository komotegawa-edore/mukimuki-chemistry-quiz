import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: お知らせ一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const displayType = searchParams.get('display_type')

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

    // 表示タイプでフィルター
    if (displayType === 'modal') {
      query = query.in('display_type', ['modal', 'both'])
    } else if (displayType === 'banner') {
      query = query.in('display_type', ['banner', 'both'])
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch announcements:', error)
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
    }

    // 生徒の場合、除外リストに含まれているお知らせを除外
    let filteredData = data || []
    if (!isTeacher) {
      filteredData = filteredData.filter(announcement => {
        const excludedIds = announcement.excluded_user_ids || []
        return !excludedIds.includes(user.id)
      })
    }

    // モーダル表示の場合、既読情報を追加
    if (displayType === 'modal' && filteredData.length > 0) {
      const announcementIds = filteredData.map(a => a.id)
      const { data: reads } = await supabase
        .from('mukimuki_announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id)
        .in('announcement_id', announcementIds)

      const readIds = new Set(reads?.map(r => r.announcement_id) || [])
      filteredData = filteredData.map(a => ({
        ...a,
        is_read: readIds.has(a.id)
      }))
    }

    return NextResponse.json({ announcements: filteredData })

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
    const { title, content, priority, is_published, valid_from, valid_until, display_type, excluded_user_ids } = body

    // 入力値バリデーション
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    if (priority && !['normal', 'important', 'urgent'].includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority value' }, { status: 400 })
    }

    if (display_type && !['banner', 'modal', 'both'].includes(display_type)) {
      return NextResponse.json({ error: 'Invalid display_type value' }, { status: 400 })
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
        display_type: display_type || 'banner',
        excluded_user_ids: excluded_user_ids || [],
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
