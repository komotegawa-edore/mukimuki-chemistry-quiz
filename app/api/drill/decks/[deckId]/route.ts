import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// デッキ詳細を取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params
    const supabase = await createClient()

    const { data: deck, error } = await supabase
      .from('mukimuki_flashcard_decks')
      .select('*')
      .eq('id', parseInt(deckId))
      .single()

    if (error) throw error

    return NextResponse.json(deck)
  } catch (error) {
    console.error('Error fetching deck:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
      { status: 500 }
    )
  }
}

// デッキを更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deckId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data: deck, error } = await supabase
      .from('mukimuki_flashcard_decks')
      .update({
        name: body.name,
        description: body.description,
        subject: body.subject,
        category: body.category,
        display_order: body.display_order,
        is_published: body.is_published,
      })
      .eq('id', parseInt(deckId))
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(deck)
  } catch (error) {
    console.error('Error updating deck:', error)
    return NextResponse.json(
      { error: 'Failed to update deck' },
      { status: 500 }
    )
  }
}

// デッキを削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deckId } = await params
    const supabase = await createClient()

    // まずカードを削除
    await supabase
      .from('mukimuki_flashcards')
      .delete()
      .eq('deck_id', parseInt(deckId))

    // デッキを削除
    const { error } = await supabase
      .from('mukimuki_flashcard_decks')
      .delete()
      .eq('id', parseInt(deckId))

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deck:', error)
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    )
  }
}
