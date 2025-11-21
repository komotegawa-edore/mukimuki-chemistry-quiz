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

    // ユーザーの順位情報を取得（カスタム関数を使用）
    const { data: rankData, error: rankError } = await supabase.rpc(
      'get_user_rank',
      { target_user_id: user.id }
    )

    if (rankError) {
      console.error('Failed to get user rank:', rankError)
      return NextResponse.json(
        { error: rankError.message },
        { status: 400 }
      )
    }

    // rankDataは配列で返ってくるので最初の要素を取得
    const userRankInfo = rankData?.[0] || {
      rank: null,
      total_points: 0,
      next_rank_points: 1,
    }

    return NextResponse.json({
      totalPoints: userRankInfo.total_points,
      rank: userRankInfo.rank,
      nextRankPoints: userRankInfo.next_rank_points,
      pointsNeeded: Math.max(
        0,
        userRankInfo.next_rank_points - userRankInfo.total_points
      ),
    })
  } catch (error) {
    console.error('Failed to fetch points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points' },
      { status: 500 }
    )
  }
}
