'use client'

import { useState } from 'react'
import { Question, Answer } from '@/lib/types/database'

interface QuestionEditorProps {
  question?: Question
  chapterId: number
  onSave: (data: Partial<Question>) => Promise<void>
  onCancel: () => void
}

export default function QuestionEditor({
  question,
  chapterId,
  onSave,
  onCancel,
}: QuestionEditorProps) {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    choice_a: question?.choice_a || '',
    choice_b: question?.choice_b || '',
    choice_c: question?.choice_c || '',
    choice_d: question?.choice_d || '',
    correct_answer: question?.correct_answer || ('A' as Answer),
    explanation: question?.explanation || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave({
        ...formData,
        chapter_id: chapterId,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {question ? '問題を編集' : '新しい問題を追加'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">問題文</label>
              <textarea
                name="question_text"
                value={formData.question_text}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="問題文を入力してください"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">選択肢 A</label>
              <input
                type="text"
                name="choice_a"
                value={formData.choice_a}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="選択肢Aを入力"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">選択肢 B</label>
              <input
                type="text"
                name="choice_b"
                value={formData.choice_b}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="選択肢Bを入力"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">選択肢 C</label>
              <input
                type="text"
                name="choice_c"
                value={formData.choice_c}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="選択肢Cを入力"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">選択肢 D</label>
              <input
                type="text"
                name="choice_d"
                value={formData.choice_d}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="選択肢Dを入力"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">正解</label>
              <select
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">解説（任意）</label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="解答の解説を入力してください（省略可）"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
