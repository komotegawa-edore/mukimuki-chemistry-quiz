'use client'

import { useState } from 'react'
import Papa from 'papaparse'

interface CSVRow {
  chapter_id: string
  question_text: string
  choice_a: string
  choice_b: string
  choice_c: string
  choice_d: string
  correct_answer: string
  explanation?: string
}

interface ImportResult {
  success: number
  errors: Array<{ row: number; error: string }>
}

export default function CSVImport() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CSVRow[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)
    setError(null)

    // プレビュー用にCSVを読み込む
    const reader = new FileReader()
    reader.onload = (event) => {
      const csvText = event.target?.result as string
      const parseResult = Papa.parse<CSVRow>(csvText, {
        header: true,
        delimiter: ',',
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      })

      if (parseResult.errors.length > 0) {
        setError('CSV解析エラー: ' + parseResult.errors[0].message)
        setPreview([])
        return
      }

      // 最初の5行をプレビュー
      setPreview(parseResult.data.slice(0, 5))
    }
    reader.readAsText(selectedFile)
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    setError(null)
    setResult(null)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const csvText = event.target?.result as string

        const response = await fetch('/api/questions/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ csvText }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'インポートに失敗しました')
          setIsImporting(false)
          return
        }

        setResult(data)
        setIsImporting(false)

        // 成功した場合はフォームをリセット
        if (data.errors.length === 0) {
          setFile(null)
          setPreview([])
        }
      }
      reader.readAsText(file)
    } catch (err) {
      setError('インポート処理中にエラーが発生しました')
      setIsImporting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#E0F7F1]">
      <h3 className="text-lg font-semibold mb-4 text-[#3A405A]">CSV一括インポート</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-[#3A405A] mb-2">
          CSVファイルを選択
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-[#3A405A] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E0F7F1] file:text-[#5DDFC3] hover:file:bg-[#5DDFC3] hover:file:text-white transition-colors"
        />
        <p className="text-xs text-[#3A405A] opacity-70 mt-1">
          形式: UTF-8, カンマ区切り |{' '}
          <a
            href="/sample_questions.csv"
            download
            className="text-[#5DDFC3] hover:underline font-medium"
          >
            サンプルをダウンロード
          </a>
        </p>
      </div>

      {preview.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-[#3A405A]">プレビュー（最初の5行）</h4>
          <div className="overflow-x-auto border-2 border-[#E0F7F1] rounded-lg">
            <table className="min-w-full text-xs text-[#3A405A]">
              <thead className="bg-[#F4F9F7]">
                <tr>
                  <th className="px-2 py-2 text-left text-[#3A405A]">章ID</th>
                  <th className="px-2 py-2 text-left text-[#3A405A]">問題文</th>
                  <th className="px-2 py-2 text-left text-[#3A405A]">選択肢A</th>
                  <th className="px-2 py-2 text-left text-[#3A405A]">選択肢B</th>
                  <th className="px-2 py-2 text-left text-[#3A405A]">選択肢C</th>
                  <th className="px-2 py-2 text-left text-[#3A405A]">選択肢D</th>
                  <th className="px-2 py-2 text-left text-[#3A405A]">正解</th>
                  <th className="px-2 py-2 text-left text-[#3A405A]">解説</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0F7F1]">
                {preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F4F9F7] transition-colors">
                    <td className="px-2 py-2">{row.chapter_id}</td>
                    <td className="px-2 py-2 max-w-xs truncate">{row.question_text}</td>
                    <td className="px-2 py-2 max-w-xs truncate">{row.choice_a}</td>
                    <td className="px-2 py-2 max-w-xs truncate">{row.choice_b}</td>
                    <td className="px-2 py-2 max-w-xs truncate">{row.choice_c}</td>
                    <td className="px-2 py-2 max-w-xs truncate">{row.choice_d}</td>
                    <td className="px-2 py-2">{row.correct_answer}</td>
                    <td className="px-2 py-2 max-w-xs truncate">{row.explanation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-4">
          {result.success > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-2">
              {result.success}件の問題をインポートしました
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              <p className="font-semibold mb-2">
                {result.errors.length}件のエラーがありました：
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs max-h-40 overflow-y-auto">
                {result.errors.map((err, idx) => (
                  <li key={idx}>
                    {err.row}行目: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleImport}
          disabled={!file || isImporting}
          className="px-4 py-2 bg-[#5DDFC3] text-white rounded-lg font-semibold hover:bg-[#4ECFB3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isImporting ? 'インポート中...' : 'インポート'}
        </button>
        {file && (
          <button
            onClick={() => {
              setFile(null)
              setPreview([])
              setResult(null)
              setError(null)
            }}
            disabled={isImporting}
            className="px-4 py-2 bg-gray-200 text-[#3A405A] rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
    </div>
  )
}
