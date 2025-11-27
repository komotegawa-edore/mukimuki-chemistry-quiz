import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// カード一覧を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')

    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: cards, error } = await supabase
      .from('mukimuki_flashcards')
      .select('*')
      .eq('deck_id', parseInt(deckId))
      .order('order_num')

    if (error) throw error

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}

// 新規カードを作成
export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    // 同じデッキ内での最大order_numを取得
    const { data: maxOrder } = await supabase
      .from('mukimuki_flashcards')
      .select('order_num')
      .eq('deck_id', body.deck_id)
      .order('order_num', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.order_num || 0) + 1

    const { data: card, error } = await supabase
      .from('mukimuki_flashcards')
      .insert({
        deck_id: body.deck_id,
        front_text: body.front_text,
        back_text: body.back_text,
        order_num: body.order_num ?? nextOrder,
        is_published: body.is_published ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}
