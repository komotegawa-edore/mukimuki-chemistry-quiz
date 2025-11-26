'use client'

import { useEffect, useState } from 'react'
import { Bell, Plus, Edit, Trash2, X, Calendar, AlertCircle, AlertTriangle, Info, ArrowLeft, Users, Monitor, MessageSquare, Search } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

interface Announcement {
  id: number
  title: string
  content: string
  priority: 'normal' | 'important' | 'urgent'
  is_published: boolean
  valid_from: string
  valid_until: string | null
  display_type: 'banner' | 'modal' | 'both'
  excluded_user_ids: string[]
  created_at: string
  updated_at: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

type FormMode = 'create' | 'edit' | null

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    is_published: false,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    display_type: 'banner' as 'banner' | 'modal' | 'both',
    excluded_user_ids: [] as string[]
  })

  useEffect(() => {
    fetchAnnouncements()
    fetchUsers()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/announcements')

      if (!response.ok) {
        throw new Error('お知らせの取得に失敗しました')
      }

      const data = await response.json()
      setAnnouncements(data.announcements || [])
    } catch (err) {
      console.error('Failed to fetch announcements:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/rankings?type=total&limit=1000')
      if (response.ok) {
        const data = await response.json()
        // ランキングAPIからユーザー一覧を取得
        const userList = data.rankings?.map((r: { user_id: string; name: string; email?: string }) => ({
          id: r.user_id,
          name: r.name,
          email: r.email || '',
          role: 'student'
        })) || []
        setUsers(userList)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = formMode === 'edit' ? `/api/announcements/${editingId}` : '/api/announcements'
      const method = formMode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valid_until: formData.valid_until || null
        })
      })

      if (!response.ok) {
        throw new Error('お知らせの保存に失敗しました')
      }

      await fetchAnnouncements()
      closeForm()
    } catch (err) {
      console.error('Failed to save announcement:', err)
      alert(err instanceof Error ? err.message : '保存に失敗しました')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このお知らせを削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }

      await fetchAnnouncements()
    } catch (err) {
      console.error('Failed to delete announcement:', err)
      alert(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const openCreateForm = () => {
    setFormMode('create')
    setEditingId(null)
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      is_published: false,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      display_type: 'banner',
      excluded_user_ids: []
    })
    setUserSearchTerm('')
  }

  const openEditForm = (announcement: Announcement) => {
    setFormMode('edit')
    setEditingId(announcement.id)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      is_published: announcement.is_published,
      valid_from: announcement.valid_from.split('T')[0],
      valid_until: announcement.valid_until ? announcement.valid_until.split('T')[0] : '',
      display_type: announcement.display_type || 'banner',
      excluded_user_ids: announcement.excluded_user_ids || []
    })
    setUserSearchTerm('')
  }

  const closeForm = () => {
    setFormMode(null)
    setEditingId(null)
  }

  const toggleExcludedUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      excluded_user_ids: prev.excluded_user_ids.includes(userId)
        ? prev.excluded_user_ids.filter(id => id !== userId)
        : [...prev.excluded_user_ids, userId]
    }))
  }

  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase())
  )

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            緊急
          </span>
        )
      case 'important':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            重要
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 flex items-center gap-1">
            <Info className="h-3 w-3" />
            通常
          </span>
        )
    }
  }

  const getDisplayTypeBadge = (displayType: string) => {
    switch (displayType) {
      case 'modal':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            ポップアップ
          </span>
        )
      case 'both':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            両方
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-600 flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            バナー
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header
          title="お知らせ管理"
          rightContent={
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              ダッシュボードに戻る
            </Link>
          }
        />
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">読み込み中...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title="お知らせ管理"
        rightContent={
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            ダッシュボードに戻る
          </Link>
        }
      />
      <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-7 w-7 text-blue-600" />
              お知らせ管理
            </h1>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              新規作成
            </button>
          </div>
          <p className="text-gray-600">
            生徒に表示するお知らせを作成・管理できます
          </p>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          </div>
        )}

        <div className="p-6">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>お知らせがまだありません</p>
              <p className="text-sm">「新規作成」ボタンから作成してください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {announcement.title}
                      </h3>
                      {getPriorityBadge(announcement.priority)}
                      {getDisplayTypeBadge(announcement.display_type)}
                      {announcement.is_published ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          公開中
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-600">
                          下書き
                        </span>
                      )}
                      {announcement.excluded_user_ids && announcement.excluded_user_ids.length > 0 && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {announcement.excluded_user_ids.length}人除外
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(announcement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="編集"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 whitespace-pre-wrap line-clamp-3">
                    {announcement.content}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(announcement.valid_from).toLocaleDateString('ja-JP')}
                        {announcement.valid_until && (
                          <> 〜 {new Date(announcement.valid_until).toLocaleDateString('ja-JP')}</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {formMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                {formMode === 'create' ? 'お知らせを作成' : 'お知らせを編集'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: 年末ポイントランキングイベント開催！"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder={`お知らせの詳細を入力してください

テーブルを表示する場合:
| 順位 | 報酬 | 人数 |
| --- | --- | --- |
| 1-4位 | 5,000円 | 4人 |
| 5-10位 | 1,000円 | 6人 |`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  テーブル形式で入力すると、モーダル表示時に表として整形されます
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    優先度
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'normal' | 'important' | 'urgent' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">通常</option>
                    <option value="important">重要</option>
                    <option value="urgent">緊急</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="display_type" className="block text-sm font-medium text-gray-700 mb-1">
                    表示タイプ
                  </label>
                  <select
                    id="display_type"
                    value={formData.display_type}
                    onChange={(e) => setFormData({ ...formData, display_type: e.target.value as 'banner' | 'modal' | 'both' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="banner">バナーのみ</option>
                    <option value="modal">ポップアップのみ（アプリ起動時）</option>
                    <option value="both">両方</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700 mb-1">
                    表示開始日時 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="valid_from"
                    type="datetime-local"
                    required
                    value={formData.valid_from.includes('T') ? formData.valid_from : formData.valid_from + 'T00:00'}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 mb-1">
                    表示終了日時（任意）
                  </label>
                  <input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 除外ユーザー選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  表示しないユーザー（除外リスト）
                </label>
                <div className="border border-gray-300 rounded-md p-3">
                  {/* 選択済みユーザー */}
                  {formData.excluded_user_ids.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {formData.excluded_user_ids.map(userId => {
                        const user = users.find(u => u.id === userId)
                        return (
                          <span
                            key={userId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                          >
                            {user?.name || userId.slice(0, 8)}
                            <button
                              type="button"
                              onClick={() => toggleExcludedUser(userId)}
                              className="hover:text-orange-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* 検索 */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ユーザーを検索..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm"
                    />
                  </div>

                  {/* ユーザーリスト */}
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredUsers.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2 text-center">
                        {userSearchTerm ? '該当するユーザーがいません' : 'ユーザーを読み込み中...'}
                      </p>
                    ) : (
                      filteredUsers.slice(0, 50).map(user => (
                        <label
                          key={user.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.excluded_user_ids.includes(user.id)}
                            onChange={() => toggleExcludedUser(user.id)}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">{user.name}</span>
                          {user.email && (
                            <span className="text-xs text-gray-400">{user.email}</span>
                          )}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  選択したユーザーにはこのお知らせが表示されません（塾生など賞金対象外のユーザーを除外する場合に使用）
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_published"
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  すぐに公開する
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {formMode === 'create' ? '作成' : '更新'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
