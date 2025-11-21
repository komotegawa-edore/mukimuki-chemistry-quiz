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

  const getPercentageColor = (percentage: number, attempts: number) => {
    if (attempts === 0) return 'bg-gray-100 text-gray-400'
    if (percentage >= 80) return 'bg-green-100 text-green-700'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-4">
      {/* テーブル */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-black border-r border-gray-200 sticky left-0 bg-gray-50 z-10 min-w-[80px]">
                章番号
              </th>
              <th className="px-4 py-3 text-left font-semibold text-black border-r border-gray-200 min-w-[250px]">
                章タイトル
              </th>
              {data.students.map((student) => (
                <th
                  key={student.id}
                  className="px-3 py-3 text-center font-semibold text-black border-l border-gray-200 min-w-[120px]"
                >
                  {student.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.chapters.length === 0 ? (
              <tr>
                <td
                  colSpan={2 + data.students.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  章がありません
                </td>
              </tr>
            ) : (
              data.chapters.map((chapter) => (
                <tr key={chapter.chapterId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-200 sticky left-0 bg-white font-medium text-center">
                    第{chapter.chapterOrderNum}章
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-200 font-medium">
                    {chapter.chapterTitle}
                  </td>
                  {data.students.map((student) => {
                    const result = chapter.studentResults[student.id]
                    return (
                      <td
                        key={student.id}
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
      </div>
    </div>
  )
}
