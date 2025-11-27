import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import FlashcardRunner from '@/components/FlashcardRunner'

interface Props {
  params: Promise<{ deckId: string }>
}

export default async function DeckPage({ params }: Props) {
  const { deckId } = await params
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  // デッキ情報を取得
  const { data: deck } = await supabase
    .from('mukimuki_flashcard_decks')
    .select('*')
    .eq('id', parseInt(deckId))
    .single()

  if (!deck || (!deck.is_published && profile.role !== 'teacher')) {
    redirect('/drill')
  }

  // カード一覧を取得
  const { data: cards } = await supabase
    .from('mukimuki_flashcards')
    .select('*')
    .eq('deck_id', parseInt(deckId))
    .eq('is_published', true)
    .order('order_num', { ascending: true })

  // ユーザーの進捗を取得
  const { data: progress } = await supabase
    .from('mukimuki_flashcard_progress')
    .select('card_id, status, review_count')
    .eq('user_id', profile.id)

  // 進捗をMap化
  const progressMap = new Map<number, { status: string; review_count: number }>()
  progress?.forEach((p) => {
    progressMap.set(p.card_id, { status: p.status, review_count: p.review_count })
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F9F7] to-white">
      <Header
        rightContent={
          <Link
            href="/drill"
            className="px-3 py-2 text-sm text-[#5DDFC3] hover:bg-[#F4F9F7] rounded font-medium"
          >
            戻る
          </Link>
        }
      />

      <FlashcardRunner
        deck={deck}
        cards={cards || []}
        progressMap={progressMap}
        userId={profile.id}
      />
    </div>
  )
}
