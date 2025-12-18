'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  MoreVertical,
  ArrowLeft,
} from 'lucide-react'
import { JukuLP, lpTypeLabels } from '@/app/juku/types'

export default function LPListPage() {
  const [lps, setLps] = useState<JukuLP[]>([])
  const [inquiryCounts, setInquiryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchLPs()
  }, [])

  const fetchLPs = async () => {
    setLoading(true)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      router.push('/juku-admin/login')
      return
    }

    const { data, error } = await supabase
      .from('juku_lps')
      .select('*')
      .eq('owner_id', user.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching LPs:', error)
    } else {
      setLps(data || [])

      // 申込数を取得
      if (data && data.length > 0) {
        const lpIds = data.map((lp) => lp.id)
        const { data: counts } = await supabase
          .from('juku_lp_inquiries')
          .select('lp_id')
          .in('lp_id', lpIds)

        if (counts) {
          const countMap: Record<string, number> = {}
          counts.forEach((c) => {
            countMap[c.lp_id] = (countMap[c.lp_id] || 0) + 1
          })
          setInquiryCounts(countMap)
        }
      }
    }
    setLoading(false)
  }

  const togglePublish = async (lp: JukuLP) => {
    const { error } = await supabase
      .from('juku_lps')
      .update({ is_published: !lp.is_published })
      .eq('id', lp.id)

    if (!error) {
      setLps(lps.map((l) => (l.id === lp.id ? { ...l, is_published: !l.is_published } : l)))
    }
  }

  const deleteLP = async (lpId: string) => {
    if (!confirm('このLPを削除しますか？この操作は取り消せません。')) return

    const { error } = await supabase.from('juku_lps').delete().eq('id', lpId)

    if (!error) {
      setLps(lps.filter((l) => l.id !== lpId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/juku-admin" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">LP管理</h1>
          </div>
          <Link
            href="/juku-admin/lps/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            新規作成
          </Link>
        </div>
      </header>

      {/* メイン */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {lps.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">LPがありません</h2>
            <p className="text-gray-500 mb-6">
              季節講習やキャンペーン用のLPを作成しましょう
            </p>
            <Link
              href="/juku-admin/lps/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              最初のLPを作成
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lps.map((lp) => (
              <div
                key={lp.id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* カード上部 */}
                <div
                  className="h-24 relative"
                  style={{
                    background: `linear-gradient(135deg, ${lp.primary_color} 0%, ${lp.secondary_color} 100%)`,
                  }}
                >
                  {/* ステータスバッジ */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        lp.is_published
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {lp.is_published ? '公開中' : '非公開'}
                    </span>
                  </div>

                  {/* LPタイプ */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-700">
                      {lpTypeLabels[lp.lp_type]}
                    </span>
                  </div>

                  {/* メニュー */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() => setOpenMenu(openMenu === lp.id ? null : lp.id)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center"
                    >
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>

                    {openMenu === lp.id && (
                      <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg py-2 w-40 z-10">
                        <Link
                          href={`/juku-admin/lps/${lp.id}`}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          編集
                        </Link>
                        <a
                          href={`/lp/${lp.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          プレビュー
                        </a>
                        <button
                          onClick={() => togglePublish(lp)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm w-full text-left"
                        >
                          {lp.is_published ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              非公開にする
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              公開する
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteLP(lp.id)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm w-full text-left text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* カード内容 */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{lp.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{lp.juku_name}</p>

                  {/* 統計 */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{inquiryCounts[lp.id] || 0} 件の申込</span>
                    </div>
                  </div>

                  {/* 期間 */}
                  {(lp.start_date || lp.end_date) && (
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {lp.start_date && new Date(lp.start_date).toLocaleDateString('ja-JP')}
                      {lp.start_date && lp.end_date && ' - '}
                      {lp.end_date && new Date(lp.end_date).toLocaleDateString('ja-JP')}
                    </div>
                  )}
                </div>

                {/* アクション */}
                <div className="border-t px-4 py-3 flex gap-2">
                  <Link
                    href={`/juku-admin/lps/${lp.id}`}
                    className="flex-1 py-2 text-center text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    編集
                  </Link>
                  <a
                    href={`/lp/${lp.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-center text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    プレビュー
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
