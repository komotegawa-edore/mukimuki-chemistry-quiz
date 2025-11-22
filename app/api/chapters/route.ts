import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // ユーザー情報を取得
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // プロフィール情報を取得してロールを確認
    let isTeacher = false
    if (user) {
      const { data: profile } = await supabase
        .from('mukimuki_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      isTeacher = profile?.role === 'teacher'
    }

    let query = supabase
      .from('mukimuki_chapters')
      .select('*')
      .order('order_num', { ascending: true })

    // 生徒の場合は公開済み章のみ取得
    if (!isTeacher) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    )
  }
}
