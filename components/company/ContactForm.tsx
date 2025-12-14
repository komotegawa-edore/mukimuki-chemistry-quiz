'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  })

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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '送信に失敗しました')
      }

      setFormState('success')
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      setFormState('error')
      setErrorMessage(error instanceof Error ? error.message : '送信に失敗しました')
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center">
        <div className="w-16 h-16 bg-[#5DDFC3] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">送信完了</h3>
        <p className="opacity-80 mb-6">
          お問い合わせありがとうございます。<br />
          内容を確認の上、ご連絡いたします。
        </p>
        <button
          onClick={() => setFormState('idle')}
          className="text-[#5DDFC3] font-bold hover:underline"
        >
          新しいお問い合わせを送る
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
      <div className="space-y-5">
        {/* 名前 */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold mb-2">
            お名前 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent transition-all"
            placeholder="山田 太郎"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-2">
            メールアドレス <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent transition-all"
            placeholder="example@email.com"
          />
        </div>

        {/* 会社名（任意） */}
        <div>
          <label htmlFor="company" className="block text-sm font-bold mb-2">
            会社名・団体名
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent transition-all"
            placeholder="株式会社〇〇"
          />
        </div>

        {/* お問い合わせ種別 */}
        <div>
          <label htmlFor="subject" className="block text-sm font-bold mb-2">
            お問い合わせ種別 <span className="text-red-400">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent transition-all"
          >
            <option value="" className="text-gray-800">選択してください</option>
            <option value="サービスについて" className="text-gray-800">サービスについて</option>
            <option value="取材・メディア掲載" className="text-gray-800">取材・メディア掲載</option>
            <option value="提携・協業のご相談" className="text-gray-800">提携・協業のご相談</option>
            <option value="採用について" className="text-gray-800">採用について</option>
            <option value="その他" className="text-gray-800">その他</option>
          </select>
        </div>

        {/* メッセージ */}
        <div>
          <label htmlFor="message" className="block text-sm font-bold mb-2">
            お問い合わせ内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent transition-all resize-none"
            placeholder="お問い合わせ内容をご記入ください"
          />
        </div>

        {/* エラーメッセージ */}
        {formState === 'error' && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={formState === 'loading'}
          className="w-full bg-[#5DDFC3] text-[#3A405A] font-bold py-4 px-8 rounded-xl hover:bg-[#4ECFB3] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {formState === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              送信中...
            </>
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
