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

    // 全バッジを取得（ポイント系のみ）
    const { data: allBadges, error: allBadgesError } = await supabase
      .from('mukimuki_badges')
      .select('*')
      .eq('category', 'points')
      .order('requirement_value', { ascending: true })

    if (allBadgesError) {
      console.error('Failed to get all badges:', allBadgesError)
      return NextResponse.json(
        { error: allBadgesError.message },
        { status: 400 }
      )
    }

    // ユーザーの獲得バッジを取得
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('mukimuki_user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id)

    if (userBadgesError) {
      console.error('Failed to get user badges:', userBadgesError)
      return NextResponse.json(
        { error: userBadgesError.message },
        { status: 400 }
      )
    }

    // ユーザーの現在のポイント数を取得
    const { data: totalPoints } = await supabase.rpc('get_user_total_points', {
      target_user_id: user.id,
    })

    // 獲得済みバッジのIDセット
    const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

    // 全バッジに獲得状況を付与
    const badgesWithStatus = allBadges?.map((badge) => {
      const userBadge = userBadges?.find((ub) => ub.badge_id === badge.id)
      return {
        ...badge,
        earned: earnedBadgeIds.has(badge.id),
        earned_at: userBadge?.earned_at || null,
        progress: Math.min(
          100,
          Math.floor((totalPoints / badge.requirement_value) * 100)
        ),
      }
    })

    return NextResponse.json({
      badges: badgesWithStatus || [],
      currentPoints: totalPoints || 0,
    })
  } catch (error) {
    console.error('Failed to fetch badges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}
