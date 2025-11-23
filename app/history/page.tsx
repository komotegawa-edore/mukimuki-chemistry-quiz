import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'

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
      <Header
        title="テスト履歴"
        rightContent={
          <Link
            href="/"
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
          >
            ホームに戻る
          </Link>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {results && results.length > 0 ? (
          <>
            {/* モバイル表示（カード形式） */}
            <div className="md:hidden space-y-3">
              {results.map((result) => {
                const percentage = Math.round(
                  (result.score / result.total) * 100
                )
                return (
                  <div
                    key={result.id}
                    className="bg-white rounded-lg shadow-md p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-black mb-1">
                          {(result.mukimuki_chapters as { title: string } | null)?.title ||
                            '不明'}
                        </h3>
                        <p className="text-xs text-black">
                          {new Date(result.created_at).toLocaleString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
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
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-sm text-black">スコア</span>
                      <span className="text-sm font-semibold text-black">
                        {result.score} / {result.total}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* タブレット・PC表示（テーブル形式） */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      日時
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      章
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      スコア
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
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
                        <td className="px-6 py-4 text-sm text-black">
                          {new Date(result.created_at).toLocaleString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-black">
                          {(result.mukimuki_chapters as { title: string } | null)?.title ||
                            '不明'}
                        </td>
                        <td className="px-6 py-4 text-sm text-black">
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
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-black">
            まだテスト履歴がありません。
          </div>
        )}
      </main>
    </div>
  )
}
