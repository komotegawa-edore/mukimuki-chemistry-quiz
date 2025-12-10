'use client'

import { useState } from 'react'
import { Users, TrendingUp, Brain, Search, ChevronDown, ChevronUp } from 'lucide-react'

interface User {
  id: string
  name: string | null
  nickname: string | null
  created_at: string
  referrer_source: string | null
  referrer_detail: string | null
  role: string
}

interface UserAnalyticsViewProps {
  users: User[]
  sourceCounts: Record<string, number>
  mbtiConversions: number
}

const SOURCE_LABELS: Record<string, string> = {
  mbti: 'MBTI診断',
  line: 'LINE',
  direct: '直接アクセス',
  organic: '検索流入',
  unknown: '不明',
}

export default function UserAnalyticsView({
  users,
  sourceCounts,
  mbtiConversions,
}: UserAnalyticsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'unknown' && !user.referrer_source) ||
        user.referrer_source === sourceFilter
      return matchesSearch && matchesSource
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

  const totalUsers = users.length

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E0F7F1]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#3A405A] opacity-70">総ユーザー数</span>
          </div>
          <p className="text-3xl font-bold text-[#3A405A]">{totalUsers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E0F7F1]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#3A405A] opacity-70">MBTI経由登録</span>
          </div>
          <p className="text-3xl font-bold text-[#3A405A]">{mbtiConversions}</p>
          <p className="text-sm text-[#3A405A] opacity-50 mt-1">
            {totalUsers > 0
              ? `全体の${Math.round((mbtiConversions / totalUsers) * 100)}%`
              : '-'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E0F7F1]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#3A405A] opacity-70">流入元の数</span>
          </div>
          <p className="text-3xl font-bold text-[#3A405A]">
            {Object.keys(sourceCounts).length}
          </p>
        </div>
      </div>

      {/* 流入元別内訳 */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E0F7F1]">
        <h2 className="text-lg font-bold text-[#3A405A] mb-4">流入元別内訳</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(sourceCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([source, count]) => (
              <div
                key={source}
                className="bg-[#F4F9F7] rounded-lg p-4 text-center cursor-pointer hover:bg-[#E0F7F1] transition-colors"
                onClick={() => setSourceFilter(source)}
              >
                <p className="text-2xl font-bold text-[#3A405A]">{count}</p>
                <p className="text-sm text-[#3A405A] opacity-70">
                  {SOURCE_LABELS[source] || source}
                </p>
                <p className="text-xs text-[#3A405A] opacity-50">
                  {Math.round((count / totalUsers) * 100)}%
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-[#E0F7F1]">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A405A] opacity-50" />
              <input
                type="text"
                placeholder="名前で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#E0F7F1] rounded-lg focus:outline-none focus:border-[#5DDFC3] text-[#3A405A]"
              />
            </div>
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 border-2 border-[#E0F7F1] rounded-lg focus:outline-none focus:border-[#5DDFC3] text-[#3A405A]"
          >
            <option value="all">すべての流入元</option>
            {Object.entries(sourceCounts).map(([source]) => (
              <option key={source} value={source}>
                {SOURCE_LABELS[source] || source}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-4 py-2 border-2 border-[#E0F7F1] rounded-lg hover:bg-[#F4F9F7] transition-colors text-[#3A405A]"
          >
            {sortOrder === 'desc' ? (
              <>
                <ChevronDown className="w-4 h-4" />
                新しい順
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4" />
                古い順
              </>
            )}
          </button>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-xl shadow-md border-2 border-[#E0F7F1] overflow-hidden">
        <div className="p-4 border-b border-[#E0F7F1]">
          <h2 className="text-lg font-bold text-[#3A405A]">
            ユーザー一覧（{filteredUsers.length}件）
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F4F9F7]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#3A405A]">
                  名前
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#3A405A]">
                  流入元
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#3A405A]">
                  詳細
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#3A405A]">
                  登録日
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#E0F7F1] hover:bg-[#F4F9F7]"
                >
                  <td className="px-4 py-3 text-[#3A405A]">
                    {user.nickname || user.name || '未設定'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.referrer_source === 'mbti'
                          ? 'bg-pink-100 text-pink-700'
                          : user.referrer_source === 'line'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {SOURCE_LABELS[user.referrer_source || 'unknown'] ||
                        user.referrer_source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#3A405A] opacity-70 text-sm">
                    {user.referrer_detail || '-'}
                  </td>
                  <td className="px-4 py-3 text-[#3A405A] opacity-70 text-sm">
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-[#3A405A] opacity-50"
                  >
                    該当するユーザーがいません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
