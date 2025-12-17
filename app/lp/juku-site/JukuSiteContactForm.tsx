'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

export default function JukuSiteContactForm() {
  const [formData, setFormData] = useState({
    jukuName: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'juku-site-builder-lp',
        }),
      })

      if (!response.ok) {
        throw new Error('送信に失敗しました')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">送信完了</h3>
        <p className="text-sm opacity-70">
          お問い合わせありがとうございます。<br />
          担当者より折り返しご連絡いたします。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            塾名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.jukuName}
            onChange={(e) => setFormData({ ...formData, jukuName: e.target.value })}
            placeholder="例: ○○進学塾"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例: 山田 太郎"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="例: contact@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            電話番号
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="例: 090-1234-5678"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            お問い合わせ内容
          </label>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="ご質問やご要望があればお書きください"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-500 text-white font-bold py-4 px-6 rounded-xl hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            '送信中...'
          ) : (
            <>
              <Send className="w-5 h-5" />
              送信する
            </>
          )}
        </button>
      </div>
    </form>
  )
}
