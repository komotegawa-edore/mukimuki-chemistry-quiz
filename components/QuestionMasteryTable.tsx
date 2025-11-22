'use client'

import { useEffect, useState } from 'react'

interface StudentResult {
  correct: number
  total: number
  percentage: number
}

interface QuestionMasteryData {
  questionId: number
  questionText: string
  chapterId: number
  chapterTitle: string
  chapterOrderNum: number
  subjectId: number
  subjectName: string
  subjectDisplayOrder: number
  studentResults: Record<string, StudentResult>
}

interface Student {
  id: string
  name: string
}

interface MasteryResponse {
  questions: QuestionMasteryData[]
  students: Student[]
}

export default function QuestionMasteryTable() {
  const [data, setData] = useState<MasteryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<number | 'all'>('all')
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/question-mastery')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError('データの読み込みに失敗しました')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'データが取得できませんでした'}</p>
      </div>
    )
  }

  // 教科でフィルタリング
  let filteredBySubject = data.questions
  if (selectedSubject !== 'all') {
    filteredBySubject = data.questions.filter((q) => q.subjectId === selectedSubject)
  }

  // 章でさらにフィルタリング
  const filteredQuestions =
    selectedChapter === 'all'
      ? filteredBySubject
      : filteredBySubject.filter((q) => q.chapterId === selectedChapter)

  // 教科の一覧を取得（重複排除）
  const subjects = Array.from(
    new Map(
      data.questions.map((q) => [
        q.subjectId,
        {
          id: q.subjectId,
          name: q.subjectName,
          displayOrder: q.subjectDisplayOrder,
        },
      ])
    ).values()
  ).sort((a, b) => a.displayOrder - b.displayOrder)

  // 章の一覧を取得（選択された教科でフィルタリング）
  const chaptersToShow = selectedSubject === 'all' ? data.questions : filteredBySubject
  const chapters = Array.from(
    new Map(
      chaptersToShow.map((q) => [
        q.chapterId,
        {
          id: q.chapterId,
          title: q.chapterTitle,
          orderNum: q.chapterOrderNum,
        },
      ])
    ).values()
  ).sort((a, b) => a.orderNum - b.orderNum)

  const getPercentageColor = (percentage: number, total: number) => {
    if (total === 0) return 'bg-gray-100 text-gray-400'
    if (percentage >= 80) return 'bg-green-100 text-green-700'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="subject-filter" className="font-semibold text-black">
            教科:
          </label>
          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(
                e.target.value === 'all' ? 'all' : parseInt(e.target.value)
              )
              setSelectedChapter('all') // 教科を変更したら章フィルタをリセット
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
          >
            <option value="all">すべて</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="chapter-filter" className="font-semibold text-black">
            章:
          </label>
          <select
            id="chapter-filter"
            value={selectedChapter}
            onChange={(e) =>
              setSelectedChapter(
                e.target.value === 'all' ? 'all' : parseInt(e.target.value)
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
          >
            <option value="all">すべて</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-black border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                章
              </th>
              <th className="px-4 py-3 text-left font-semibold text-black border-r border-gray-200 min-w-[300px]">
                問題
              </th>
              {data.students.map((student) => (
                <th
                  key={student.id}
                  className="px-3 py-3 text-center font-semibold text-black border-l border-gray-200 min-w-[100px]"
                >
                  {student.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredQuestions.length === 0 ? (
              <tr>
                <td
                  colSpan={2 + data.students.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  該当する問題がありません
                </td>
              </tr>
            ) : (
              filteredQuestions.map((question) => (
                <tr key={question.questionId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-200 sticky left-0 bg-white font-medium whitespace-nowrap">
                    第{question.chapterOrderNum}章
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-200">
                    <div className="line-clamp-2" title={question.questionText}>
                      {question.questionText}
                    </div>
                  </td>
                  {data.students.map((student) => {
                    const result = question.studentResults[student.id]
                    return (
                      <td
                        key={student.id}
                        className="px-3 py-3 text-center border-l border-gray-200"
                      >
                        {result.total > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getPercentageColor(
                                result.percentage,
                                result.total
                              )}`}
                            >
                              {result.percentage}%
                            </span>
                            <span className="text-xs text-gray-500">
                              {result.correct}/{result.total}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">未受験</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-black font-semibold">凡例:</span>
        <div className="flex items-center gap-2">
          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
            80%以上
          </span>
          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
            60-79%
          </span>
          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
            60%未満
          </span>
          <span className="text-gray-400 text-xs">未受験</span>
        </div>
      </div>
    </div>
  )
}
