'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Submission {
  id: string
  site_id: string
  name: string
  email: string | null
  phone: string | null
  grade: string | null
  message: string | null
  created_at: string
  status: string | null
}

interface Site {
  id: string
  name: string
  slug: string
}

interface Props {
  submissions: Submission[]
  sites: Site[]
}

export default function JukuLeadsTable({ submissions: initialSubmissions, sites }: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const getSiteName = (siteId: string) => {
    return sites.find(s => s.id === siteId)?.name || '不明'
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'contacted':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">連絡済み</span>
      case 'converted':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">成約</span>
      case 'lost':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">失注</span>
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">新規</span>
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('juku_contact_submissions')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setSubmissions(prev => prev.map(s =>
        s.id === id ? { ...s, status: newStatus } : s
      ))

      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch {
      alert('ステータスの更新に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">サイト</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">連絡先</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">学年</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ステータス</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">受信日時</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissions.map(submission => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800">
                  {getSiteName(submission.site_id)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-800">{submission.name}</span>
                </td>
                <td className="px-4 py-3">
                  {submission.email && (
                    <a href={`mailto:${submission.email}`} className="text-sm text-blue-600 hover:underline block">
                      {submission.email}
                    </a>
                  )}
                  {submission.phone && (
                    <a href={`tel:${submission.phone}`} className="text-sm text-gray-600 block">
                      {submission.phone}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {submission.grade || '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(submission.status)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(submission.created_at).toLocaleString('ja-JP')}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  まだお問い合わせがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 詳細モーダル */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">リード詳細</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">サイト</p>
                <p className="font-medium text-gray-800">{getSiteName(selectedSubmission.site_id)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">名前</p>
                <p className="font-medium text-gray-800">{selectedSubmission.name}</p>
              </div>
              {selectedSubmission.email && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">メールアドレス</p>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:underline">
                    {selectedSubmission.email}
                  </a>
                </div>
              )}
              {selectedSubmission.phone && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">電話番号</p>
                  <a href={`tel:${selectedSubmission.phone}`} className="text-blue-600 hover:underline">
                    {selectedSubmission.phone}
                  </a>
                </div>
              )}
              {selectedSubmission.grade && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">学年</p>
                  <p className="text-gray-800">{selectedSubmission.grade}</p>
                </div>
              )}
              {selectedSubmission.message && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">メッセージ</p>
                  <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 text-sm">
                    {selectedSubmission.message}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">受信日時</p>
                <p className="text-gray-800">{new Date(selectedSubmission.created_at).toLocaleString('ja-JP')}</p>
              </div>

              {/* ステータス変更 */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">ステータスを変更</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'new')}
                    disabled={updating}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      (!selectedSubmission.status || selectedSubmission.status === 'new')
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    新規
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'contacted')}
                    disabled={updating}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedSubmission.status === 'contacted'
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    連絡済み
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'converted')}
                    disabled={updating}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedSubmission.status === 'converted'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    成約
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'lost')}
                    disabled={updating}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedSubmission.status === 'lost'
                        ? 'bg-gray-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    失注
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
