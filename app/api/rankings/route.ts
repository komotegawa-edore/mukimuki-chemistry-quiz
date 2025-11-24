import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 動的ルートとして明示
export const dynamic = 'force-dynamic'

// GET: ユーザーランキング取得（講師のみ）
export async function GET(request: NextRequest) {
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

    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden - Teacher access required' }, { status: 403 })
    }

    // ランキング取得（period パラメータで全期間/週間/カスタムを切り替え）
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all-time'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let data, error

    if (period === 'custom' && (startDate || endDate)) {
      // カスタム期間: start_date と end_date を使用
      const result = await supabase.rpc('get_user_ranking_with_date_range', {
        p_start_date: startDate || null,
        p_end_date: endDate || null
      })
      data = result.data
      error = result.error
    } else if (period === 'weekly') {
      // 週間: 過去7日間
      const result = await supabase.rpc('get_weekly_user_ranking_with_email')
      data = result.data
      error = result.error
    } else {
      // 全期間
      const result = await supabase.rpc('get_user_ranking_with_email')
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Failed to fetch rankings:', error)
      return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 })
    }

    return NextResponse.json({ rankings: data, period, startDate, endDate })

  } catch (error) {
    console.error('Unexpected error in GET /api/rankings:', error)
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 })
  }
}
