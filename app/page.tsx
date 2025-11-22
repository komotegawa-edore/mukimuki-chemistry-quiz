import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import PointsDisplay from '@/components/PointsDisplay'
import LoginBonus from '@/components/LoginBonus'

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

  // 章一覧を取得
  const { data: chapters } = await supabase
    .from('mukimuki_chapters')
    .select('*')
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
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">MUKIMUKI</h1>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* ポイント表示 */}
        <div className="mb-6">
          <PointsDisplay />
        </div>

        {/* 復習モードカード */}
        <div className="mb-8">
          <Link
            href="/review"
            className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:from-blue-600 hover:to-blue-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  復習モード
                </h2>
                <p className="text-blue-100 text-sm">
                  過去に間違えた問題を復習しましょう
                </p>
              </div>
              <div className="text-white">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-black">無機化学</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters?.map((chapter) => {
            const result = latestResults.get(chapter.id)
            const percentage = result
              ? Math.round((result.score / result.total) * 100)
              : null
            const canEarnPoints = !clearedTodayIds.has(chapter.id)

            return (
              <Link
                key={chapter.id}
                href={`/quiz/${chapter.id}`}
                className="relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* ポイント獲得可能バッジ */}
                {canEarnPoints && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
                    +1pt獲得可能
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-black">{chapter.title}</h3>
                  <span className="text-sm text-black">
                    #{chapter.order_num}
                  </span>
                </div>

                {percentage !== null && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-black">前回の結果</span>
                      <span
                        className={`font-semibold ${
                          percentage >= 80
                            ? 'text-green-600'
                            : percentage >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 80
                            ? 'bg-green-500'
                            : percentage >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {percentage === null && (
                  <p className="text-sm text-black mt-4">未挑戦</p>
                )}
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
