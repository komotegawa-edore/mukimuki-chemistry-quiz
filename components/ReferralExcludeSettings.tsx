'use client'

import { useEffect, useState } from 'react'
import { Users, X, Search, Save, UserX } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
}

export default function ReferralExcludeSettings() {
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 現在の設定を取得
      const settingsRes = await fetch('/api/settings?key=referral_excluded_user_ids')
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        // settings は単一オブジェクトまたは配列の可能性
        const setting = data.settings
        if (setting?.setting_value) {
          try {
            const ids = JSON.parse(setting.setting_value)
            setExcludedUserIds(Array.isArray(ids) ? ids : [])
          } catch {
            setExcludedUserIds([])
          }
        }
      }

      // ユーザー一覧を取得
      const usersRes = await fetch('/api/rankings?type=total&limit=1000')
      if (usersRes.ok) {
        const data = await usersRes.json()
        const userList = data.rankings?.map((r: { user_id: string; name: string; email?: string }) => ({
          id: r.user_id,
          name: r.name,
          email: r.email || ''
        })) || []
        setUsers(userList)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: 'referral_excluded_user_ids',
          setting_value: JSON.stringify(excludedUserIds)
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '保存しました' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存に失敗しました' })
    } finally {
      setSaving(false)
    }
  }

  const toggleUser = (userId: string) => {
    setExcludedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <UserX className="w-5 h-5 text-orange-500" />
          招待機能の除外設定
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        選択したユーザーには「友達を招待」カードが表示されません（塾生など招待機能を使わせたくないユーザーを設定）
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* 選択済みユーザー */}
      {excludedUserIds.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm font-medium text-orange-800 mb-2">
            除外中のユーザー ({excludedUserIds.length}人)
          </p>
          <div className="flex flex-wrap gap-2">
            {excludedUserIds.map(userId => {
              const user = users.find(u => u.id === userId)
              return (
                <span
                  key={userId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                >
                  {user?.name || userId.slice(0, 8)}
                  <button
                    onClick={() => toggleUser(userId)}
                    className="hover:text-orange-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* 検索 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ユーザーを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* ユーザーリスト */}
      <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">
            {searchTerm ? '該当するユーザーがいません' : 'ユーザーがいません'}
          </p>
        ) : (
          filteredUsers.slice(0, 100).map(user => (
            <label
              key={user.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={excludedUserIds.includes(user.id)}
                onChange={() => toggleUser(user.id)}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                {user.email && (
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                )}
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
