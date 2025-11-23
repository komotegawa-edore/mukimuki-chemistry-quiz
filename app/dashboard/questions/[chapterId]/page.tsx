'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuestionEditor from '@/components/QuestionEditor'
import { Question } from '@/lib/types/database'
import { exportChapterTestToPDF, exportChapterWithAnswersToPDF } from '@/lib/utils/pdfExport'
import Header from '@/components/Header'

export default function QuestionsManagePage({
  params,
}: {
  params: { chapterId: string }
}) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [chapterTitle, setChapterTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `/api/questions?chapterId=${params.chapterId}`
      )
      if (!response.ok) throw new Error('Failed to fetch questions')
      const data = await response.json()
      setQuestions(data)

      const chaptersResponse = await fetch('/api/chapters')
      if (chaptersResponse.ok) {
        const chapters = await chaptersResponse.json()
        const chapter = chapters.find(
          (c: { id: number }) => c.id === parseInt(params.chapterId)
        )
        if (chapter) {
          setChapterTitle(chapter.title)
        }
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [params.chapterId])

  const handleSave = async (data: Partial<Question>) => {
    try {
      if (editingQuestion) {
        // 更新
        const response = await fetch(`/api/questions/${editingQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Failed to update question')
      } else {
        // 新規作成
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Failed to create question')
      }

      setEditingQuestion(null)
      setIsCreating(false)
      fetchQuestions()
    } catch (err) {
      alert('保存に失敗しました')
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この問題を削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete question')
      fetchQuestions()
    } catch (err) {
      alert('削除に失敗しました')
      console.error(err)
    }
  }

  const handleTogglePublish = async (question: Question) => {
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_published: !question.is_published,
        }),
      })
      if (!response.ok) throw new Error('Failed to toggle publish status')
      fetchQuestions()
    } catch (err) {
      alert('公開状態の切り替えに失敗しました')
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7]">
        <p className="text-[#3A405A]">読み込み中...</p>
      </div>
    )
  }

  const handleExportTestPDF = () => {
    if (questions.length === 0) {
      alert('エクスポートする問題がありません')
      return
    }
    exportChapterTestToPDF(chapterTitle, questions)
  }

  const handleExportAnswerPDF = () => {
    if (questions.length === 0) {
      alert('エクスポートする問題がありません')
      return
    }
    exportChapterWithAnswersToPDF(chapterTitle, questions)
  }

  return (
    <div className="min-h-screen bg-[#F4F9F7]">
      <Header
        title={chapterTitle}
        rightContent={
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#5DDFC3] hover:text-[#4ECFB3] font-medium text-sm transition-colors"
          >
            ← ダッシュボードに戻る
          </button>
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 justify-end mb-4">
          <button
            onClick={handleExportTestPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors disabled:opacity-50"
            disabled={questions.length === 0}
          >
            テスト用印刷
          </button>
          <button
            onClick={handleExportAnswerPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors disabled:opacity-50"
            disabled={questions.length === 0}
          >
            解答付き印刷
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-[#5DDFC3] text-white rounded-lg hover:bg-[#4ECFB3] transition-colors"
          >
            新規問題を追加
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-[#E0F7F1]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-[#3A405A]">
                        問題 {index + 1}: {question.question_text}
                      </h3>
                      {question.is_published ? (
                        <span className="inline-block px-2 py-1 bg-[#E0F7F1] text-[#5DDFC3] text-xs font-semibold rounded">
                          公開中
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                          非公開
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePublish(question)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        question.is_published
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-[#E0F7F1] text-[#5DDFC3] hover:bg-[#5DDFC3] hover:text-white'
                      }`}
                    >
                      {question.is_published ? '非公開にする' : '公開する'}
                    </button>
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="px-3 py-1 text-[#5DDFC3] border border-[#5DDFC3] rounded hover:bg-[#F4F9F7] transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-[#3A405A]">
                  <div className="flex gap-2">
                    <span className="font-semibold">A:</span>
                    <span>{question.choice_a}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">B:</span>
                    <span>{question.choice_b}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">C:</span>
                    <span>{question.choice_c}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">D:</span>
                    <span>{question.choice_d}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E0F7F1]">
                    <span className="font-semibold text-[#5DDFC3]">
                      正解: {question.correct_answer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-[#3A405A] border-2 border-[#E0F7F1]">
            この章にはまだ問題がありません。
            <br />
            「新規問題を追加」ボタンから問題を作成してください。
          </div>
        )}
      </main>

      {(editingQuestion || isCreating) && (
        <QuestionEditor
          question={editingQuestion || undefined}
          chapterId={parseInt(params.chapterId)}
          onSave={handleSave}
          onCancel={() => {
            setEditingQuestion(null)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}
