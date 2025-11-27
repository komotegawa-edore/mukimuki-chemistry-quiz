'use client'

import { useEffect, useState } from 'react'
import { UserX, Check, X, Search } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
}

export default function RankingExclusionPanel() {
  const [students, setStudents] = useState<Student[]>([])
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/settings/ranking-exclusion')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        setExcludedIds(data.excludedIds || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExclusion = (userId: string) => {
    setExcludedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const saveExclusions = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch('/api/settings/ranking-exclusion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludedIds })
      })
      if (response.ok) {
        setMessage({ type: 'success', text: '保存しました' })
      } else {
        setMessage({ type: 'error', text: '保存に失敗しました' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存に失敗しました' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <UserX className="w-5 h-5 text-red-500" />
        ランキング除外設定
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        チェックを入れたユーザーは生徒向けランキングに表示されません。
        開発者やテストアカウントの除外にご利用ください。
      </p>

      {/* 検索 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="名前またはメールで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* ユーザーリスト */}
      <div className="max-h-64 overflow-y-auto border rounded-lg mb-4">
        {filteredStudents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            ユーザーが見つかりません
          </div>
        ) : (
          <ul className="divide-y">
            {filteredStudents.map(student => (
              <li
                key={student.id}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${
                  excludedIds.includes(student.id) ? 'bg-red-50' : ''
                }`}
                onClick={() => toggleExclusion(student.id)}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  excludedIds.includes(student.id)
                    ? 'bg-red-500 border-red-500'
                    : 'border-gray-300'
                }`}>
                  {excludedIds.includes(student.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 除外中のユーザー数 */}
      <p className="text-sm text-gray-600 mb-4">
        現在 <span className="font-bold text-red-600">{excludedIds.length}</span> 名が除外されています
      </p>

      {/* 保存ボタン */}
      <div className="flex items-center gap-4">
        <button
          onClick={saveExclusions}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '設定を保存'}
        </button>

        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  )
}
