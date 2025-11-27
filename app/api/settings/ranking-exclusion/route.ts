import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: ランキング除外設定を取得
export async function GET() {
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

    // 全生徒を取得
    const { data: profiles } = await supabase
      .from('mukimuki_profiles')
      .select('id, name')
      .eq('role', 'student')
      .order('name')

    // メールアドレスを取得
    const userIds = profiles?.map(p => p.id) || []
    const { data: emailsData } = await supabase.rpc('get_user_emails_for_admin', {
      user_ids: userIds
    })

    const emailsMap = new Map(emailsData?.map((e: { id: string; email: string }) => [e.id, e.email]) || [])

    const students = profiles?.map(p => ({
      id: p.id,
      name: p.name,
      email: emailsMap.get(p.id) || '不明'
    })) || []

    // 現在の除外設定を取得
    const { data: setting } = await supabase
      .from('mukimuki_system_settings')
      .select('setting_value')
      .eq('setting_key', 'ranking_excluded_user_ids')
      .single()

    let excludedIds: string[] = []
    if (setting?.setting_value) {
      try {
        excludedIds = JSON.parse(setting.setting_value)
      } catch {
        excludedIds = []
      }
    }

    return NextResponse.json({ students, excludedIds })

  } catch (error) {
    console.error('Ranking exclusion GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// PUT: ランキング除外設定を更新
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
    const { excludedIds } = body

    // 設定を更新
    const { error } = await supabase
      .from('mukimuki_system_settings')
      .upsert({
        setting_key: 'ranking_excluded_user_ids',
        setting_value: JSON.stringify(excludedIds || [])
      }, {
        onConflict: 'setting_key'
      })

    if (error) {
      console.error('Failed to update ranking exclusion:', error)
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Ranking exclusion PUT error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
