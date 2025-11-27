import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// CSVインポート（講師のみ）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, cards } = body

    if (!subject || !cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: 'subject and cards array are required' }, { status: 400 })
    }

    // セクションごとにグループ化
    const cardsBySection: Record<string, Array<{ front_text: string; back_text: string; order_num: number }>> = {}

    for (const card of cards) {
      const section = card.section || '1'
      if (!cardsBySection[section]) {
        cardsBySection[section] = []
      }
      cardsBySection[section].push({
        front_text: card.front_text,
        back_text: card.back_text,
        order_num: card.order_num || cardsBySection[section].length + 1,
      })
    }

    const results = []

    // 各セクションごとにデッキを作成し、カードを挿入
    for (const [section, sectionCards] of Object.entries(cardsBySection)) {
      // デッキを作成または取得
      let deck
      const { data: existingDeck } = await supabase
        .from('mukimuki_flashcard_decks')
        .select('*')
        .eq('subject', subject)
        .eq('category', section)
        .single()

      if (existingDeck) {
        deck = existingDeck
      } else {
        const { data: newDeck, error: deckError } = await supabase
          .from('mukimuki_flashcard_decks')
          .insert({
            name: `セクション ${section}`,
            subject,
            category: section,
            display_order: parseInt(section),
            created_by: profile.id,
          })
          .select()
          .single()

        if (deckError) {
          console.error('Error creating deck:', deckError)
          continue
        }
        deck = newDeck
      }

      // カードを挿入
      const cardsToInsert = sectionCards.map((card, index) => ({
        deck_id: deck.id,
        front_text: card.front_text,
        back_text: card.back_text,
        order_num: card.order_num || index + 1,
      }))

      const { data: insertedCards, error: cardsError } = await supabase
        .from('mukimuki_flashcards')
        .insert(cardsToInsert)
        .select()

      if (cardsError) {
        console.error('Error inserting cards:', cardsError)
        results.push({ section, success: false, error: cardsError.message })
      } else {
        results.push({ section, success: true, count: insertedCards.length })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error in POST /api/flashcards/import:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
