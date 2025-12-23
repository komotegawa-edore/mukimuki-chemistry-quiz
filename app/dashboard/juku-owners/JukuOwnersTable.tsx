'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface JukuOwner {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  created_at: string
  sales_status: string | null
  sales_notes: string | null
  last_contacted_at: string | null
  next_action_at: string | null
  student_count: string | null
  revenue_scale: string | null
  classroom_count: number | null
  competitors: string | null
  source: string | null
  prefecture: string | null
  city: string | null
  is_active: boolean | null
  can_use_custom_domain: boolean | null
  siteCount: number
  publishedCount: number
}

interface Props {
  owners: JukuOwner[]
}

const STATUS_OPTIONS = [
  { value: 'new', label: '新規', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'contacted', label: '連絡済み', color: 'bg-blue-100 text-blue-700' },
  { value: 'negotiating', label: '商談中', color: 'bg-purple-100 text-purple-700' },
  { value: 'converted', label: '成約', color: 'bg-green-100 text-green-700' },
  { value: 'lost', label: '失注', color: 'bg-gray-100 text-gray-500' },
]

const STUDENT_COUNT_OPTIONS = [
  { value: '~30', label: '~30人' },
  { value: '30-100', label: '30-100人' },
  { value: '100-300', label: '100-300人' },
  { value: '300+', label: '300人以上' },
]

const SOURCE_OPTIONS = [
  { value: 'ad_google', label: 'Google広告' },
  { value: 'ad_meta', label: 'Meta広告' },
  { value: 'organic', label: '検索流入' },
  { value: 'referral', label: '紹介' },
  { value: 'direct', label: '直接' },
  { value: 'other', label: 'その他' },
]

