import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// カード一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deck_id')

    if (!deckId) {
      return NextResponse.json({ error: 'deck_id is required' }, { status: 400 })
    }

    let query = supabase
      .from('mukimuki_flashcards')
      .select('*')
      .eq('deck_id', parseInt(deckId))
      .order('order_num', { ascending: true })

    // 生徒は公開カードのみ
    if (profile.role === 'student') {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/flashcards/cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// カード作成（講師のみ）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { deck_id, front_text, back_text, front_image_url, back_image_url, order_num, is_published } = body

    if (!deck_id || !front_text || !back_text) {
      return NextResponse.json({ error: 'deck_id, front_text, and back_text are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('mukimuki_flashcards')
      .insert({
        deck_id,
        front_text,
        back_text,
        front_image_url,
        back_image_url,
        order_num: order_num || 0,
        is_published: is_published ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/flashcards/cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
