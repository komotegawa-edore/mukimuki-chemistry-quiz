import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import LoginBonus from '@/components/LoginBonus'
import HomeContent from '@/components/HomeContent'
import Header from '@/components/Header'

export default async function HomePage() {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  // 講師の場合はダッシュボードへ
  if (profile.role === 'teacher') {
    redirect('/dashboard')
  }

  // 教科一覧を取得
  const { data: subjects } = await supabase
    .from('mukimuki_subjects')
    .select('*')
    .order('display_order', { ascending: true })

  // 章一覧を取得（教科情報も含む）
  const { data: chapters } = await supabase
    .from('mukimuki_chapters')
    .select('*, subject:mukimuki_subjects(*)')
    .eq('is_published', true)
    .order('order_num', { ascending: true })

  // 生徒の結果を取得
  const { data: results } = await supabase
    .from('mukimuki_test_results')
    .select('chapter_id, score, total, created_at')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  // 今日クリアした章を取得
  const { data: clearedToday } = await supabase
    .from('mukimuki_chapter_clears')
    .select('chapter_id')
    .eq('user_id', profile.id)
    .eq('cleared_date', new Date().toISOString().split('T')[0])

  const clearedTodayIds = new Set(
    clearedToday?.map((c) => c.chapter_id) || []
  )

  // 章ごとの最新結果を取得
  const latestResults = new Map<number, { score: number; total: number }>()
  results?.forEach((result) => {
    if (!latestResults.has(result.chapter_id)) {
      latestResults.set(result.chapter_id, {
        score: result.score,
        total: result.total,
      })
    }
  })

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <LoginBonus />
      <Header
        rightContent={
          <>
            <Link
              href="/history"
              className="px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded"
            >
              履歴
            </Link>
            <form action={handleLogout}>
              <button
                type="submit"
                className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
              >
                ログアウト
              </button>
            </form>
          </>
        }
      />

      <HomeContent
        subjects={subjects || []}
        chapters={chapters || []}
        latestResults={latestResults}
        clearedTodayIds={clearedTodayIds}
      />
    </div>
  )
}
