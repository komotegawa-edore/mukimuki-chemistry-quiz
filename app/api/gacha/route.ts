import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: ガチャ情報を取得（景品一覧、履歴、除外チェック）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ガチャ機能の有効/無効チェック
    const { data: enabledSetting } = await supabase
      .from('mukimuki_system_settings')
      .select('setting_value')
      .eq('setting_key', 'gacha_enabled')
      .single()

    if (enabledSetting?.setting_value === 'false') {
      return NextResponse.json({ isDisabled: true })
    }

    // 除外ユーザーチェック（招待機能と同じリストを使用）
    const { data: excludedSetting } = await supabase
      .from('mukimuki_system_settings')
      .select('setting_value')
      .eq('setting_key', 'referral_excluded_user_ids')
      .single()

    let isExcluded = false
    if (excludedSetting?.setting_value) {
      try {
        const excludedIds = JSON.parse(excludedSetting.setting_value)
        isExcluded = Array.isArray(excludedIds) && excludedIds.includes(user.id)
      } catch {
        // JSON parse error - ignore
      }
    }

    if (isExcluded) {
      return NextResponse.json({ isExcluded: true })
    }

    // ユーザーのポイントを取得
    const { data: profile } = await supabase
      .from('mukimuki_profiles')
      .select('total_points')
      .eq('id', user.id)
      .single()

    // 景品一覧を取得
    const { data: prizes } = await supabase
      .from('mukimuki_gacha_prizes')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    // ガチャ履歴を取得（最新20件）
    const { data: history } = await supabase
      .from('mukimuki_gacha_history')
      .select(`
        id,
        points_used,
        is_claimed,
        created_at,
        prize:prize_id(id, name, description, prize_type, prize_value)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // 当選履歴（ハズレ以外）
    const { data: winHistory } = await supabase
      .from('mukimuki_gacha_history')
      .select(`
        id,
        is_claimed,
        created_at,
        prize:prize_id(id, name, description, prize_type, prize_value)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const wins = winHistory?.filter(h => {
      const prize = h.prize as unknown as { prize_type: string } | null
      return prize && prize.prize_type !== 'lose'
    }) || []

    return NextResponse.json({
      currentPoints: profile?.total_points || 0,
      prizes: prizes || [],
      history: history || [],
      wins,
      canDraw: (profile?.total_points || 0) >= 50,
    })

  } catch (error) {
    console.error('Gacha GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// POST: ガチャを引く
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ガチャを引く（DB関数を呼び出し）
    const { data: result, error } = await supabase.rpc('draw_gacha', {
      p_user_id: user.id
    })

    if (error) {
      console.error('Draw gacha error:', error)
      return NextResponse.json({ error: 'ガチャの実行に失敗しました' }, { status: 500 })
    }

    const gachaResult = result && result.length > 0 ? result[0] : null

    if (!gachaResult || !gachaResult.success) {
      return NextResponse.json({
        success: false,
        message: gachaResult?.message || 'ガチャを引けませんでした'
      })
    }

    return NextResponse.json({
      success: true,
      prize: {
        id: gachaResult.prize_id,
        name: gachaResult.prize_name,
        description: gachaResult.prize_description,
        type: gachaResult.prize_type,
        value: gachaResult.prize_value,
      },
      remainingPoints: gachaResult.remaining_points,
    })

  } catch (error) {
    console.error('Gacha POST error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
