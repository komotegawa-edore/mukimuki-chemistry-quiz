import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 今日クリアした章のIDリストを取得
    const { data: clearedChapters, error } = await supabase
      .from('mukimuki_chapter_clears')
      .select('chapter_id')
      .eq('user_id', user.id)
      .eq('cleared_date', new Date().toISOString().split('T')[0]) // 今日の日付

    if (error) {
      console.error('Failed to get cleared chapters:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // chapter_idの配列を返す
    const chapterIds = clearedChapters?.map((c) => c.chapter_id) || []

    return NextResponse.json({
      clearedChapterIds: chapterIds,
    })
  } catch (error) {
    console.error('Failed to fetch cleared chapters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cleared chapters' },
      { status: 500 }
    )
  }
}
