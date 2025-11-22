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

    // ユーザーのストリーク情報を取得
    const { data: streakData, error: streakError } = await supabase.rpc(
      'get_user_streak',
      {
        target_user_id: user.id,
      }
    )

    if (streakError) {
      console.error('Failed to get user streak:', streakError)
      return NextResponse.json(
        { error: streakError.message },
        { status: 400 }
      )
    }

    const streak = streakData?.[0] || { current_streak: 0, longest_streak: 0 }

    return NextResponse.json({
      currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak,
    })
  } catch (error) {
    console.error('Failed to fetch streak:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    )
  }
}
