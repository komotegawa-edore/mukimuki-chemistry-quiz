import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// 学習進捗取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deck_id')

    let query = supabase
      .from('mukimuki_flashcard_progress')
      .select(`
        *,
        card:mukimuki_flashcards(*)
      `)
      .eq('user_id', profile.id)

    if (deckId) {
      query = query.eq('card.deck_id', parseInt(deckId))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching progress:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/flashcards/progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 学習進捗更新（upsert）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { card_id, status } = body

    if (!card_id || !status) {
      return NextResponse.json({ error: 'card_id and status are required' }, { status: 400 })
    }

    if (!['unknown', 'learning', 'known'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // 既存の進捗を確認
    const { data: existing } = await supabase
      .from('mukimuki_flashcard_progress')
      .select('*')
      .eq('user_id', profile.id)
      .eq('card_id', card_id)
      .single()

    if (existing) {
      // 更新
      const { data, error } = await supabase
        .from('mukimuki_flashcard_progress')
        .update({
          status,
          review_count: existing.review_count + 1,
          last_reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating progress:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // 新規作成
      const { data, error } = await supabase
        .from('mukimuki_flashcard_progress')
        .insert({
          user_id: profile.id,
          card_id,
          status,
          review_count: 1,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating progress:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error in POST /api/flashcards/progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
