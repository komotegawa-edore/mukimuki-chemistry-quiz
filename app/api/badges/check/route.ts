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

    // バッジ獲得判定関数を呼び出し
    const { data: newBadges, error } = await supabase.rpc(
      'check_and_award_badges',
      { target_user_id: user.id }
    )

    if (error) {
      console.error('Failed to check badges:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      newBadges: newBadges || [],
    })
  } catch (error) {
    console.error('Failed to check badges:', error)
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    )
  }
}
