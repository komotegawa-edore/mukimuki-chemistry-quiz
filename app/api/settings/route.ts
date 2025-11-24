import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 動的ルートとして明示
export const dynamic = 'force-dynamic'

// GET: システム設定を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    let data, error

    if (key) {
      const result = await supabase
        .from('mukimuki_system_settings')
        .select('*')
        .eq('setting_key', key)
        .single()
      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('mukimuki_system_settings')
        .select('*')
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Settings fetch error:', error)
      return NextResponse.json({ error: '設定の取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ settings: data })

  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// PUT: システム設定を更新（講師のみ）
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
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

    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const { setting_key, setting_value } = body

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json({ error: '必要なパラメータがありません' }, { status: 400 })
    }

    // 設定を更新
    const { data, error } = await supabase
      .from('mukimuki_system_settings')
      .update({
        setting_value: String(setting_value),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('setting_key', setting_key)
      .select()
      .single()

    if (error) {
      console.error('Settings update error:', error)
      return NextResponse.json({ error: '設定の更新に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true, setting: data })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
