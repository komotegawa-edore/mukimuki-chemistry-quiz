'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

// エラー表示用のコンポーネント（useSearchParamsを使用）
function ErrorDisplay({ onError }: { onError: (error: string | null) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        line_not_configured: 'LINE ログインが設定されていません。管理者にお問い合わせください。',
        line_auth_no_code: 'LINE 認証に失敗しました（コードが取得できませんでした）',
        line_auth_invalid_state: 'LINE 認証に失敗しました（不正なリクエストです）',
        line_token_failed: 'LINE トークンの取得に失敗しました',
        line_profile_failed: 'LINE プロフィールの取得に失敗しました',
        signup_failed: 'アカウントの作成に失敗しました',
        line_auth_failed: 'LINE ログインに失敗しました',
        rate_limit: '短時間に複数回の試行が行われたため、一時的にブロックされています。しばらく待ってから再度お試しください。',
        oauth_failed: 'ソーシャルログインに失敗しました。もう一度お試しください。',
      }
      onError(errorMessages[errorParam] || 'ログインに失敗しました')
    }
  }, [searchParams, onError])

  return null
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError('Googleログインに失敗しました')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Googleログインに失敗しました')
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // セッションが確立されるまで少し待つ
      await new Promise(resolve => setTimeout(resolve, 500))

      // 完全なページリロードでホームへリダイレクト
      window.location.href = '/'
    } catch (err) {
      setError('ログインに失敗しました')
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
            <p className="text-[#3A405A] text-sm">大学受験学習アプリ</p>
          </div>

          <Suspense fallback={null}>
            <ErrorDisplay onError={setError} />
          </Suspense>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="••••••••"
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
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#3A405A]">または</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mt-4 w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleでログイン
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
            >
              パスワードを忘れた方はこちら
            </Link>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-[#3A405A]">アカウントをお持ちでないですか？</span>
            <Link href="/signup" className="text-[#5DDFC3] hover:text-[#4ECFB3] font-semibold ml-2">
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginForm />
}
