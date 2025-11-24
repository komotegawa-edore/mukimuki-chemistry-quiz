import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 動的ルートとして明示
export const dynamic = 'force-dynamic'

// GET: 今日のデイリーミッションを取得（なければ生成）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // デイリーミッション機能が有効かチェック
    const { data: settings } = await supabase
      .from('mukimuki_system_settings')
      .select('setting_value')
      .eq('setting_key', 'daily_mission_enabled')
      .single()

    if (!settings || settings.setting_value !== 'true') {
      return NextResponse.json({ mission: null, disabled: true }, { status: 200 })
    }

    // デイリーミッション生成関数を呼び出し
    const { data, error } = await supabase.rpc('generate_daily_mission', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Daily mission generation error:', error)
      return NextResponse.json({ error: 'ミッションの生成に失敗しました' }, { status: 500 })
    }

    // 結果が配列で返ってくるので最初の要素を取得
    const mission = data && data.length > 0 ? data[0] : null

    if (!mission) {
      return NextResponse.json({ error: 'ミッションが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      mission: {
        id: mission.mission_id,
        chapter_id: mission.chapter_id,
        chapter_title: mission.chapter_title,
        subject_name: mission.subject_name,
        time_limit_seconds: mission.time_limit_seconds,
        reward_points: mission.reward_points,
        time_limit_minutes: Math.floor(mission.time_limit_seconds / 60),
      },
    })

  } catch (error) {
    console.error('Daily mission GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
