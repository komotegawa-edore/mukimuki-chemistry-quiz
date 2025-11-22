import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 生徒のみログインボーナス対象
    const { data: profile } = await supabase
      .from('mukimuki_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'student') {
      return NextResponse.json(
        { awarded: false, message: 'Not a student' },
        { status: 200 }
      )
    }

    // 連続ログイン日数を更新
    const { data: streakData, error: streakError } = await supabase.rpc(
      'update_login_streak',
      {
        target_user_id: user.id,
      }
    )

    if (streakError) {
      console.error('Failed to update login streak:', streakError)
    }

    const currentStreak = streakData?.[0]?.current_streak || 0
    const isNewRecord = streakData?.[0]?.is_new_record || false

    // ログインボーナスを付与（1日1回のみ）
    const { error: bonusError } = await supabase
      .from('mukimuki_login_bonuses')
      .insert({
        user_id: user.id,
        points: 3,
      })

    // UNIQUE制約違反（すでに今日獲得済み）の場合はエラーを無視
    if (!bonusError) {
      // バッジ獲得判定
      const { data: newBadges } = await supabase.rpc('check_and_award_badges', {
        target_user_id: user.id,
      })

      return NextResponse.json({
        awarded: true,
        points: 3,
        message: 'Login bonus awarded!',
        newBadges: newBadges || [],
        streak: {
          current: currentStreak,
          isNewRecord: isNewRecord,
        },
      })
    } else if (bonusError.code === '23505') {
      return NextResponse.json({
        awarded: false,
        message: 'Already received today',
        streak: {
          current: currentStreak,
          isNewRecord: false,
        },
      })
    } else {
      console.error('Failed to award login bonus:', bonusError)
      return NextResponse.json(
        { error: bonusError.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to process login bonus:', error)
    return NextResponse.json(
      { error: 'Failed to process login bonus' },
      { status: 500 }
    )
  }
}
