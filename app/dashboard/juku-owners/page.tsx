import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import JukuOwnersTable from './JukuOwnersTable'

export default async function JukuOwnersPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  const supabase = await createClient()

  // 全オーナー情報を取得
  const { data: owners } = await supabase
    .from('juku_owner_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // 各オーナーが作成したサイト数を取得
  const { data: sites } = await supabase
    .from('juku_sites')
    .select('id, owner_id, name, is_published')

  // オーナーごとの統計を計算
  const ownerStats = (owners || []).map(owner => {
    const ownerSites = (sites || []).filter(s => s.owner_id === owner.id)
    return {
      ...owner,
      siteCount: ownerSites.length,
      publishedCount: ownerSites.filter(s => s.is_published).length,
    }
  })

  // ステータス別の統計
  const statusStats = {
    total: owners?.length || 0,
    new: owners?.filter(o => !o.sales_status || o.sales_status === 'new').length || 0,
    contacted: owners?.filter(o => o.sales_status === 'contacted').length || 0,
    negotiating: owners?.filter(o => o.sales_status === 'negotiating').length || 0,
    converted: owners?.filter(o => o.sales_status === 'converted').length || 0,
    lost: owners?.filter(o => o.sales_status === 'lost').length || 0,
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
        title="学習塾リスト管理"
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">登録塾数</p>
            <p className="text-3xl font-bold text-gray-800">{statusStats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">新規</p>
            <p className="text-3xl font-bold text-yellow-600">{statusStats.new}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">連絡済み</p>
            <p className="text-3xl font-bold text-blue-600">{statusStats.contacted}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">商談中</p>
            <p className="text-3xl font-bold text-purple-600">{statusStats.negotiating}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">成約</p>
            <p className="text-3xl font-bold text-green-600">{statusStats.converted}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">失注</p>
            <p className="text-3xl font-bold text-gray-400">{statusStats.lost}</p>
          </div>
        </div>

        {/* オーナー一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">学習塾一覧</h2>
          </div>
          <JukuOwnersTable owners={ownerStats} />
        </div>
      </main>
    </div>
  )
}
