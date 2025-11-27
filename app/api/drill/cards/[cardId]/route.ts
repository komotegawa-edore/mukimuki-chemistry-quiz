import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// カードを更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.front_text !== undefined) updateData.front_text = body.front_text
    if (body.back_text !== undefined) updateData.back_text = body.back_text
    if (body.order_num !== undefined) updateData.order_num = body.order_num
    if (body.is_published !== undefined) updateData.is_published = body.is_published

    const { data: card, error } = await supabase
      .from('mukimuki_flashcards')
      .update(updateData)
      .eq('id', parseInt(cardId))
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    )
  }
}

// カードを削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('mukimuki_flashcards')
      .delete()
      .eq('id', parseInt(cardId))

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    )
  }
}
