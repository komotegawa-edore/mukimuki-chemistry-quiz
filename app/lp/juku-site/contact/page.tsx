'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Phone, Mail, Building2, User, MessageSquare,
  FileText, CheckCircle, ArrowRight, Download
} from 'lucide-react'

type InquiryType = 'consultation' | 'document' | 'both'
type HPStatus = 'none' | 'old' | 'want_renewal' | 'other'

export default function JukuSiteContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jukuName: '',
    currentHpStatus: '' as HPStatus | '',
    inquiryType: 'both' as InquiryType,
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('juku_leads')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          juku_name: formData.jukuName || null,
          current_hp_status: formData.currentHpStatus || null,
          inquiry_type: formData.inquiryType,
          message: formData.message || null,
          document_downloaded: formData.inquiryType === 'document' || formData.inquiryType === 'both'
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        setError('送信に失敗しました。もう一度お試しください。')
        setIsSubmitting(false)
        return
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('Submit error:', err)
      setError('送信に失敗しました。もう一度お試しください。')
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // 送信完了画面
  if (isSubmitted) {
    const showDownload = formData.inquiryType === 'document' || formData.inquiryType === 'both'

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* ヘッダー */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/lp/juku-site">
              <Image
                src="/images/jukuba-logo.png"
                alt="JUKUBA"
                width={160}
                height={45}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </header>

        <main className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                お問い合わせありがとうございます
              </h1>

              <p className="text-gray-600 mb-8">
                {formData.name} 様<br />
                お問い合わせを受け付けました。<br />
                担当者より2営業日以内にご連絡いたします。
              </p>

              {showDownload && (
                <div className="bg-indigo-50 rounded-xl p-6 mb-8">
                  <h2 className="font-bold text-indigo-900 mb-4 flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    資料ダウンロード
                  </h2>
                  <p className="text-sm text-indigo-700 mb-4">
                    JUKUBAのサービス資料をダウンロードできます
                  </p>
                  <a
                    href="/documents/jukuba-guide.pdf"
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    資料をダウンロード
                  </a>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">今後の流れ</h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    担当者より連絡
                  </span>
                  <ArrowRight className="w-4 h-4 hidden md:block text-gray-400" />
                  <span className="flex items-center gap-1">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    無料相談・ヒアリング
                  </span>
                  <ArrowRight className="w-4 h-4 hidden md:block text-gray-400" />
                  <span className="flex items-center gap-1">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    お見積り
                  </span>
                </div>
              </div>

              <Link
                href="/lp/juku-site"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                トップページに戻る
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/lp/juku-site">
            <Image
              src="/images/jukuba-logo.png"
              alt="JUKUBA"
              width={160}
              height={45}
              className="h-10 w-auto"
            />
          </Link>
          <Link
            href="/lp/juku-site"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            トップに戻る
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              無料相談・資料請求
            </h1>
            <p className="text-gray-600">
              JUKUBAについてのご質問や資料請求はこちらから<br />
              お気軽にお問い合わせください
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* サイドバー */}
            <div className="md:col-span-1 space-y-6">
              {/* 特典 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">資料請求で届くもの</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>JUKUBAサービス資料（PDF）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>料金プラン詳細</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>テンプレート一覧</span>
                  </li>
                </ul>
              </div>

              {/* 返信について */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-4">メールでご返信</h3>
                <p className="text-sm text-indigo-100 mb-3">
                  2営業日以内に担当者よりメールにてご連絡いたします。
                </p>
                <p className="text-sm text-indigo-100">
                  お急ぎの場合はその旨をメッセージ欄にご記載ください。
                </p>
              </div>
            </div>

            {/* フォーム */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
                <div className="space-y-6">
                  {/* お問い合わせ種類 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      お問い合わせ種類 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: 'consultation', label: '無料相談', icon: MessageSquare },
                        { value: 'document', label: '資料請求', icon: FileText },
                        { value: 'both', label: '両方', icon: CheckCircle }
                      ].map(({ value, label, icon: Icon }) => (
                        <label
                          key={value}
                          className={`flex items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.inquiryType === value
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="inquiryType"
                            value={value}
                            checked={formData.inquiryType === value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <Icon className={`w-5 h-5 ${
                            formData.inquiryType === value ? 'text-indigo-600' : 'text-gray-400'
                          }`} />
                          <span className={`font-medium ${
                            formData.inquiryType === value ? 'text-indigo-900' : 'text-gray-700'
                          }`}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* お名前 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="山田 太郎"
                    />
                  </div>

                  {/* メールアドレス */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* 電話番号 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      電話番号
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="090-0000-0000"
                    />
                  </div>

                  {/* 塾名 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      塾名
                    </label>
                    <input
                      type="text"
                      name="jukuName"
                      value={formData.jukuName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="○○学習塾"
                    />
                  </div>

                  {/* 現在のHP状況 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      現在のホームページ状況
                    </label>
                    <select
                      name="currentHpStatus"
                      value={formData.currentHpStatus}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">選択してください</option>
                      <option value="none">ホームページがない</option>
                      <option value="old">古いサイトがある</option>
                      <option value="want_renewal">リニューアルしたい</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  {/* メッセージ */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      ご質問・ご要望
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      placeholder="ご質問やご要望があればお書きください"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
                  >
                    {isSubmitting ? '送信中...' : '送信する'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    送信いただいた情報は、お問い合わせ対応のみに使用いたします。
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Image
            src="/images/jukuba-logo.png"
            alt="JUKUBA"
            width={120}
            height={34}
            className="mx-auto mb-4 brightness-0 invert"
          />
          <p className="text-sm text-gray-400">
            &copy; 2025 Edore Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
