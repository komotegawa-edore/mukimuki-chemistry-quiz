import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import CSVImport from '@/components/CSVImport'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  const supabase = await createClient()

  // 全生徒を取得
  const { data: students } = await supabase
    .from('mukimuki_profiles')
    .select('*')
    .eq('role', 'student')
    .order('name')

  // 全章を取得
  const { data: chapters } = await supabase
    .from('mukimuki_chapters')
    .select('*')
    .order('order_num')

  // 全結果を取得
  const { data: results } = await supabase
    .from('mukimuki_test_results')
    .select('user_id, chapter_id, score, total, created_at')
    .order('created_at', { ascending: false })

  // 生徒×章のマトリックスを作成
  const studentResults = new Map<string, Map<number, { score: number; total: number }>>()

  results?.forEach((result) => {
    if (!studentResults.has(result.user_id)) {
      studentResults.set(result.user_id, new Map())
    }
    const userMap = studentResults.get(result.user_id)!
    if (!userMap.has(result.chapter_id)) {
      userMap.set(result.chapter_id, { score: result.score, total: result.total })
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-black">講師ダッシュボード</h1>
          <form action={handleLogout}>
            <button
              type="submit"
              className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <CSVImport />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">章管理</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters?.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/dashboard/questions/${chapter.id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-black">{chapter.title}</h3>
                    <span className="text-sm text-black">#{chapter.order_num}</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">問題を管理 →</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-black">生徒の定着率</h2>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-black sticky left-0 bg-gray-50">
                    生徒名
                  </th>
                  {chapters?.slice(0, 10).map((chapter) => (
                    <th
                      key={chapter.id}
                      className="px-2 py-3 text-center font-semibold text-black"
                    >
                      {chapter.order_num}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students?.map((student) => {
                  const userResults = studentResults.get(student.id)
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium sticky left-0 bg-white text-black">
                        {student.name}
                      </td>
                      {chapters?.slice(0, 10).map((chapter) => {
                        const result = userResults?.get(chapter.id)
                        if (!result) {
                          return (
                            <td key={chapter.id} className="px-2 py-3 text-center">
                              <span className="text-black">-</span>
                            </td>
                          )
                        }
                        const percentage = Math.round((result.score / result.total) * 100)
                        return (
                          <td key={chapter.id} className="px-2 py-3 text-center">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                percentage >= 80
                                  ? 'bg-green-100 text-green-700'
                                  : percentage >= 60
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {percentage}%
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {chapters && chapters.length > 10 && (
            <p className="text-sm text-black mt-2">
              ※ 表示されているのは最初の10章です
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
