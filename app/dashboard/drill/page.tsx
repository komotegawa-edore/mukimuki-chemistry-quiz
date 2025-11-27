'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { BookOpen, ChevronRight, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react'

interface Deck {
  id: number
  name: string
  description: string | null
  subject: string
  category: string | null
  display_order: number
  is_published: boolean
  cards: { count: number }[]
}

const subjectNames: Record<string, string> = {
  japanese_history: '日本史',
  english: '英語',
  chemistry: '化学',
}

export default function DrillManagePage() {
  const router = useRouter()
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: 'japanese_history',
  })

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/drill/decks')
      if (!response.ok) throw new Error('Failed to fetch decks')
      const data = await response.json()
      setDecks(data)
    } catch (err) {
      console.error('Failed to fetch decks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDecks()
  }, [])

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subject)) {
        newSet.delete(subject)
      } else {
        newSet.add(subject)
      }
      return newSet
    })
  }

  const handleCreateDeck = async () => {
    try {
      const response = await fetch('/api/drill/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to create deck')
      setIsCreating(false)
      setFormData({ name: '', description: '', subject: 'japanese_history' })
      fetchDecks()
    } catch (err) {
      alert('作成に失敗しました')
      console.error(err)
    }
  }

  const handleUpdateDeck = async () => {
    if (!editingDeck) return

    try {
      const response = await fetch(`/api/drill/decks/${editingDeck.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingDeck,
          name: formData.name,
          description: formData.description,
          subject: formData.subject,
        }),
      })
      if (!response.ok) throw new Error('Failed to update deck')
      setEditingDeck(null)
      setFormData({ name: '', description: '', subject: 'japanese_history' })
      fetchDecks()
    } catch (err) {
      alert('更新に失敗しました')
      console.error(err)
    }
  }

  const handleDeleteDeck = async (deck: Deck) => {
    const cardCount = deck.cards[0]?.count || 0
    if (!confirm(`「${deck.name}」を削除しますか？\n${cardCount}枚のカードも削除されます。`)) return

    try {
      const response = await fetch(`/api/drill/decks/${deck.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete deck')
      fetchDecks()
    } catch (err) {
      alert('削除に失敗しました')
      console.error(err)
    }
  }

  const handleTogglePublish = async (deck: Deck) => {
    try {
      const response = await fetch(`/api/drill/decks/${deck.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...deck,
          is_published: !deck.is_published,
        }),
      })
      if (!response.ok) throw new Error('Failed to toggle publish')
      fetchDecks()
    } catch (err) {
      alert('公開状態の切り替えに失敗しました')
      console.error(err)
    }
  }

  const startEditing = (deck: Deck) => {
    setEditingDeck(deck)
    setFormData({
      name: deck.name,
      description: deck.description || '',
      subject: deck.subject,
    })
  }

  // 教科ごとにグループ化
  const decksBySubject = decks.reduce(
    (acc, deck) => {
      if (!acc[deck.subject]) {
        acc[deck.subject] = []
      }
      acc[deck.subject].push(deck)
      return acc
    },
    {} as Record<string, Deck[]>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7]">
        <p className="text-[#3A405A]">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F9F7]">
      <Header
        title="ドリル管理"
        rightContent={
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#5DDFC3] hover:text-[#4ECFB3] font-medium text-sm transition-colors"
          >
            ← ダッシュボードに戻る
          </button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 新規セクション追加ボタン */}
        <div className="mb-6">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] transition-colors"
          >
            <Plus className="w-5 h-5" />
            新規セクションを追加
          </button>
        </div>

        {/* 教科ごとのセクション一覧 */}
        <div className="space-y-6">
          {Object.entries(decksBySubject).map(([subject, subjectDecks]) => {
            const isExpanded = expandedSubjects.has(subject)
            const totalCards = subjectDecks.reduce(
              (sum, deck) => sum + (deck.cards[0]?.count || 0),
              0
            )

            return (
              <div
                key={subject}
                className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-[#E0F7F1]"
              >
                {/* 教科ヘッダー */}
                <button
                  onClick={() => toggleSubject(subject)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F4F9F7] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-[#5DDFC3]" />
                    <h2 className="text-xl font-semibold text-[#3A405A]">
                      {subjectNames[subject] || subject}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#3A405A] opacity-70">
                      {subjectDecks.length}セクション / {totalCards}問
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#5DDFC3] transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* セクション一覧 */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="space-y-3">
                      {subjectDecks.map((deck) => {
                        const cardCount = deck.cards[0]?.count || 0

                        return (
                          <div
                            key={deck.id}
                            className="flex items-center justify-between p-4 bg-[#F4F9F7] rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-[#3A405A]">
                                  {deck.name}
                                </h3>
                                {deck.is_published ? (
                                  <span className="px-2 py-0.5 bg-[#E0F7F1] text-[#5DDFC3] text-xs font-semibold rounded">
                                    公開中
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                                    非公開
                                  </span>
                                )}
                              </div>
                              {deck.description && (
                                <p className="text-sm text-[#3A405A] opacity-70 mt-1">
                                  {deck.description}
                                </p>
                              )}
                              <p className="text-sm text-[#3A405A] opacity-50 mt-1">
                                {cardCount}枚のカード
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleTogglePublish(deck)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  deck.is_published
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-[#E0F7F1] text-[#5DDFC3] hover:bg-[#5DDFC3] hover:text-white'
                                }`}
                              >
                                {deck.is_published ? '非公開' : '公開'}
                              </button>
                              <button
                                onClick={() => startEditing(deck)}
                                className="p-2 text-[#5DDFC3] hover:bg-[#E0F7F1] rounded transition-colors"
                                title="セクション名を編集"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <Link
                                href={`/dashboard/drill/${deck.id}`}
                                className="flex items-center gap-1 px-3 py-1 bg-[#5DDFC3] text-white rounded hover:bg-[#4ECFB3] transition-colors text-sm"
                              >
                                カード編集
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteDeck(deck)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="削除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {decks.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-[#3A405A]">
            まだセクションがありません。<br />
            「新規セクションを追加」ボタンから作成してください。
          </div>
        )}
      </main>

      {/* 新規作成/編集モーダル */}
      {(isCreating || editingDeck) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#3A405A] mb-4">
              {editingDeck ? 'セクションを編集' : '新規セクションを追加'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A405A] mb-1">
                  セクション名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                  placeholder="例: セクション1 原始時代"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A405A] mb-1">
                  説明（任意）
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                  placeholder="例: 旧石器時代〜縄文時代"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A405A] mb-1">
                  教科
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                >
                  <option value="japanese_history">日本史</option>
                  <option value="english">英語</option>
                  <option value="chemistry">化学</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false)
                  setEditingDeck(null)
                  setFormData({ name: '', description: '', subject: 'japanese_history' })
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={editingDeck ? handleUpdateDeck : handleCreateDeck}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingDeck ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
