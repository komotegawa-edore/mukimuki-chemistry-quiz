'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { JukuSite } from '../juku/types'

interface OwnerProfile {
  id: string
  name: string
  email: string
  phone: string | null
}

export default function JukuAdminDashboard() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null)
  const [sites, setSites] = useState<JukuSite[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/juku-admin/login')
      return
    }

    // プロファイル取得
    const { data: profileData } = await supabase
      .from('juku_owner_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    // サイト一覧取得（自分が所有するサイトのみ）
    const { data: sitesData } = await supabase
      .from('juku_sites')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    setSites((sitesData || []) as JukuSite[])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/juku-admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">塾サイト管理</h1>
              <p className="text-xs text-gray-500">{profile?.name || 'ゲスト'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/juku-admin/sites/new"
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規サイト作成
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">サイト一覧</h2>

        {sites.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">サイトがありません</h3>
            <p className="text-gray-500 mb-6">
              塾のホームページを作成して、生徒募集を始めましょう
            </p>
            <Link
              href="/juku-admin/sites/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              最初のサイトを作成
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* サイトプレビュー */}
                <div
                  className="h-32 flex items-center justify-center"
                  style={{ backgroundColor: site.primary_color }}
                >
                  {site.logo_url ? (
                    <img
                      src={site.logo_url}
                      alt={site.name}
                      className="h-16 w-auto object-contain brightness-0 invert"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">{site.name}</span>
                  )}
                </div>

                {/* サイト情報 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{site.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        edore-edu.com/juku/{site.slug}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        site.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {site.is_published ? '公開中' : '下書き'}
                    </span>
                  </div>

                  {/* アクション */}
                  <div className="flex gap-2">
                    <Link
                      href={`/juku-admin/sites/${site.id}`}
                      className="flex-1 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg text-center hover:bg-blue-600 transition-colors"
                    >
                      編集
                    </Link>
                    <a
                      href={`/juku/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      表示
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
