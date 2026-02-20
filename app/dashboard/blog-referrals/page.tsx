import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, FileText, Users, TrendingUp } from 'lucide-react'

export default async function BlogReferralsPage() {
  const profile = await getCurrentProfile()

  if (!profile) redirect('/login')
  if (profile.role !== 'teacher') redirect('/')

  const supabase = await createClient()

  // ブログ経由の登録ユーザー一覧
  const { data: blogUsers } = await supabase
    .from('mukimuki_profiles')
    .select('id, name, referral_source, referral_slug, created_at')
    .eq('referral_source', 'blog')
    .order('created_at', { ascending: false })

  // 全登録数
  const { count: totalUsers } = await supabase
    .from('mukimuki_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  // ブログ経由の登録数
  const blogCount = blogUsers?.length || 0

  // 記事別の登録数を集計
  const slugCounts: Record<string, number> = {}
  blogUsers?.forEach((user) => {
    const slug = user.referral_slug || '(記事不明)'
    slugCounts[slug] = (slugCounts[slug] || 0) + 1
  })

  // 記事別の登録数をソート（降順）
  const sortedSlugs = Object.entries(slugCounts).sort(([, a], [, b]) => b - a)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="ブログ流入分析" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          ダッシュボードに戻る
        </Link>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">総登録数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalUsers || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-sm text-gray-500">ブログ経由</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{blogCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">ブログ経由率</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalUsers ? ((blogCount / totalUsers) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* 記事別登録数 */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">記事別の登録数</h2>
            <p className="text-sm text-gray-500 mt-1">
              どのブログ記事から登録されたかの内訳
            </p>
          </div>
          {sortedSlugs.length > 0 ? (
            <div className="divide-y">
              {sortedSlugs.map(([slug, count]) => (
                <div key={slug} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{slug}</p>
                      {slug !== '(記事不明)' && (
                        <a
                          href={`/blog/${slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal-600 hover:underline"
                        >
                          記事を見る
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                    <span className="text-sm text-gray-500">人</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>まだブログ経由の登録はありません</p>
            </div>
          )}
        </div>

        {/* ブログ経由ユーザー一覧 */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">ブログ経由の登録ユーザー</h2>
          </div>
          {blogUsers && blogUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">流入記事</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録日</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {blogUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-gray-900">{user.name}</td>
                      <td className="px-6 py-4">
                        {user.referral_slug ? (
                          <a
                            href={`/blog/${user.referral_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline"
                          >
                            {user.referral_slug}
                          </a>
                        ) : (
                          <span className="text-gray-400">記事不明</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              まだデータがありません
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
