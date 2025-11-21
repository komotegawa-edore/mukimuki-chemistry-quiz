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

    // 全期間のランキング情報を取得
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

    // 週間ランキング情報を取得
    const { data: weeklyRankData, error: weeklyRankError } = await supabase.rpc(
      'get_user_weekly_rank',
      { target_user_id: user.id }
    )

    if (weeklyRankError) {
      console.error('Failed to get weekly rank:', weeklyRankError)
    }

    // RPCは配列を返すので、最初の要素を取得
    const userRankInfo = Array.isArray(rankData) && rankData.length > 0
      ? rankData[0]
      : { rank: null, total_points: 0, next_rank_points: 1 }

    const weeklyRankInfo = Array.isArray(weeklyRankData) && weeklyRankData.length > 0
      ? weeklyRankData[0]
      : { rank: null, weekly_points: 0 }

    return NextResponse.json({
      // 全期間
      totalPoints: userRankInfo.total_points,
      rank: userRankInfo.rank,
      nextRankPoints: userRankInfo.next_rank_points,
      pointsNeeded: Math.max(
        0,
        userRankInfo.next_rank_points - userRankInfo.total_points
      ),
      // 週間
      weeklyPoints: weeklyRankInfo.weekly_points,
      weeklyRank: weeklyRankInfo.rank,
    })
  } catch (error) {
    console.error('Failed to fetch points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points' },
      { status: 500 }
    )
  }
}
