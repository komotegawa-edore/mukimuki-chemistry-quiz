import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'

export default async function HistoryPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: results } = await supabase
    .from('mukimuki_test_results')
    .select('*, mukimuki_chapters(title)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">テスト履歴</h1>
          <Link
            href="/"
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
          >
            ホームに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {results && results.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    日時
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    章
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    スコア
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    正答率
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result) => {
                  const percentage = Math.round(
                    (result.score / result.total) * 100
                  )
                  return (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(result.created_at).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {(result.mukimuki_chapters as { title: string } | null)?.title ||
                          '不明'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {result.score} / {result.total}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-700">
            まだテスト履歴がありません。
          </div>
        )}
      </main>
    </div>
  )
}
