'use client'

import { useState } from 'react'
import { LPContactContent } from '@/app/juku/types'
import { Send, CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  content: LPContactContent
  primaryColor: string
  accentColor: string
  lpId: string
}

const fieldLabels: Record<string, string> = {
  name: 'お名前',
  email: 'メールアドレス',
  phone: '電話番号',
  grade: '学年',
  course: 'ご希望のコース',
  message: 'ご質問・ご要望',
}

const gradeOptions = [
  '小学1年生',
  '小学2年生',
  '小学3年生',
  '小学4年生',
  '小学5年生',
  '小学6年生',
  '中学1年生',
  '中学2年生',
  '中学3年生',
  '高校1年生',
  '高校2年生',
  '高校3年生',
  'その他',
]

export function LPContactSection({ content, primaryColor, accentColor, lpId }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/lp/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lp_id: lpId,
          ...formData,
        }),
      })

      if (!res.ok) {
        throw new Error('送信に失敗しました')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section id="contact" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: `${accentColor}20` }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: accentColor }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            お申し込みありがとうございます
          </h2>
          <p className="text-gray-600">{content.successMessage}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-lg mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: primaryColor }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600">{content.subtitle}</p>
          )}
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="space-y-5">
            {content.formFields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {fieldLabels[field]}
                  {field !== 'message' && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field === 'grade' ? (
                  <select
                    required
                    value={formData[field] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ focusRing: primaryColor } as React.CSSProperties}
                  >
                    <option value="">選択してください</option>
                    {gradeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field === 'course' && content.courseOptions ? (
                  <select
                    required
                    value={formData[field] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {content.courseOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field === 'message' ? (
                  <textarea
                    rows={4}
                    value={formData[field] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
                  />
                ) : (
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    required
                    value={formData[field] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder={
                      field === 'email'
                        ? 'example@email.com'
                        : field === 'phone'
                        ? '090-0000-0000'
                        : ''
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: primaryColor }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {content.submitText}
              </>
            )}
          </button>

          {/* プライバシー */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            送信いただいた情報は、お問い合わせ対応のみに使用いたします。
          </p>
        </form>
      </div>
    </section>
  )
}