export default function JukuOwnersTable({ owners }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('all')
  const [selectedOwner, setSelectedOwner] = useState<JukuOwner | null>(null)
  const [editData, setEditData] = useState<Partial<JukuOwner>>({})
  const [saving, setSaving] = useState(false)

  // Account creation state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAccount, setNewAccount] = useState({ name: '', email: '', phone: '' })
  const [creating, setCreating] = useState(false)
  const [createdAccount, setCreatedAccount] = useState<{ email: string; tempPassword: string } | null>(null)

  // Account status toggle
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null)

  // Custom domain permission toggle
  const [togglingDomain, setTogglingDomain] = useState<string | null>(null)

  const filteredOwners = owners.filter(owner => {
    if (filter === 'all') return true
    const status = owner.sales_status || 'new'
    return status === filter
  })

  const getStatusBadge = (status: string | null) => {
    const s = STATUS_OPTIONS.find(opt => opt.value === (status || 'new'))
    return s ? (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
        {s.label}
      </span>
    ) : null
  }

  const openEditModal = (owner: JukuOwner) => {
    setSelectedOwner(owner)
    setEditData({
      sales_status: owner.sales_status || 'new',
      sales_notes: owner.sales_notes || '',
      last_contacted_at: owner.last_contacted_at?.split('T')[0] || '',
      next_action_at: owner.next_action_at?.split('T')[0] || '',
      student_count: owner.student_count || '',
      revenue_scale: owner.revenue_scale || '',
      classroom_count: owner.classroom_count || undefined,
      competitors: owner.competitors || '',
      source: owner.source || '',
      prefecture: owner.prefecture || '',
      city: owner.city || '',
    })
  }

  const closeModal = () => {
    setSelectedOwner(null)
    setEditData({})
  }

  // Create new account
  const handleCreateAccount = async () => {
    if (!newAccount.name || !newAccount.email) {
      alert('名前とメールアドレスは必須です')
      return
    }

    setCreating(true)

    try {
      const res = await fetch('/api/juku-admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccount.name,
          email: newAccount.email,
          phone: newAccount.phone || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'アカウント作成に失敗しました')
        setCreating(false)
        return
      }

      // Show the created account info
      setCreatedAccount({
        email: data.email,
        tempPassword: data.tempPassword,
      })
      setCreating(false)
    } catch (error) {
      alert('エラーが発生しました')
      setCreating(false)
    }
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setNewAccount({ name: '', email: '', phone: '' })
    if (createdAccount) {
      setCreatedAccount(null)
      router.refresh()
    }
  }

  // Toggle account status
  const handleToggleStatus = async (ownerId: string, currentStatus: boolean | null) => {
    const newStatus = !(currentStatus ?? true)
    const confirmMessage = newStatus
      ? 'このアカウントを有効化しますか？'
      : 'このアカウントを無効化しますか？ログインできなくなります。'

    if (!confirm(confirmMessage)) return

    setTogglingStatus(ownerId)

    try {
      const res = await fetch('/api/juku-admin/accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: ownerId,
          isActive: newStatus,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'ステータス変更に失敗しました')
        setTogglingStatus(null)
        return
      }

      setTogglingStatus(null)
      router.refresh()
    } catch (error) {
      alert('エラーが発生しました')
      setTogglingStatus(null)
    }
  }

  // Toggle custom domain permission
  const handleToggleCustomDomain = async (ownerId: string, currentValue: boolean | null) => {
    const newValue = !(currentValue ?? false)

    setTogglingDomain(ownerId)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('juku_owner_profiles')
        .update({
          can_use_custom_domain: newValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ownerId)

      if (error) {
        alert('権限変更に失敗しました: ' + error.message)
        setTogglingDomain(null)
        return
      }

      setTogglingDomain(null)
      router.refresh()
    } catch (error) {
      alert('エラーが発生しました')
      setTogglingDomain(null)
    }
  }

  const handleSave = async () => {
    if (!selectedOwner) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('juku_owner_profiles')
      .update({
        sales_status: editData.sales_status,
        sales_notes: editData.sales_notes || null,
        last_contacted_at: editData.last_contacted_at || null,
        next_action_at: editData.next_action_at || null,
        student_count: editData.student_count || null,
        revenue_scale: editData.revenue_scale || null,
        classroom_count: editData.classroom_count || null,
        competitors: editData.competitors || null,
        source: editData.source || null,
        prefecture: editData.prefecture || null,
        city: editData.city || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedOwner.id)

    setSaving(false)

    if (error) {
      alert('保存に失敗しました: ' + error.message)
      return
    }

    closeModal()
    router.refresh()
  }

  return (
    <>
      {/* フィルター & アカウント作成ボタン */}
      <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全て ({owners.length})
          </button>
          {STATUS_OPTIONS.map(status => {
            const count = owners.filter(o => (o.sales_status || 'new') === status.value).length
            return (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status.value
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.label} ({count})
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規アカウント
        </button>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">塾名/連絡先</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">アカウント</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">独自ドメイン</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ステータス</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">サイト</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">規模</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録日</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOwners.map(owner => (
              <tr key={owner.id} className={`hover:bg-gray-50 ${owner.is_active === false ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-800">{owner.name || '未設定'}</p>
                    <p className="text-xs text-gray-500">{owner.email}</p>
                    {owner.phone && <p className="text-xs text-gray-500">{owner.phone}</p>}
                    {(owner.prefecture || owner.city) && (
                      <p className="text-xs text-gray-400">{owner.prefecture} {owner.city}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleStatus(owner.id, owner.is_active)}
                    disabled={togglingStatus === owner.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      owner.is_active === false
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } ${togglingStatus === owner.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {togglingStatus === owner.id ? '...' : (owner.is_active === false ? '無効' : '有効')}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleCustomDomain(owner.id, owner.can_use_custom_domain)}
                    disabled={togglingDomain === owner.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      owner.can_use_custom_domain
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } ${togglingDomain === owner.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {togglingDomain === owner.id ? '...' : (owner.can_use_custom_domain ? '許可' : '不可')}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(owner.sales_status)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="text-sm">
                    <span className="font-bold text-blue-600">{owner.siteCount}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-green-600">{owner.publishedCount}公開</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {owner.student_count || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {SOURCE_OPTIONS.find(s => s.value === owner.source)?.label || owner.source || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(owner.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => openEditModal(owner)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    編集
                  </button>
                </td>
              </tr>
            ))}
            {filteredOwners.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  該当する塾がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 編集モーダル */}
      {selectedOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedOwner.name || selectedOwner.email}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本情報（読み取り専用） */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">基本情報</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">メール:</span>
                    <span className="ml-2 text-gray-800">{selectedOwner.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">電話:</span>
                    <span className="ml-2 text-gray-800">{selectedOwner.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">登録日:</span>
                    <span className="ml-2 text-gray-800">
                      {new Date(selectedOwner.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">作成サイト:</span>
                    <span className="ml-2 text-gray-800">{selectedOwner.siteCount}件</span>
                  </div>
                </div>
              </div>

              {/* 営業ステータス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  営業ステータス
                </label>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map(status => (
                    <button
                      key={status.value}
                      onClick={() => setEditData({ ...editData, sales_status: status.value })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        editData.sales_status === status.value
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 日程 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最終連絡日
                  </label>
                  <input
                    type="date"
                    value={editData.last_contacted_at || ''}
                    onChange={(e) => setEditData({ ...editData, last_contacted_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    次回アクション日
                  </label>
                  <input
                    type="date"
                    value={editData.next_action_at || ''}
                    onChange={(e) => setEditData({ ...editData, next_action_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 塾情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    都道府県
                  </label>
                  <input
                    type="text"
                    value={editData.prefecture || ''}
                    onChange={(e) => setEditData({ ...editData, prefecture: e.target.value })}
                    placeholder="例: 大阪府"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    市区町村
                  </label>
                  <input
                    type="text"
                    value={editData.city || ''}
                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                    placeholder="例: 大阪市北区"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生徒数規模
                  </label>
                  <select
                    value={editData.student_count || ''}
                    onChange={(e) => setEditData({ ...editData, student_count: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {STUDENT_COUNT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    教室数
                  </label>
                  <input
                    type="number"
                    value={editData.classroom_count || ''}
                    onChange={(e) => setEditData({ ...editData, classroom_count: parseInt(e.target.value) || undefined })}
                    placeholder="例: 3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    流入経路
                  </label>
                  <select
                    value={editData.source || ''}
                    onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {SOURCE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    売上規模
                  </label>
                  <input
                    type="text"
                    value={editData.revenue_scale || ''}
                    onChange={(e) => setEditData({ ...editData, revenue_scale: e.target.value })}
                    placeholder="例: 年商3000万"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  競合情報
                </label>
                <input
                  type="text"
                  value={editData.competitors || ''}
                  onChange={(e) => setEditData({ ...editData, competitors: e.target.value })}
                  placeholder="例: 明光義塾、個別指導塾スタンダード"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 営業メモ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  営業メモ
                </label>
                <textarea
                  value={editData.sales_notes || ''}
                  onChange={(e) => setEditData({ ...editData, sales_notes: e.target.value })}
                  rows={4}
                  placeholder="商談内容、要望、次回アクションなどを記録"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* フッター */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アカウント作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {createdAccount ? 'アカウント作成完了' : '新規アカウント作成'}
              </h3>
              <button
                onClick={closeCreateModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createdAccount ? (
              <div className="p-6">
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <p className="text-green-700 font-medium mb-2">アカウントが作成されました</p>
                  <p className="text-sm text-green-600">以下の情報を顧客にお伝えください</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      ログインURL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://edore-edu.com/juku-admin/login"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText('https://edore-edu.com/juku-admin/login')}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        コピー
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      メールアドレス
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdAccount.email}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(createdAccount.email)}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        コピー
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      仮パスワード
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdAccount.tempPassword}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(createdAccount.tempPassword)}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        コピー
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ※初回ログイン後、パスワード変更を案内してください
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeCreateModal}
                  className="w-full mt-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      塾名/オーナー名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      placeholder="例: ○○学習塾 山田太郎"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newAccount.email}
                      onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      value={newAccount.phone}
                      onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                      placeholder="090-0000-0000"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeCreateModal}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleCreateAccount}
                    disabled={creating}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {creating ? '作成中...' : 'アカウント作成'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
