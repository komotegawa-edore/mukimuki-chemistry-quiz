import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST: デイリーミッション達成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { chapter_id, completion_time_seconds } = body

    if (!chapter_id || completion_time_seconds === undefined) {
      return NextResponse.json({ error: '必要なパラメータがありません' }, { status: 400 })
    }

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ミッション達成関数を呼び出し
    const { data, error } = await supabase.rpc('complete_daily_mission', {
      p_user_id: user.id,
      p_chapter_id: chapter_id,
      p_completion_time_seconds: completion_time_seconds,
    })

    if (error) {
      console.error('Mission completion error:', error)
      return NextResponse.json({ error: 'ミッションの達成処理に失敗しました' }, { status: 500 })
    }

    const result = data && data.length > 0 ? data[0] : null

    if (!result) {
      return NextResponse.json({ error: '結果が取得できませんでした' }, { status: 500 })
    }

    return NextResponse.json({
      success: result.success,
      reward_given: result.reward_given,
      message: result.message,
    })

  } catch (error) {
    console.error('Daily mission complete error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
