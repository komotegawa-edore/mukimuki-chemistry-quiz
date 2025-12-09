'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // URLにcodeパラメータがある場合はセッションを確立
    const checkSession = async () => {
      const supabase = createClient()

      // Supabaseが自動的にURLのトークンを処理してセッションを確立
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session error:', error)
        setIsValidSession(false)
        return
      }

      // recovery tokenがある場合はセッションが確立されている
      if (session) {
        setIsValidSession(true)
      } else {
        // セッションがない場合は、URLのハッシュフラグメントからトークンを取得
        // Supabaseはリセットリンクでハッシュフラグメントを使用する
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          // ハッシュからトークンを抽出してセッションを確立
          const { data, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) {
            setIsValidSession(false)
          } else if (data.session) {
            setIsValidSession(true)
          } else {
            setIsValidSession(false)
          }
        } else {
          setIsValidSession(false)
        }
      }
    }

    checkSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // パスワードの検証
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
        return
      }

      setIsSuccess(true)

      // 3秒後にログインページへリダイレクト
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError('パスワードの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // セッション確認中
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7] px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5DDFC3] mx-auto mb-4"></div>
            <p className="text-[#3A405A]">認証を確認中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 無効なセッション
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7] px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#3A405A] mb-2">
                  リンクが無効です
                </h2>
                <p className="text-[#3A405A] opacity-70 text-sm">
                  パスワードリセットのリンクが無効か、期限切れです。
                  <br />
                  もう一度パスワードリセットをリクエストしてください。
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="block w-full py-3 bg-[#5DDFC3] text-white rounded-lg font-semibold hover:bg-[#4ECFB3] transition-colors"
              >
                パスワードリセットをリクエスト
              </Link>
              <Link
                href="/login"
                className="block text-[#5DDFC3] hover:text-[#4ECFB3] font-semibold text-sm"
              >
                ログインページへ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#3A405A] mb-2">
                  パスワードを変更しました
                </h2>
                <p className="text-[#3A405A] opacity-70 text-sm">
                  新しいパスワードでログインできます。
                  <br />
                  自動的にログインページへ移動します...
                </p>
              </div>
              <Link
                href="/login"
                className="block w-full py-3 bg-[#5DDFC3] text-white rounded-lg font-semibold hover:bg-[#4ECFB3] transition-colors"
              >
                ログインページへ
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-[#E0F7F1] p-3 rounded-full">
                    <Lock className="w-8 h-8 text-[#5DDFC3]" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#3A405A] mb-2">
                  新しいパスワードを設定
                </h2>
                <p className="text-[#3A405A] text-sm opacity-70">
                  6文字以上のパスワードを入力してください
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#3A405A]">
                    新しいパスワード
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                    placeholder="6文字以上"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#3A405A]">
                    パスワード（確認）
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                    placeholder="もう一度入力"
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
                  {isLoading ? '変更中...' : 'パスワードを変更'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7] px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5DDFC3] mx-auto mb-4"></div>
              <p className="text-[#3A405A]">読み込み中...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
