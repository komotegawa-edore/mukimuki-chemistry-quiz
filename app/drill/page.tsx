import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import DrillContent from '@/components/DrillContent'

export default async function DrillPage() {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  // 講師の場合はダッシュボードへ
  if (profile.role === 'teacher') {
    redirect('/dashboard')
  }

  // デッキ一覧を取得
  const { data: decks } = await supabase
    .from('mukimuki_flashcard_decks')
    .select(`
      *,
      cards:mukimuki_flashcards(count)
    `)
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  // ユーザーの進捗を取得
  const { data: progress } = await supabase
    .from('mukimuki_flashcard_progress')
    .select('card_id, status')
    .eq('user_id', profile.id)

  // 進捗をMap化
  const progressMap = new Map<number, string>()
  progress?.forEach((p) => {
    progressMap.set(p.card_id, p.status)
  })

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <Header
        rightContent={
          <>
            <Link
              href="/"
              className="px-3 py-2 text-sm text-[#5DDFC3] hover:bg-[#F4F9F7] rounded font-medium"
            >
              ホーム
            </Link>
            <form action={handleLogout}>
              <button
                type="submit"
                className="px-3 py-2 text-sm bg-[#E0F7F1] rounded hover:bg-[#5DDFC3] hover:text-white whitespace-nowrap text-[#3A405A] font-medium transition-colors"
              >
                ログアウト
              </button>
            </form>
          </>
        }
      />

      <DrillContent decks={decks || []} progressMap={progressMap} />
    </div>
  )
}
