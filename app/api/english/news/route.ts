import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')

  const supabase = await createClient()

  let query = supabase
    .from('mukimuki_daily_news')
    .select('*')
    .eq('is_published', true)
    .order('id', { ascending: true })

  if (date) {
    query = query.eq('news_date', date)
  } else {
    // 最新の日付のニュースを取得
    query = query.order('news_date', { ascending: false }).limit(10)
  }

  const { data: news, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ news })
}
