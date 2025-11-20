'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuestionEditor from '@/components/QuestionEditor'
import { Question } from '@/lib/types/database'
import { exportChapterTestToPDF, exportChapterWithAnswersToPDF } from '@/lib/utils/pdfExport'

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black">読み込み中...</p>
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:underline mb-2 block"
              >
                ← ダッシュボードに戻る
              </button>
              <h1 className="text-2xl font-bold">{chapterTitle}</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportTestPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                disabled={questions.length === 0}
              >
                テスト用印刷
              </button>
              <button
                onClick={handleExportAnswerPDF}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                disabled={questions.length === 0}
              >
                解答付き印刷
              </button>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                新規問題を追加
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">
                    問題 {index + 1}: {question.question_text}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
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
                  <div className="mt-4 pt-4 border-t">
                    <span className="font-semibold text-green-600">
                      正解: {question.correct_answer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-black">
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
