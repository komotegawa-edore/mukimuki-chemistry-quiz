import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// デッキ一覧を取得
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: decks, error } = await supabase
      .from('mukimuki_flashcard_decks')
      .select(`
        *,
        cards:mukimuki_flashcards(count)
      `)
      .order('subject')
      .order('display_order')

    if (error) throw error

    return NextResponse.json(decks)
  } catch (error) {
    console.error('Error fetching decks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    )
  }
}

// 新規デッキを作成
export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    // 同じ教科内での最大display_orderを取得
    const { data: maxOrder } = await supabase
      .from('mukimuki_flashcard_decks')
      .select('display_order')
      .eq('subject', body.subject)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.display_order || 0) + 1

    const { data: deck, error } = await supabase
      .from('mukimuki_flashcard_decks')
      .insert({
        name: body.name,
        description: body.description || null,
        subject: body.subject,
        category: body.category || null,
        display_order: nextOrder,
        is_published: body.is_published ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(deck)
  } catch (error) {
    console.error('Error creating deck:', error)
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    )
  }
}
