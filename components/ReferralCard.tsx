'use client'

import { useEffect, useState } from 'react'
import { Share2, Copy, Check, Users, Gift, Target, Calendar } from 'lucide-react'

interface ReferralData {
  referralCode: string
  bonusDailyQuests: number
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  isExcluded?: boolean
  campaignTitle?: string
  campaignDescription?: string
  validUntil?: string | null
  maxReferrals?: number
  isMaxReached?: boolean
  referrals: {
    id: number
    status: string
    created_at: string
    completed_at: string | null
    referred: { id: string; name: string } | null
  }[]
}

export default function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referral')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReferralUrl = () => {
    if (typeof window === 'undefined' || !data) return ''
    return `${window.location.origin}/signup?ref=${data.referralCode}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareViaLine = () => {
    const url = getReferralUrl()
    const text = `Roopyで一緒に勉強しよう！\n招待コード: ${data?.referralCode}\n登録するとデイリーミッションが2つからスタート！`
    window.open(
      `https://line.me/R/share?text=${encodeURIComponent(text + '\n' + url)}`,
      '_blank'
    )
  }

  const shareViaTwitter = () => {
    const url = getReferralUrl()
    const text = `Roopyで一緒に勉強しよう！\n招待コード: ${data?.referralCode}\n登録するとデイリーミッションが2つからスタート！`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (!data || !data.referralCode || data.isExcluded) {
    return null
  }

  // 期限をフォーマット
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* キャンペーンヘッダー */}
      {data.campaignTitle && (
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 -mx-6 -mt-6 px-6 py-4 rounded-t-2xl mb-4">
          <h3 className="text-lg font-bold text-white">{data.campaignTitle}</h3>
          {data.validUntil && (
            <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(data.validUntil)} まで</span>
            </div>
          )}
        </div>
      )}

      {/* キャンペーン説明 */}
      {data.campaignDescription && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-800">
          {data.campaignDescription}
        </div>
      )}

      {/* ヘッダー（キャンペーンタイトルがない場合のみ表示） */}
      {!data.campaignTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#5DDFC3]" />
            <h3 className="text-lg font-bold text-[#3A405A]">友達を招待</h3>
          </div>
          <div className="flex items-center gap-1 text-[#5DDFC3] text-sm font-medium">
            <Users className="w-4 h-4" />
            <span>{data.completedReferrals}/{data.maxReferrals || 3}人</span>
          </div>
        </div>
      )}

      {/* 紹介済み（キャンペーンタイトルがある場合はここに表示） */}
      {data.campaignTitle && (
        <div className="flex items-center gap-1 text-[#5DDFC3] text-sm font-medium mb-4">
          <Users className="w-4 h-4" />
          <span>{data.completedReferrals}/{data.maxReferrals || 3}人紹介済み</span>
        </div>
      )}

      {/* 上限達成メッセージ */}
      {data.isMaxReached && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
          🎉 紹介上限（{data.maxReferrals}人）に達しました！ご協力ありがとうございます。
        </div>
      )}

      {/* 特典説明 */}
      <div className="bg-gradient-to-r from-[#E0F7F1] to-[#F0FDF9] rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="bg-[#5DDFC3] p-2 rounded-lg">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#3A405A] text-sm mb-1">招待特典</p>
            <ul className="text-xs text-[#3A405A]/70 space-y-1">
              <li>• あなた：紹介が成立するとデイリーミッション+1</li>
              <li>• 友達：デイリーミッション2つでスタート</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 紹介成立の条件 */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
        <p className="font-semibold text-orange-700 text-sm mb-2">紹介成立の条件</p>
        <ol className="text-xs text-orange-700/80 space-y-1 list-decimal list-inside">
          <li>下の招待コードを友達に共有</li>
          <li>友達がコードを使って新規登録</li>
          <li>友達が<span className="font-bold">1章クリア</span>で紹介成立！</li>
        </ol>
      </div>

      {/* 招待コード */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#3A405A]/60 mb-2">
          招待コード
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-lg font-bold text-[#3A405A] tracking-widest text-center">
            {data.referralCode}
          </div>
          <button
            onClick={copyToClipboard}
            className={`p-3 rounded-lg transition-all ${
              copied
                ? 'bg-green-100 text-green-600'
                : 'bg-[#5DDFC3] text-white hover:bg-[#4ECFB3]'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {copied && (
          <p className="text-green-600 text-xs mt-1 text-center">
            招待リンクをコピーしました！
          </p>
        )}
      </div>

      {/* シェアボタン */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={shareViaLine}
          className="flex-1 bg-[#06C755] text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-[#05B54D] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .195-.1.378-.267.481l-2.986 2.195.96 2.841c.039.113.059.229.059.345 0 .349-.285.631-.631.631-.115 0-.229-.02-.342-.059l-2.831-.951-2.195 2.98c-.103.167-.285.267-.481.267-.346 0-.631-.282-.631-.631 0-.116.02-.23.059-.343l.951-2.831-2.98-2.195c-.167-.103-.267-.286-.267-.481 0-.346.285-.631.631-.631h.001c.116 0 .23.02.343.059l2.831.951 2.195-2.98c.103-.167.286-.267.481-.267.347 0 .631.285.631.631 0 .115-.02.229-.059.342l-.951 2.831 2.98 2.195c.167.103.267.286.267.481z"/>
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 4.547 3.597 8.358 8.455 9.09.328.071.776.217.889.499.102.255.066.653.033.911l-.144.862c-.044.259-.202 1.015.889.553 1.09-.462 5.883-3.468 8.025-5.936C21.442 15.714 22 13.605 22 11.243 22 6.145 17.523 2 12 2z"/>
          </svg>
          LINEで送る
        </button>
        <button
          onClick={shareViaTwitter}
          className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Xでシェア
        </button>
      </div>

      {/* 紹介状況 */}
      {data.totalReferrals > 0 && (
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-left text-sm text-[#3A405A]/60 hover:text-[#3A405A] transition-colors"
          >
            紹介状況を{showDetails ? '閉じる' : '見る'} ▼
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2">
              {/* 統計 */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-[#5DDFC3]" />
                  <span className="text-[#3A405A]">
                    デイリーミッション: {1 + data.bonusDailyQuests}個/日
                  </span>
                </div>
              </div>

              {/* 紹介リスト */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {data.referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[#3A405A]">
                      {ref.referred?.name || '名前未設定'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        ref.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {ref.status === 'completed' ? '成立' : '1章クリア待ち'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
