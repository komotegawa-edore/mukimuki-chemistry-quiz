'use client'

import { useState } from 'react'
import { Question, Answer, MediaType } from '@/lib/types/database'
import MediaUploadField from './MediaUploadField'

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
    media_type: question?.media_type || ('text' as MediaType),
    question_image_url: question?.question_image_url || null,
    question_audio_url: question?.question_audio_url || null,
    choice_a_image_url: question?.choice_a_image_url || null,
    choice_b_image_url: question?.choice_b_image_url || null,
    choice_c_image_url: question?.choice_c_image_url || null,
    choice_d_image_url: question?.choice_d_image_url || null,
    explanation_image_url: question?.explanation_image_url || null,
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#E0F7F1]">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-[#3A405A]">
            {question ? '問題を編集' : '新しい問題を追加'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">問題タイプ</label>
              <select
                name="media_type"
                value={formData.media_type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
              >
                <option value="text">テキストのみ</option>
                <option value="image">画像あり（有機化学など）</option>
                <option value="audio">音声あり（リスニング）</option>
                <option value="mixed">複合（画像+音声）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">問題文</label>
              <textarea
                name="question_text"
                value={formData.question_text}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="問題文を入力してください"
              />
            </div>

            {/* 問題文の画像 */}
            {(formData.media_type === 'image' || formData.media_type === 'mixed') && (
              <MediaUploadField
                label="問題文の画像（構造式など）"
                mediaType="image"
                currentUrl={formData.question_image_url}
                onUpload={(url) => setFormData({ ...formData, question_image_url: url })}
                onDelete={() => setFormData({ ...formData, question_image_url: null })}
                questionId={question?.id || null}
                fieldName="question_image"
              />
            )}

            {/* 問題文の音声 */}
            {(formData.media_type === 'audio' || formData.media_type === 'mixed') && (
              <MediaUploadField
                label="問題文の音声"
                mediaType="audio"
                currentUrl={formData.question_audio_url}
                onUpload={(url) => setFormData({ ...formData, question_audio_url: url })}
                onDelete={() => setFormData({ ...formData, question_audio_url: null })}
                questionId={question?.id || null}
                fieldName="question_audio"
              />
            )}

            <div className="space-y-3">
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">選択肢 A</label>
              <input
                type="text"
                name="choice_a"
                value={formData.choice_a}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="選択肢Aを入力"
              />
              {formData.media_type === 'image' && (
                <MediaUploadField
                  label="選択肢Aの画像"
                  mediaType="image"
                  currentUrl={formData.choice_a_image_url}
                  onUpload={(url) => setFormData({ ...formData, choice_a_image_url: url })}
                  onDelete={() => setFormData({ ...formData, choice_a_image_url: null })}
                  questionId={question?.id || null}
                  fieldName="choice_a_image"
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">選択肢 B</label>
              <input
                type="text"
                name="choice_b"
                value={formData.choice_b}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="選択肢Bを入力"
              />
              {formData.media_type === 'image' && (
                <MediaUploadField
                  label="選択肢Bの画像"
                  mediaType="image"
                  currentUrl={formData.choice_b_image_url}
                  onUpload={(url) => setFormData({ ...formData, choice_b_image_url: url })}
                  onDelete={() => setFormData({ ...formData, choice_b_image_url: null })}
                  questionId={question?.id || null}
                  fieldName="choice_b_image"
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">選択肢 C</label>
              <input
                type="text"
                name="choice_c"
                value={formData.choice_c}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="選択肢Cを入力"
              />
              {formData.media_type === 'image' && (
                <MediaUploadField
                  label="選択肢Cの画像"
                  mediaType="image"
                  currentUrl={formData.choice_c_image_url}
                  onUpload={(url) => setFormData({ ...formData, choice_c_image_url: url })}
                  onDelete={() => setFormData({ ...formData, choice_c_image_url: null })}
                  questionId={question?.id || null}
                  fieldName="choice_c_image"
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">選択肢 D</label>
              <input
                type="text"
                name="choice_d"
                value={formData.choice_d}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="選択肢Dを入力"
              />
              {formData.media_type === 'image' && (
                <MediaUploadField
                  label="選択肢Dの画像"
                  mediaType="image"
                  currentUrl={formData.choice_d_image_url}
                  onUpload={(url) => setFormData({ ...formData, choice_d_image_url: url })}
                  onDelete={() => setFormData({ ...formData, choice_d_image_url: null })}
                  questionId={question?.id || null}
                  fieldName="choice_d_image"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">正解</label>
              <select
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">解説（任意）</label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="解答の解説を入力してください（省略可）"
              />
              <MediaUploadField
                label="解説の画像"
                mediaType="image"
                currentUrl={formData.explanation_image_url}
                onUpload={(url) => setFormData({ ...formData, explanation_image_url: url })}
                onDelete={() => setFormData({ ...formData, explanation_image_url: null })}
                questionId={question?.id || null}
                fieldName="explanation_image"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-[#3A405A] transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] disabled:opacity-50 transition-colors"
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
