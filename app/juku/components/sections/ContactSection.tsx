'use client'

import { useState } from 'react'
import { ContactContent } from '../../types'

interface Props {
  content: ContactContent
  primaryColor: string
  secondaryColor: string
  siteName: string
}

const fieldLabels: Record<string, { label: string; type: string; placeholder: string }> = {
  name: { label: 'お名前', type: 'text', placeholder: '山田 太郎' },
  email: { label: 'メールアドレス', type: 'email', placeholder: 'example@email.com' },
  phone: { label: '電話番号', type: 'tel', placeholder: '090-0000-0000' },
  grade: { label: 'お子様の学年', type: 'select', placeholder: '選択してください' },
  message: { label: 'お問い合わせ内容', type: 'textarea', placeholder: 'ご質問やご要望をお書きください' },
}

const gradeOptions = [
  '小学1年生', '小学2年生', '小学3年生', '小学4年生', '小学5年生', '小学6年生',
  '中学1年生', '中学2年生', '中学3年生',
  '高校1年生', '高校2年生', '高校3年生',
  'その他'
]

export function ContactSection({ content, primaryColor, siteName }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: 実際のフォーム送信処理
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <section className="py-20 px-6 bg-gray-50" id="contact">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            🎉
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            お問い合わせありがとうございます
          </h2>
          <p className="text-gray-600">
            内容を確認次第、担当者よりご連絡いたします。
            <br />
            しばらくお待ちください。
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-6 bg-gray-50" id="contact">
      <div className="max-w-3xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
          <div
            className="w-20 h-1 mx-auto mt-6 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="space-y-6">
            {content.formFields.map((field) => {
              const config = fieldLabels[field]
              if (!config) return null

              return (
                <div key={field}>
                  <label className="block text-gray-700 font-medium mb-2">
                    {config.label}
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  {config.type === 'textarea' ? (
                    <textarea
                      required
                      rows={4}
                      placeholder={config.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-transparent focus:ring-2 transition-all resize-none"
                      style={{ focusRingColor: primaryColor } as any}
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    />
                  ) : config.type === 'select' ? (
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-transparent focus:ring-2 transition-all bg-white"
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    >
                      <option value="">{config.placeholder}</option>
                      {gradeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={config.type}
                      required
                      placeholder={config.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-transparent focus:ring-2 transition-all"
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* プライバシー同意 */}
          <div className="mt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-1 w-5 h-5 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">
                <a href="#" className="underline hover:text-gray-800">プライバシーポリシー</a>
                に同意の上、送信します
              </span>
            </label>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                送信中...
              </span>
            ) : (
              content.submitText
            )}
          </button>

          {/* 補足 */}
          <p className="text-center text-gray-500 text-sm mt-6">
            または、お電話でもお気軽にお問い合わせください
          </p>
        </form>
      </div>
    </section>
  )
}
