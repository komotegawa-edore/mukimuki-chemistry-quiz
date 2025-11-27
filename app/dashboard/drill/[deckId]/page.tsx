'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'

interface Card {
  id: number
  deck_id: number
  front_text: string
  back_text: string
  order_num: number
  is_published: boolean
}

interface Deck {
  id: number
  name: string
  description: string | null
  subject: string
}

export default function DeckCardsPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = use(params)
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [deck, setDeck] = useState<Deck | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    front_text: '',
    back_text: '',
  })

  const fetchData = async () => {
    try {
      const [cardsRes, deckRes] = await Promise.all([
        fetch(`/api/drill/cards?deckId=${deckId}`),
        fetch(`/api/drill/decks/${deckId}`),
      ])

      if (!cardsRes.ok || !deckRes.ok) throw new Error('Failed to fetch data')

      const [cardsData, deckData] = await Promise.all([
        cardsRes.json(),
        deckRes.json(),
      ])

      setCards(cardsData)
      setDeck(deckData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [deckId])

  const handleCreateCard = async () => {
    try {
      const response = await fetch('/api/drill/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deck_id: parseInt(deckId),
          front_text: formData.front_text,
          back_text: formData.back_text,
        }),
      })
      if (!response.ok) throw new Error('Failed to create card')
      setIsCreating(false)
      setFormData({ front_text: '', back_text: '' })
      fetchData()
    } catch (err) {
      alert('作成に失敗しました')
      console.error(err)
    }
  }

  const handleUpdateCard = async () => {
    if (!editingCard) return

    try {
      const response = await fetch(`/api/drill/cards/${editingCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front_text: formData.front_text,
          back_text: formData.back_text,
        }),
      })
      if (!response.ok) throw new Error('Failed to update card')
      setEditingCard(null)
      setFormData({ front_text: '', back_text: '' })
      fetchData()
    } catch (err) {
      alert('更新に失敗しました')
      console.error(err)
    }
  }

  const handleDeleteCard = async (card: Card) => {
    if (!confirm(`「${card.front_text}」を削除しますか？`)) return

    try {
      const response = await fetch(`/api/drill/cards/${card.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete card')
      fetchData()
    } catch (err) {
      alert('削除に失敗しました')
      console.error(err)
    }
  }

  const handleTogglePublish = async (card: Card) => {
    try {
      const response = await fetch(`/api/drill/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_published: !card.is_published,
        }),
      })
      if (!response.ok) throw new Error('Failed to toggle publish')
      fetchData()
    } catch (err) {
      alert('公開状態の切り替えに失敗しました')
      console.error(err)
    }
  }

  const startEditing = (card: Card) => {
    setEditingCard(card)
    setFormData({
      front_text: card.front_text,
      back_text: card.back_text,
    })
  }

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
        title={deck?.name || 'カード管理'}
        rightContent={
          <button
            onClick={() => router.push('/dashboard/drill')}
            className="text-[#5DDFC3] hover:text-[#4ECFB3] font-medium text-sm transition-colors"
          >
            ← セクション一覧に戻る
          </button>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 新規カード追加ボタン */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-[#3A405A]">
            {cards.length}枚のカード
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] transition-colors"
          >
            <Plus className="w-5 h-5" />
            新規カードを追加
          </button>
        </div>

        {/* カード一覧 */}
        {cards.length > 0 ? (
          <div className="space-y-3">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border-2 border-[#E0F7F1]"
              >
                <div className="text-gray-400 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-shrink-0 w-8 h-8 bg-[#E0F7F1] rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#5DDFC3]">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-[#3A405A] truncate">
                      {card.front_text}
                    </p>
                    {card.is_published ? (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-[#E0F7F1] text-[#5DDFC3] text-xs font-semibold rounded">
                        公開
                      </span>
                    ) : (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                        非公開
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#5DDFC3] truncate">
                    → {card.back_text}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(card)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      card.is_published
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-[#E0F7F1] text-[#5DDFC3] hover:bg-[#5DDFC3] hover:text-white'
                    }`}
                  >
                    {card.is_published ? '非公開' : '公開'}
                  </button>
                  <button
                    onClick={() => startEditing(card)}
                    className="p-2 text-[#5DDFC3] hover:bg-[#E0F7F1] rounded transition-colors"
                    title="編集"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-[#3A405A] border-2 border-[#E0F7F1]">
            まだカードがありません。<br />
            「新規カードを追加」ボタンから作成してください。
          </div>
        )}
      </main>

      {/* 新規作成/編集モーダル */}
      {(isCreating || editingCard) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#3A405A] mb-4">
              {editingCard ? 'カードを編集' : '新規カードを追加'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A405A] mb-1">
                  問題文（表面）
                </label>
                <textarea
                  value={formData.front_text}
                  onChange={(e) => setFormData({ ...formData, front_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent resize-none"
                  rows={3}
                  placeholder="例: 旧石器時代の代表的な遺跡は？"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A405A] mb-1">
                  解答（裏面）
                </label>
                <textarea
                  value={formData.back_text}
                  onChange={(e) => setFormData({ ...formData, back_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent resize-none"
                  rows={3}
                  placeholder="例: 岩宿遺跡"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false)
                  setEditingCard(null)
                  setFormData({ front_text: '', back_text: '' })
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={editingCard ? handleUpdateCard : handleCreateCard}
                disabled={!formData.front_text.trim() || !formData.back_text.trim()}
                className="px-4 py-2 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCard ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
