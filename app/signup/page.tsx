'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Beaker, Trophy, Coins, RotateCcw, CheckCircle, Mail, Gift } from 'lucide-react'
import LPFooter from '@/components/LPFooter'

interface Referrer {
  id: string
  name: string
}

function SignupForm() {
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [referrer, setReferrer] = useState<Referrer | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [referralError, setReferralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // URLから招待コードを取得
  useEffect(() => {
    const code = searchParams.get('ref')
    if (code) {
      setReferralCode(code.toUpperCase())
      validateReferralCode(code)
    }
  }, [searchParams])

  // 招待コードを検証
  const validateReferralCode = async (code: string) => {
    if (!code || code.length < 8) {
      setReferrer(null)
      setReferralError(null)
      return
    }

    setIsValidatingCode(true)
    setReferralError(null)

    try {
      const response = await fetch(`/api/referral/validate?code=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (data.valid) {
        setReferrer(data.referrer)
        setReferralError(null)
      } else {
        setReferrer(null)
        setReferralError('無効な招待コードです')
      }
    } catch (err) {
      setReferrer(null)
      setReferralError('招待コードの検証に失敗しました')
    } finally {
      setIsValidatingCode(false)
    }
  }

  // 招待コード入力時のハンドラ
  const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase().slice(0, 8)
    setReferralCode(code)
    if (code.length === 8) {
      validateReferralCode(code)
    } else {
      setReferrer(null)
      setReferralError(null)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      // 招待コードがある場合はcallbackに渡す
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      if (referrer) {
        callbackUrl.searchParams.set('referrer_id', referrer.id)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        setError('Googleで登録に失敗しました')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Googleで登録に失敗しました')
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // 1. ユーザー作成（メタデータに名前とロールと紹介者IDを含める）
      // 全ての新規登録ユーザーは自動的に生徒として登録されます
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/`,
          data: {
            name,
            role: 'student',
            referred_by: referrer?.id || null,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (!authData.user) {
        setError('ユーザーの作成に失敗しました')
        return
      }

      // 2. トリガーによって自動的にプロフィールが作成されます

      // 3. 登録成功を表示
      setIsSuccess(true)
      setIsLoading(false)
    } catch (err) {
      setError('アカウント作成に失敗しました')
      console.error(err)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Mail className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#3A405A] mb-2">
                    認証メールを送信しました
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
                        <li>認証リンクをクリックしてください</li>
                        <li>認証完了後、ログインしてご利用ください</li>
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
                  ログインページへ
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-[#3A405A] mb-2">
                    アカウント作成
                  </h2>
                  <p className="text-[#3A405A] text-sm opacity-70">
                    1分で登録完了
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
            {/* 招待コード入力欄 */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">
                招待コード（任意）
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={handleReferralCodeChange}
                  maxLength={8}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent uppercase tracking-widest font-mono ${
                    referrer ? 'border-green-400 bg-green-50' : referralError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="XXXXXXXX"
                />
                {isValidatingCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#5DDFC3] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {referrer && !isValidatingCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {referrer && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Gift className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {referrer.name}さんからの招待
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    デイリーミッションが2つの状態でスタート！
                  </p>
                </div>
              )}
              {referralError && (
                <p className="mt-1 text-sm text-red-500">{referralError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="山田太郎"
              />
            </div>

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
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                placeholder="6文字以上"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    メール認証について
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    登録後、入力されたメールアドレス宛に認証用のリンクが送信されます。メール内のリンクをクリックして認証を完了してください。
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#5DDFC3] text-white rounded-lg font-semibold hover:bg-[#4ECFB3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'アカウント作成中...' : 'アカウントを作成'}
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
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="mt-4 w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleで登録
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#3A405A]">すでにアカウントをお持ちですか？</span>
            <Link href="/login" className="text-[#5DDFC3] hover:text-[#4ECFB3] font-semibold ml-2">
              ログイン
            </Link>
          </div>
      </>
    )}
  </div>
  )
}

function SignupFormLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="animate-pulse space-y-5">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F4F9F7] px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <Image
            src="/Roopy-full-1.png"
            alt="Roopy（るーぴー）"
            width={250}
            height={84}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-3xl md:text-4xl font-bold text-[#3A405A] mb-3">
            大学受験を"毎日つづけられる"ゲームにする
          </h1>
          <p className="text-lg text-[#3A405A] opacity-80">
            すべて無料・登録後すぐに始められます
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* 左側：フォーム */}
          <Suspense fallback={<SignupFormLoading />}>
            <SignupForm />
          </Suspense>

          {/* 右側：アプリの特徴 */}
          <div className="space-y-6">
            {/* Roopyの紹介 */}
            <div className="bg-gradient-to-br from-[#E0F7F1] to-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-3">
                <Image
                  src="/Roopy.png"
                  alt="Roopy"
                  width={60}
                  height={60}
                  className="flex-shrink-0"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#3A405A]">
                    Roopyと一緒に学習しよう！
                  </h3>
                  <p className="text-sm text-[#3A405A] opacity-70">
                    あなたの学習をサポートする相棒
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#3A405A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#5DDFC3]" />
                登録すると使える機能
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#E0F7F1] p-2 rounded-lg">
                    <Beaker className="w-5 h-5 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A405A] mb-1">無機化学の問題演習</h4>
                    <p className="text-sm text-[#3A405A] opacity-70">
                      1問1答形式でサクサク進む。全33章を網羅。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#E0F7F1] p-2 rounded-lg">
                    <Coins className="w-5 h-5 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A405A] mb-1">ポイント＆バッジ</h4>
                    <p className="text-sm text-[#3A405A] opacity-70">
                      学習するたびポイント獲得。ログインボーナスも。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#E0F7F1] p-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A405A] mb-1">ランキング機能</h4>
                    <p className="text-sm text-[#3A405A] opacity-70">
                      全国のライバルと競い合って、モチベーションUP。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#E0F7F1] p-2 rounded-lg">
                    <RotateCcw className="w-5 h-5 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A405A] mb-1">復習モード</h4>
                    <p className="text-sm text-[#3A405A] opacity-70">
                      間違えた問題を効率的に復習。弱点を克服。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#5DDFC3] to-[#4ECFB3] rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">完全無料で使えます</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  料金は一切かかりません
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  全ての機能が使い放題
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  面倒な手続き一切なし
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <LPFooter />
    </div>
  )
}
