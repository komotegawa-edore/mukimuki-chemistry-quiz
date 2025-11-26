import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST: お知らせを既読にする
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { announcement_id } = body

    if (!announcement_id) {
      return NextResponse.json({ error: 'announcement_id is required' }, { status: 400 })
    }

    // 既読記録を挿入（重複は無視）
    const { error } = await supabase
      .from('mukimuki_announcement_reads')
      .upsert(
        {
          user_id: user.id,
          announcement_id,
          read_at: new Date().toISOString()
        },
        { onConflict: 'user_id,announcement_id' }
      )

    if (error) {
      console.error('Failed to mark announcement as read:', error)
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error in POST /api/announcements/read:', error)
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}
