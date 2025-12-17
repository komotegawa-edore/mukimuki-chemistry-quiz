import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import JukuLeadsTable from './JukuLeadsTable'

export default async function JukuLeadsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  const supabase = await createClient()

  // 全サイトの情報を取得
  const { data: sites } = await supabase
    .from('juku_sites')
    .select('id, name, slug, owner_id, created_at')
    .order('created_at', { ascending: false })

  // 全お問い合わせを取得
  const { data: submissions } = await supabase
    .from('juku_contact_submissions')
    .select(`
      id,
      site_id,
      name,
      email,
      phone,
      grade,
      message,
      created_at,
      status
    `)
    .order('created_at', { ascending: false })

  // オーナー情報を取得
  const ownerIds = Array.from(new Set((sites || []).map(s => s.owner_id).filter(Boolean)))
  const { data: owners } = await supabase
    .from('juku_owner_profiles')
    .select('id, name, email')
    .in('id', ownerIds)

  // サイトごとの統計を計算
  const siteStats = (sites || []).map(site => {
    const siteSubmissions = (submissions || []).filter(s => s.site_id === site.id)
    const owner = (owners || []).find(o => o.id === site.owner_id)
    return {
      ...site,
      ownerName: owner?.name || '不明',
      ownerEmail: owner?.email || '不明',
      totalLeads: siteSubmissions.length,
      newLeads: siteSubmissions.filter(s => !s.status || s.status === 'new').length,
      contactedLeads: siteSubmissions.filter(s => s.status === 'contacted').length,
      convertedLeads: siteSubmissions.filter(s => s.status === 'converted').length,
    }
  })

  // 全体の統計
  const totalStats = {
    totalSites: sites?.length || 0,
    totalLeads: submissions?.length || 0,
    newLeads: submissions?.filter(s => !s.status || s.status === 'new').length || 0,
    contactedLeads: submissions?.filter(s => s.status === 'contacted').length || 0,
    convertedLeads: submissions?.filter(s => s.status === 'converted').length || 0,
  }

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="塾リードソース管理"
        rightContent={
          <form action={handleLogout}>
            <button
              type="submit"
              className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
            >
              ログアウト
            </button>
          </form>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 戻るリンク */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ダッシュボードに戻る
        </Link>

        {/* 全体統計 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">登録サイト数</p>
            <p className="text-3xl font-bold text-gray-800">{totalStats.totalSites}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">総リード数</p>
            <p className="text-3xl font-bold text-blue-600">{totalStats.totalLeads}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">新規</p>
            <p className="text-3xl font-bold text-yellow-600">{totalStats.newLeads}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">連絡済み</p>
            <p className="text-3xl font-bold text-purple-600">{totalStats.contactedLeads}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">成約</p>
            <p className="text-3xl font-bold text-green-600">{totalStats.convertedLeads}</p>
          </div>
        </div>

        {/* サイト別統計 */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">サイト別リード</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">サイト名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">オーナー</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">総リード</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">新規</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">連絡済</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">成約</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {siteStats.map(site => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{site.name}</p>
                        <p className="text-xs text-gray-500">/juku/{site.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-800">{site.ownerName}</p>
                        <p className="text-xs text-gray-500">{site.ownerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-blue-600">{site.totalLeads}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        {site.newLeads}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {site.contactedLeads}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {site.convertedLeads}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(site.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
                {siteStats.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      まだサイトが登録されていません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 最近のリード一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">最近のリード</h2>
          </div>
          <JukuLeadsTable
            submissions={submissions || []}
            sites={sites || []}
          />
        </div>
      </main>
    </div>
  )
}
