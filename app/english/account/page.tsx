'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSubscription } from '@/hooks/useSubscription'
import EnglishHeader from '@/components/EnglishHeader'
import EnglishFooter from '@/components/EnglishFooter'
import EnglishBottomNav from '@/components/EnglishBottomNav'
import SubscriptionModal from '@/components/SubscriptionModal'
import { User, Crown, Calendar, CreditCard, ExternalLink, Loader2 } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const { hasAccess, subscription, loading: subLoading } = useSubscription()
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/english/login')
        return
      }

      setUser({ email: user.email })
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/english/stripe/portal', {
        method: 'POST',
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (res.status === 404) {
        // サブスクリプションデータが無効だった場合、ページをリロード
        alert('サブスクリプション情報が見つかりませんでした。ページを更新します。')
        window.location.reload()
      } else {
        alert('サブスクリプション管理ページを開けませんでした')
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('エラーが発生しました')
    } finally {
      setPortalLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPlanLabel = (planType: string | undefined) => {
    if (planType === 'monthly') return '月額プラン'
    if (planType === 'yearly') return '年間プラン'
    return planType || '-'
  }

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'active': return 'アクティブ'
      case 'trialing': return 'トライアル中'
      case 'canceled': return 'キャンセル済み'
      case 'past_due': return '支払い遅延'
      case 'inactive': return '未登録'
      default: return status || '-'
    }
  }

  if (loading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <EnglishHeader />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <User className="w-6 h-6" />
          アカウント設定
        </h1>

        {/* ユーザー情報 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">アカウント情報</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">メールアドレス</span>
              <span className="text-gray-800">{user?.email || '-'}</span>
            </div>
          </div>
        </div>

        {/* サブスクリプション情報 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">サブスクリプション</h2>
            {hasAccess && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                <Crown className="w-4 h-4" />
                プレミアム
              </span>
            )}
          </div>

          {hasAccess ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">プラン</span>
                <span className="text-gray-800">{getPlanLabel(subscription?.planType)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">ステータス</span>
                <span className="text-gray-800">{getStatusLabel(subscription?.status)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">次回更新日</span>
                <span className="text-gray-800 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(subscription?.currentPeriodEnd || null)}
                </span>
              </div>
              {subscription?.cancelAtPeriodEnd && (
                <p className="text-sm text-orange-600 mt-2">
                  ※ 次回更新日にキャンセルされます
                </p>
              )}

              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                サブスクリプションを管理
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">
                現在フリープランをご利用中です。<br />
                プレミアムにアップグレードして、すべてのニュースにアクセスしましょう。
              </p>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                <Crown className="w-5 h-5" />
                プレミアムにアップグレード
              </button>
            </div>
          )}
        </div>

        {/* ナビゲーションバー用の余白 */}
        <div className="h-24" />
      </main>

      <EnglishFooter />
      <EnglishBottomNav />

      {/* サブスクリプションモーダル */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  )
}
