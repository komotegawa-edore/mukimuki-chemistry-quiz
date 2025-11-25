import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: 臨時クエスト詳細取得
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
      .from('mukimuki_temporary_quests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to fetch temporary quest:', error)
      return NextResponse.json({ error: 'Failed to fetch temporary quest' }, { status: 500 })
    }

    return NextResponse.json({ quest: data })

  } catch (error) {
    console.error('Unexpected error in GET /api/temporary-quests/[id]:', error)
    return NextResponse.json({ error: 'Failed to fetch temporary quest' }, { status: 500 })
  }
}

// PUT: 臨時クエスト更新（講師のみ）
export async function PUT(
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
    if (title !== undefined && !title) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
    }

    if (description !== undefined && !description) {
      return NextResponse.json({ error: 'Description cannot be empty' }, { status: 400 })
    }

    if (reward_points !== undefined && (reward_points < 1 || reward_points > 100)) {
      return NextResponse.json({ error: 'Reward points must be between 1 and 100' }, { status: 400 })
    }

    if (passing_score !== undefined && (passing_score < 1 || passing_score > 100)) {
      return NextResponse.json({ error: 'Passing score must be between 1 and 100' }, { status: 400 })
    }

    // undefined フィールドを除外してupdateDataを構築
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (reward_points !== undefined) updateData.reward_points = reward_points
    if (passing_score !== undefined) updateData.passing_score = passing_score
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (is_published !== undefined) updateData.is_published = is_published

    const { data, error } = await supabase
      .from('mukimuki_temporary_quests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update temporary quest:', error)
      return NextResponse.json({ error: 'Failed to update temporary quest' }, { status: 500 })
    }

    return NextResponse.json({ quest: data })

  } catch (error) {
    console.error('Unexpected error in PUT /api/temporary-quests/[id]:', error)
    return NextResponse.json({ error: 'Failed to update temporary quest' }, { status: 500 })
  }
}

// DELETE: 臨時クエスト削除（講師のみ）
export async function DELETE(
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
      .from('mukimuki_temporary_quests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete temporary quest:', error)
      return NextResponse.json({ error: 'Failed to delete temporary quest' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/temporary-quests/[id]:', error)
    return NextResponse.json({ error: 'Failed to delete temporary quest' }, { status: 500 })
  }
}
