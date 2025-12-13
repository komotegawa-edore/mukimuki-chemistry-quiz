'use client'

import { useState } from 'react'
import { MessageSquarePlus, Send, X, Check } from 'lucide-react'

export default function EnglishRequestForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [requestText, setRequestText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestText.trim() || sending) return

    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/english/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestText: requestText.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send request')
      }

      setSent(true)
      setRequestText('')
      setTimeout(() => {
        setIsOpen(false)
        setSent(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors w-full"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="font-medium">こんな記事が読みたい！をリクエスト</span>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-blue-600" />
          記事リクエスト
        </h3>
        <button
          onClick={() => {
            setIsOpen(false)
            setError('')
            setSent(false)
          }}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {sent ? (
        <div className="flex items-center gap-2 text-green-600 py-4 justify-center">
          <Check className="w-5 h-5" />
          <span className="font-medium">リクエストを送信しました！</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            placeholder="例: AI関連のニュースをもっと読みたい、スポーツの話題を増やしてほしい..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {requestText.length}/500
            </span>
            <button
              type="submit"
              disabled={!requestText.trim() || sending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              {sending ? '送信中...' : '送信'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </form>
      )}
    </div>
  )
}
