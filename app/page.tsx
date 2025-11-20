import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'

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
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">mukimuki</h1>
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
                className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6 text-black">章一覧</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters?.map((chapter) => {
            const result = latestResults.get(chapter.id)
            const percentage = result
              ? Math.round((result.score / result.total) * 100)
              : null

            return (
              <Link
                key={chapter.id}
                href={`/quiz/${chapter.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
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
