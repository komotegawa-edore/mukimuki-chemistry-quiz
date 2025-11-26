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
      return NextResponse.json({ missions: [], disabled: true }, { status: 200 })
    }

    // 複数デイリーミッション生成関数を呼び出し
    const { data, error } = await supabase.rpc('generate_daily_missions', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Daily missions generation error:', error)
      // 旧関数にフォールバック
      const { data: fallbackData, error: fallbackError } = await supabase.rpc('generate_daily_mission', {
        p_user_id: user.id,
      })

      if (fallbackError) {
        return NextResponse.json({ error: 'ミッションの生成に失敗しました' }, { status: 500 })
      }

      const mission = fallbackData && fallbackData.length > 0 ? fallbackData[0] : null
      if (!mission) {
        return NextResponse.json({ missions: [] }, { status: 200 })
      }

      return NextResponse.json({
        missions: [{
          id: mission.mission_id,
          mission_number: 1,
          chapter_id: mission.chapter_id,
          chapter_title: mission.chapter_title,
          subject_name: mission.subject_name,
          time_limit_seconds: mission.time_limit_seconds,
          reward_points: mission.reward_points,
          time_limit_minutes: Math.floor(mission.time_limit_seconds / 60),
          status: 'active',
        }],
        // 後方互換性のため単一ミッションも返す
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
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ missions: [] }, { status: 200 })
    }

    const missions = data.map((m: any) => ({
      id: m.mission_id,
      mission_number: m.mission_number,
      chapter_id: m.chapter_id,
      chapter_title: m.chapter_title,
      subject_name: m.subject_name,
      time_limit_seconds: m.time_limit_seconds,
      reward_points: m.reward_points,
      time_limit_minutes: Math.floor(m.time_limit_seconds / 60),
      status: m.status,
    }))

    // 最初のアクティブなミッションを単一ミッションとしても返す（後方互換性）
    const activeMission = missions.find((m: any) => m.status === 'active')

    return NextResponse.json({
      missions,
      mission: activeMission || null,
    })

  } catch (error) {
    console.error('Daily mission GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
