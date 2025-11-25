'use client'

import { useEffect, useState } from 'react'
import { Zap, Plus, Edit, Trash2, X, Calendar, Coins, Target, Clock } from 'lucide-react'
import Link from 'next/link'

interface TemporaryQuest {
  id: number
  title: string
  description: string
  thumbnail_url: string | null
  reward_points: number
  passing_score: number
  start_date: string
  end_date: string
  is_published: boolean
  created_at: string
  updated_at: string
}

type FormMode = 'create' | 'edit' | null

export default function TemporaryQuestsPage() {
  const [quests, setQuests] = useState<TemporaryQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    reward_points: 5,
    passing_score: 80,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_published: false
  })

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/temporary-quests')

      if (!response.ok) {
        throw new Error('クエストの取得に失敗しました')
      }

      const data = await response.json()
      setQuests(data.quests || [])
    } catch (err) {
      console.error('Failed to fetch quests:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = formMode === 'edit' ? `/api/temporary-quests/${editingId}` : '/api/temporary-quests'
      const method = formMode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('クエストの保存に失敗しました')
      }

      await fetchQuests()
      closeForm()
    } catch (err) {
      console.error('Failed to save quest:', err)
      alert(err instanceof Error ? err.message : '保存に失敗しました')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このクエストを削除してもよろしいですか？問題も全て削除されます。')) return

    try {
      const response = await fetch(`/api/temporary-quests/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }

      await fetchQuests()
    } catch (err) {
      console.error('Failed to delete quest:', err)
      alert(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const openCreateForm = () => {
    setFormMode('create')
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      thumbnail_url: '',
      reward_points: 5,
      passing_score: 80,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_published: false
    })
  }

  const openEditForm = (quest: TemporaryQuest) => {
    setFormMode('edit')
    setEditingId(quest.id)
    setFormData({
      title: quest.title,
      description: quest.description,
      thumbnail_url: quest.thumbnail_url || '',
      reward_points: quest.reward_points,
      passing_score: quest.passing_score,
      start_date: quest.start_date.split('T')[0],
      end_date: quest.end_date.split('T')[0],
      is_published: quest.is_published
    })
  }

  const closeForm = () => {
    setFormMode(null)
    setEditingId(null)
  }

  const getQuestStatus = (quest: TemporaryQuest) => {
    const now = new Date()
    const start = new Date(quest.start_date)
    const end = new Date(quest.end_date)

    if (!quest.is_published) {
      return { text: '下書き', color: 'bg-gray-200 text-gray-600' }
    }
    if (now < start) {
      return { text: '開催前', color: 'bg-blue-100 text-blue-800' }
    }
    if (now > end) {
      return { text: '終了', color: 'bg-gray-300 text-gray-700' }
    }
    return { text: '開催中', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6" />
              臨時クエスト管理
            </h1>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-7 w-7 text-purple-600" />
              臨時クエスト管理
            </h1>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              新規作成
            </button>
          </div>
          <p className="text-gray-600">
            期間限定の特別クエストを作成・管理できます
          </p>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        <div className="p-6">
          {quests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>クエストがまだありません</p>
              <p className="text-sm">「新規作成」ボタンから作成してください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quests.map((quest) => {
                const status = getQuestStatus(quest)
                return (
                  <div
                    key={quest.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {quest.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{quest.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/dashboard/temporary-quests/${quest.id}/questions`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="問題管理"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => openEditForm(quest)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="編集"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quest.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span>報酬: {quest.reward_points}pt</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>合格: {quest.passing_score}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{new Date(quest.start_date).toLocaleDateString('ja-JP')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span>{new Date(quest.end_date).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {formMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {formMode === 'create' ? 'クエストを作成' : 'クエストを編集'}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="例: 冬期特別クエスト"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="クエストの詳細を入力してください"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reward_points" className="block text-sm font-medium text-gray-700 mb-1">
                    報酬ポイント <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[3, 5, 10, 15, 20].map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setFormData({ ...formData, reward_points: pt })}
                        className={`px-3 py-1 text-sm rounded ${
                          formData.reward_points === pt
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pt}pt
                      </button>
                    ))}
                  </div>
                  <input
                    id="reward_points"
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.reward_points}
                    onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="passing_score" className="block text-sm font-medium text-gray-700 mb-1">
                    クリア基準 (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[60, 70, 80, 90, 100].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setFormData({ ...formData, passing_score: score })}
                        className={`px-3 py-1 text-sm rounded ${
                          formData.passing_score === score
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {score}%
                      </button>
                    ))}
                  </div>
                  <input
                    id="passing_score"
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    開始日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="start_date"
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    終了日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="end_date"
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_published"
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  すぐに公開する
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
  )
}
