'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

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
        redirectTo: `${window.location.origin}/reset-password`,
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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7] px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <Image
              src="/Roopy-full-1.png"
              alt="Roopy（るーぴー）"
              width={200}
              height={67}
              className="mx-auto mb-4"
              priority
            />
          </div>

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <Mail className="w-12 h-12 text-green-600" />
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
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
                  <li>• 迷惑メールフォルダをご確認ください</li>
                  <li>• メールアドレスに誤りがないかご確認ください</li>
                </ul>
              </div>
              <Link
                href="/login"
                className="block w-full py-3 bg-[#5DDFC3] text-white rounded-lg font-semibold hover:bg-[#4ECFB3] transition-colors"
              >
                ログインページへ戻る
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-[#3A405A] mb-2">
                  パスワードをリセット
                </h2>
                <p className="text-[#3A405A] text-sm opacity-70">
                  登録したメールアドレスを入力してください。
                  <br />
                  パスワード再設定用のリンクをお送りします。
                </p>
              </div>

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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
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
                  className="w-full py-3 bg-[#5DDFC3] text-white rounded-lg font-semibold hover:bg-[#4ECFB3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '送信中...' : 'リセットメールを送信'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[#5DDFC3] hover:text-[#4ECFB3] font-semibold text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ログインページへ戻る
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
