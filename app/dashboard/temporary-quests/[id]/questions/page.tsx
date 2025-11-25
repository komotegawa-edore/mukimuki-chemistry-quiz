'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Trash2, X, GripVertical } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

interface Question {
  id: number
  quest_id: number
  question_text: string
  choices: string[]
  correct_answer: number
  points: number
  explanation: string | null
  order_num: number
}

interface Quest {
  id: number
  title: string
}

type FormMode = 'create' | 'edit' | null

export default function QuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const questId = params.id as string

  const [quest, setQuest] = useState<Quest | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    question_text: '',
    choices: ['', '', '', ''],
    correct_answer: 0,
    points: 1,
    explanation: '',
    order_num: 1
  })

  useEffect(() => {
    fetchQuest()
    fetchQuestions()
  }, [questId])

  const fetchQuest = async () => {
    try {
      const response = await fetch(`/api/temporary-quests/${questId}`)
      if (!response.ok) throw new Error('クエストの取得に失敗しました')
      const data = await response.json()
      setQuest(data.quest)
    } catch (err) {
      console.error('Failed to fetch quest:', err)
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/temporary-quests/${questId}/questions`)
      if (!response.ok) throw new Error('問題の取得に失敗しました')
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 空の選択肢を除外
    const filteredChoices = formData.choices.filter(c => c.trim() !== '')

    if (filteredChoices.length < 2) {
      alert('選択肢は2つ以上必要です')
      return
    }

    if (formData.correct_answer >= filteredChoices.length) {
      alert('正解の選択肢が無効です')
      return
    }

    try {
      const url = formMode === 'edit'
        ? `/api/temporary-quests/${questId}/questions/${editingId}`
        : `/api/temporary-quests/${questId}/questions`
      const method = formMode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          choices: filteredChoices
        })
      })

      if (!response.ok) {
        throw new Error('問題の保存に失敗しました')
      }

      await fetchQuestions()
      closeForm()
    } catch (err) {
      console.error('Failed to save question:', err)
      alert(err instanceof Error ? err.message : '保存に失敗しました')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この問題を削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/temporary-quests/${questId}/questions/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }

      await fetchQuestions()
    } catch (err) {
      console.error('Failed to delete question:', err)
      alert(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const openCreateForm = () => {
    const nextOrderNum = questions.length > 0
      ? Math.max(...questions.map(q => q.order_num)) + 1
      : 1

    setFormMode('create')
    setEditingId(null)
    setFormData({
      question_text: '',
      choices: ['', '', '', ''],
      correct_answer: 0,
      points: 1,
      explanation: '',
      order_num: nextOrderNum
    })
  }

  const openEditForm = (question: Question) => {
    setFormMode('edit')
    setEditingId(question.id)
    setFormData({
      question_text: question.question_text,
      choices: [...question.choices, '', '', '', '', '', ''].slice(0, 6),
      correct_answer: question.correct_answer,
      points: question.points,
      explanation: question.explanation || '',
      order_num: question.order_num
    })
  }

  const closeForm = () => {
    setFormMode(null)
    setEditingId(null)
  }

  const setChoiceCount = (count: number) => {
    const newChoices = [...formData.choices]
    while (newChoices.length < count) newChoices.push('')
    setFormData({ ...formData, choices: newChoices.slice(0, count) })
  }

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...formData.choices]
    newChoices[index] = value
    setFormData({ ...formData, choices: newChoices })
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header
          title="問題管理"
          rightContent={
            <Link
              href="/dashboard/temporary-quests"
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              クエスト一覧に戻る
            </Link>
          }
        />
        <div className="container mx-auto p-6">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title={`${quest?.title} - 問題管理`}
        rightContent={
          <Link
            href="/dashboard/temporary-quests"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            クエスト一覧に戻る
          </Link>
        }
      />
      <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {quest?.title} - 問題管理
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                問題数: {questions.length}問 | 満点: {totalPoints}点
              </p>
            </div>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              問題を追加
            </button>
          </div>
        </div>

        <div className="p-6">
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>問題がまだありません</p>
              <p className="text-sm">「問題を追加」ボタンから作成してください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <GripVertical className="h-5 w-5" />
                      <span className="font-semibold text-lg text-gray-700">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900 flex-1">
                          {question.question_text}
                        </p>
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                          {question.points}点
                        </span>
                      </div>

                      <div className="space-y-1 mb-2">
                        {question.choices.map((choice, i) => (
                          <div
                            key={i}
                            className={`text-sm px-3 py-2 rounded ${
                              i === question.correct_answer
                                ? 'bg-green-50 text-green-900 font-medium border border-green-200'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {String.fromCharCode(65 + i)}. {choice}
                            {i === question.correct_answer && ' ✓'}
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>解説:</strong> {question.explanation}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(question)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="編集"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {formMode === 'create' ? '問題を追加' : '問題を編集'}
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
                <label htmlFor="question_text" className="block text-sm font-medium text-gray-700 mb-1">
                  問題文 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="question_text"
                  required
                  rows={3}
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="問題文を入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選択肢の数
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setChoiceCount(count)}
                      className={`px-3 py-1 text-sm rounded ${
                        formData.choices.length === count
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {count}択
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選択肢 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.choices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        required
                        value={choice}
                        onChange={(e) => updateChoice(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        placeholder={`選択肢${index + 1}`}
                      />
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={formData.correct_answer === index}
                        onChange={() => setFormData({ ...formData, correct_answer: index })}
                        className="h-5 w-5 text-purple-600"
                        title="正解"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ラジオボタンで正解を選択してください
                </p>
              </div>

              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                  配点
                </label>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 5, 10].map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setFormData({ ...formData, points: pt })}
                      className={`px-3 py-1 text-sm rounded ${
                        formData.points === pt
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pt}点
                    </button>
                  ))}
                </div>
                <input
                  id="points"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
                  解説（任意）
                </label>
                <textarea
                  id="explanation"
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="解説を入力してください"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {formMode === 'create' ? '追加' : '更新'}
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
