import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// デッキ一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')

    let query = supabase
      .from('mukimuki_flashcard_decks')
      .select(`
        *,
        cards:mukimuki_flashcards(count)
      `)
      .order('display_order', { ascending: true })

    if (subject) {
      query = query.eq('subject', subject)
    }

    // 生徒は公開デッキのみ
    if (profile.role === 'student') {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching decks:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/flashcards/decks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// デッキ作成（講師のみ）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, subject, category, display_order, is_published } = body

    if (!name || !subject) {
      return NextResponse.json({ error: 'Name and subject are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('mukimuki_flashcard_decks')
      .insert({
        name,
        description,
        subject,
        category,
        display_order: display_order || 0,
        is_published: is_published ?? true,
        created_by: profile.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating deck:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/flashcards/decks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
