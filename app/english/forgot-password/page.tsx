'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/english/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setIsSuccess(true)
    } catch (err) {
      setError('パスワードリセットメールの送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image
                src="/english/favicon-48x48.png"
                alt="Roopy English"
                width={48}
                height={48}
                className="rounded-lg"
                priority
              />
              <span className="text-2xl font-bold text-[#3A405A]">Roopy English</span>
            </div>
          </div>

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#3A405A] mb-2">
                  メールを送信しました
                </h2>
                <p className="text-[#3A405A] opacity-70">
                  {email}
                </p>
              </div>
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-left">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-cyan-800">
                    <p className="font-semibold mb-2">次のステップ</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>メールボックスを確認してください</li>
                      <li>メール内のリンクをクリックしてください</li>
                      <li>新しいパスワードを設定してください</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <p className="text-xs text-yellow-800">
                  <strong>メールが届かない場合：</strong>
                </p>
                <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                  <li>・迷惑メールフォルダをご確認ください</li>
                  <li>・メールアドレスに誤りがないかご確認ください</li>
                </ul>
              </div>
              <Link
                href="/english/login"
                className="block w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors text-center"
              >
                ログインページへ
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center text-[#3A405A] mb-2">
                パスワードをお忘れですか？
              </h1>
              <p className="text-center text-[#3A405A] opacity-70 text-sm mb-6">
                登録したメールアドレスを入力してください。<br />
                パスワードリセット用のリンクをお送りします。
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#3A405A]">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '送信中...' : 'リセットメールを送信'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/english/login"
                  className="inline-flex items-center gap-1 text-sm text-[#3A405A] opacity-70 hover:text-cyan-500 hover:opacity-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  ログインページに戻る
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
