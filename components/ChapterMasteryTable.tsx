'use client'

import { useEffect, useState } from 'react'

interface StudentResult {
  totalCorrect: number
  totalQuestions: number
  percentage: number
  attempts: number
}

interface ChapterMasteryData {
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
  chapters: ChapterMasteryData[]
  students: Student[]
}

export default function ChapterMasteryTable() {
  const [data, setData] = useState<MasteryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<number | 'all'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/chapter-mastery')
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
  const filteredChapters =
    selectedSubject === 'all'
      ? data.chapters
      : data.chapters.filter((ch) => ch.subjectId === selectedSubject)

  // 教科の一覧を取得（重複排除）
  const subjects = Array.from(
    new Map(
      data.chapters.map((ch) => [
        ch.subjectId,
        {
          id: ch.subjectId,
          name: ch.subjectName,
          displayOrder: ch.subjectDisplayOrder,
        },
      ])
    ).values()
  ).sort((a, b) => a.displayOrder - b.displayOrder)

  const getPercentageColor = (percentage: number, attempts: number) => {
    if (attempts === 0) return 'bg-gray-100 text-gray-400'
    if (percentage >= 80) return 'bg-green-100 text-green-700'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-4">
      {/* 教科選択フィルター */}
      <div className="flex items-center gap-4">
        <label htmlFor="subject-filter" className="font-semibold text-black">
          教科でフィルター:
        </label>
        <select
          id="subject-filter"
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(
              e.target.value === 'all' ? 'all' : parseInt(e.target.value)
            )
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
        >
          <option value="all">すべての教科</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-black border-r border-gray-200 sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                生徒名
              </th>
              {filteredChapters.map((chapter) => (
                <th
                  key={chapter.chapterId}
                  className="px-3 py-3 text-center font-semibold text-black border-l border-gray-200 min-w-[100px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">第{chapter.chapterOrderNum}章</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.students.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + filteredChapters.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  生徒がいません
                </td>
              </tr>
            ) : (
              data.students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-200 sticky left-0 bg-white font-medium">
                    {student.name}
                  </td>
                  {filteredChapters.map((chapter) => {
                    const result = chapter.studentResults[student.id]
                    return (
                      <td
                        key={chapter.chapterId}
                        className="px-3 py-3 text-center border-l border-gray-200"
                      >
                        {result.attempts > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getPercentageColor(
                                result.percentage,
                                result.attempts
                              )}`}
                            >
                              {result.percentage}%
                            </span>
                            <span className="text-xs text-gray-500">
                              {result.totalCorrect}/{result.totalQuestions}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({result.attempts}回)
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

      <div className="text-sm text-gray-600">
        <p>※ 複数回受験している場合、全受験回数の合計正答率を表示しています。</p>
        <p>※ 横にスクロールして全ての章を確認できます。</p>
      </div>
    </div>
  )
}
