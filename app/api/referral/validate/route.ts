import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: 招待コードを検証して紹介者情報を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: '招待コードが必要です' }, { status: 400 })
    }

    const supabase = await createClient()

    // 招待コードから紹介者を検索
    const { data, error } = await supabase.rpc('get_referrer_by_code', {
      p_code: code.toUpperCase()
    })

    if (error) {
      console.error('Referral code validation error:', error)
      return NextResponse.json({ error: '検証に失敗しました' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ valid: false, message: '無効な招待コードです' }, { status: 200 })
    }

    return NextResponse.json({
      valid: true,
      referrer: {
        id: data[0].user_id,
        name: data[0].user_name
      }
    })

  } catch (error) {
    console.error('Referral validation error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
