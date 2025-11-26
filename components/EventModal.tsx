'use client'

import { useEffect, useState } from 'react'
import { X, Trophy, Gift, Calendar } from 'lucide-react'

interface Announcement {
  id: number
  title: string
  content: string
  priority: string
  display_type: string
  valid_until: string | null
}

export default function EventModal() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchModalAnnouncement()
  }, [])

  const fetchModalAnnouncement = async () => {
    try {
      const response = await fetch('/api/announcements?display_type=modal')
      if (response.ok) {
        const data = await response.json()
        if (data.announcements && data.announcements.length > 0) {
          // 未読のモーダルお知らせがあれば表示
          const unread = data.announcements.find((a: Announcement & { is_read?: boolean }) => !a.is_read)
          if (unread) {
            setAnnouncement(unread)
            setIsOpen(true)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch modal announcement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async () => {
    if (!announcement) return

    try {
      await fetch('/api/announcements/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcement_id: announcement.id }),
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleClose = () => {
    markAsRead()
    setIsOpen(false)
  }

  if (isLoading || !isOpen || !announcement) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* モーダル */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* ヘッダー背景 */}
        <div className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6B6B] p-6 text-white relative overflow-hidden">
          {/* 装飾 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* アイコン */}
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-4 rounded-full">
              <Trophy className="w-10 h-10" />
            </div>
          </div>

          {/* タイトル */}
          <h2 className="text-2xl font-bold text-center">
            {announcement.title}
          </h2>

          {/* 期限 */}
          {announcement.valid_until && (
            <div className="flex items-center justify-center gap-2 mt-2 text-white/90 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(announcement.valid_until).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                まで
              </span>
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <div
            className="prose prose-sm max-w-none text-[#3A405A]"
            dangerouslySetInnerHTML={{ __html: formatContent(announcement.content) }}
          />
        </div>

        {/* フッター */}
        <div className="p-4 bg-gray-50 border-t">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            参加する！
          </button>
        </div>
      </div>
    </div>
  )
}

// コンテンツをHTMLに変換
function formatContent(content: string): string {
  // テーブル記法を検出してHTMLテーブルに変換
  const lines = content.split('\n')
  let html = ''
  let inTable = false
  let tableRows: string[] = []

  for (const line of lines) {
    // テーブル行の検出（|で区切られている）
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true
        tableRows = []
      }
      tableRows.push(line)
    } else {
      // テーブル終了
      if (inTable) {
        html += convertTableToHtml(tableRows)
        inTable = false
        tableRows = []
      }
      // 通常の行
      if (line.trim()) {
        html += `<p>${escapeHtml(line)}</p>`
      }
    }
  }

  // 最後にテーブルが残っている場合
  if (inTable) {
    html += convertTableToHtml(tableRows)
  }

  return html
}

function convertTableToHtml(rows: string[]): string {
  if (rows.length < 2) return ''

  let html = '<table class="w-full border-collapse my-4 text-sm">'

  rows.forEach((row, index) => {
    // 区切り行（---）をスキップ
    if (row.includes('---')) return

    const cells = row.split('|').filter(cell => cell.trim() !== '')
    const isHeader = index === 0
    const tag = isHeader ? 'th' : 'td'
    const cellClass = isHeader
      ? 'bg-gray-100 font-bold text-left p-2 border border-gray-200'
      : 'p-2 border border-gray-200'

    html += '<tr>'
    cells.forEach(cell => {
      html += `<${tag} class="${cellClass}">${escapeHtml(cell.trim())}</${tag}>`
    })
    html += '</tr>'
  })

  html += '</table>'
  return html
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
