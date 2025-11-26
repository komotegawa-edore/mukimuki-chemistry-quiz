import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: 管理者用ガチャ情報（在庫、当選者一覧）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 講師権限チェック
    const { data: profile } = await supabase
      .from('mukimuki_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // 景品在庫状況を取得
    const { data: prizes, error: prizesError } = await supabase
      .from('mukimuki_gacha_prizes')
      .select('*')
      .order('display_order')

    if (prizesError) {
      return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 })
    }

    // 当選履歴を取得（ハズレ以外）
    const { data: historyData } = await supabase
      .from('mukimuki_gacha_history')
      .select(`
        id,
        user_id,
        points_used,
        is_claimed,
        created_at,
        prize:prize_id(id, name, description, prize_type, prize_value)
      `)
      .order('created_at', { ascending: false })

    // ハズレ以外をフィルタ
    const nonLoseHistory = historyData?.filter(w => {
      const prize = w.prize as unknown as { prize_type: string } | null
      return prize && prize.prize_type !== 'lose'
    }) || []

    // ユーザー情報を別途取得（profilesからname、auth.usersからemail）
    const userIds = Array.from(new Set(nonLoseHistory.map(h => h.user_id)))

    // profilesからname取得
    const { data: profilesData } = await supabase
      .from('mukimuki_profiles')
      .select('id, name')
      .in('id', userIds)

    // auth.usersからemail取得（RPC経由）
    const { data: emailsData } = await supabase.rpc('get_user_emails_for_admin', {
      user_ids: userIds
    })

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || [])
    const emailsMap = new Map(emailsData?.map((e: { id: string; email: string }) => [e.id, e.email]) || [])

    const usersMap = new Map(
      userIds.map(id => [
        id,
        {
          id,
          name: profilesMap.get(id)?.name || '不明',
          email: emailsMap.get(id) || '不明'
        }
      ])
    )

    // 当選者一覧を構築
    const winnerList = nonLoseHistory.map(h => ({
      id: h.id,
      is_claimed: h.is_claimed,
      created_at: h.created_at,
      prize: h.prize,
      user: usersMap.get(h.user_id) || null
    }))

    // 総ガチャ回数
    const { count: totalDraws } = await supabase
      .from('mukimuki_gacha_history')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      prizes: prizes || [],
      winners: winnerList,
      totalDraws: totalDraws || 0,
    })

  } catch (error) {
    console.error('Gacha admin GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// PUT: 景品在庫を更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 講師権限チェック
    const { data: profile } = await supabase
      .from('mukimuki_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const { prizeId, totalStock, remainingStock } = body

    const { error } = await supabase
      .from('mukimuki_gacha_prizes')
      .update({
        total_stock: totalStock,
        remaining_stock: remainingStock,
      })
      .eq('id', prizeId)

    if (error) {
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Gacha admin PUT error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
