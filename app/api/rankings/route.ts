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

    // ランキング取得
    const { data, error } = await supabase.rpc('get_user_ranking_with_email')

    if (error) {
      console.error('Failed to fetch rankings:', error)
      return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 })
    }

    return NextResponse.json({ rankings: data })

  } catch (error) {
    console.error('Unexpected error in GET /api/rankings:', error)
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 })
  }
}
