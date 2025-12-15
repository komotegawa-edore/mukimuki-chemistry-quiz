'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react'

type FormState = 'idle' | 'loading' | 'success' | 'error'
type InquiryType = 'trial' | 'document'

type Props = {
  initialType?: InquiryType
}

export default function ManabeeContactForm({ initialType = 'trial' }: Props) {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [inquiryType, setInquiryType] = useState<InquiryType>(initialType)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    studentCount: '',
    message: '',
  })

  useEffect(() => {
    setInquiryType(initialType)
  }, [initialType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setErrorMessage('')

    try {
      const subjectText = inquiryType === 'document' ? 'MANABEE 資料請求' : 'MANABEE 無料体験申込'
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subject: subjectText,
          message: `【お問い合わせ種別】${inquiryType === 'document' ? '資料請求' : '無料体験申込'}\n【塾名・教室名】${formData.company}\n【電話番号】${formData.phone}\n【生徒数】${formData.studentCount}\n\n${formData.message}`,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '送信に失敗しました')
      }

      setFormState('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        studentCount: '',
        message: '',
      })
    } catch (error) {
      setFormState('error')
      setErrorMessage(error instanceof Error ? error.message : '送信に失敗しました')
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-[#3A405A]">
          {inquiryType === 'document' ? '資料請求完了' : '送信完了'}
        </h3>
        <p className="opacity-70 mb-6 text-[#3A405A]">
          お問い合わせありがとうございます。<br />
          担当者より2営業日以内にご連絡いたします。
        </p>

        {inquiryType === 'document' && (
          <a
            href="/manabee-document.pdf"
            download
            className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold py-3 px-8 rounded-full hover:bg-amber-600 transition-colors mb-4"
          >
            <Download className="w-5 h-5" />
            資料をダウンロード
          </a>
        )}

        <div className="mt-4">
          <button
            onClick={() => setFormState('idle')}
            className="text-amber-600 font-bold hover:underline"
          >
            新しいお問い合わせを送る
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-lg">
      <div className="space-y-5">
        {/* お問い合わせ種別 */}
        <div>
          <label className="block text-sm font-bold mb-2 text-[#3A405A]">
            お問い合わせ種別 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${inquiryType === 'trial' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}>
              <input
                type="radio"
                name="inquiryType"
                value="trial"
                checked={inquiryType === 'trial'}
                onChange={() => setInquiryType('trial')}
                className="sr-only"
              />
              <span className={`font-bold ${inquiryType === 'trial' ? 'text-amber-600' : 'text-gray-600'}`}>
                無料体験申込
              </span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${inquiryType === 'document' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}>
              <input
                type="radio"
                name="inquiryType"
                value="document"
                checked={inquiryType === 'document'}
                onChange={() => setInquiryType('document')}
                className="sr-only"
              />
              <span className={`font-bold ${inquiryType === 'document' ? 'text-amber-600' : 'text-gray-600'}`}>
                資料ダウンロード
              </span>
            </label>
          </div>
        </div>

        {/* 名前 */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold mb-2 text-[#3A405A]">
            ご担当者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-[#3A405A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            placeholder="山田 太郎"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-2 text-[#3A405A]">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-[#3A405A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            placeholder="example@email.com"
          />
        </div>

        {/* 電話番号 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-bold mb-2 text-[#3A405A]">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-[#3A405A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            placeholder="090-1234-5678"
          />
        </div>

        {/* 塾名・教室名 */}
        <div>
          <label htmlFor="company" className="block text-sm font-bold mb-2 text-[#3A405A]">
            塾名・教室名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-[#3A405A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            placeholder="〇〇塾 △△教室"
          />
        </div>

        {/* 生徒数 */}
        <div>
          <label htmlFor="studentCount" className="block text-sm font-bold mb-2 text-[#3A405A]">
            生徒数（おおよそ） <span className="text-red-500">*</span>
          </label>
          <select
            id="studentCount"
            name="studentCount"
            required
            value={formData.studentCount}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-[#3A405A] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="">選択してください</option>
            <option value="1〜10名">1〜10名</option>
            <option value="11〜30名">11〜30名</option>
            <option value="31〜50名">31〜50名</option>
            <option value="51〜100名">51〜100名</option>
            <option value="101名以上">101名以上</option>
          </select>
        </div>

        {/* メッセージ */}
        <div>
          <label htmlFor="message" className="block text-sm font-bold mb-2 text-[#3A405A]">
            ご質問・ご要望など
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-[#3A405A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
            placeholder="導入時期のご希望や、ご質問などがあればご記入ください"
          />
        </div>

        {/* エラーメッセージ */}
        {formState === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={formState === 'loading'}
          className="w-full bg-amber-500 text-white font-bold py-4 px-8 rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {formState === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              送信中...
            </>
          ) : inquiryType === 'document' ? (
            <>
              <Download className="w-5 h-5" />
              資料をダウンロード
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              無料体験を申し込む
            </>
          )}
        </button>

        <p className="text-xs text-center opacity-60 text-[#3A405A]">
          {inquiryType === 'document'
            ? '送信後、資料のダウンロードが可能になります'
            : '送信後、2営業日以内に担当者よりご連絡いたします'
          }
        </p>
      </div>
    </form>
  )
}
