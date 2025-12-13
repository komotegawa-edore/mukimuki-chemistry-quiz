'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Newspaper, Headphones, Globe, Clock, CheckCircle, Mail } from 'lucide-react'

export default function EnglishSignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/english/news`,
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

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/english/news`,
          data: {
            name,
            role: 'student',
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

      setIsSuccess(true)
      setIsLoading(false)
    } catch (err) {
      setError('アカウント作成に失敗しました')
      console.error(err)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/english/favicon-48x48.png"
              alt="Roopy English"
              width={56}
              height={56}
              className="rounded-lg"
              priority
            />
            <span className="text-3xl font-bold text-[#3A405A]">Roopy English</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#3A405A] mb-3">
            毎朝の通勤を、英語学習タイムに
          </h1>
          <p className="text-lg text-[#3A405A] opacity-80">
            無料で今すぐ始められます
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* 左側：フォーム */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-cyan-100 p-4 rounded-full">
                    <Mail className="w-12 h-12 text-cyan-600" />
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
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-cyan-800">
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
                  href="/english/login"
                  className="block w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
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
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#3A405A]">名前</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="6文字以上"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-cyan-800">
                          メール認証について
                        </p>
                        <p className="text-xs text-cyan-700 mt-1">
                          登録後、入力されたメールアドレス宛に認証用のリンクが送信されます。メール内のリンクをクリックして認証を完了してください。
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  <Link href="/english/login" className="text-cyan-500 hover:text-cyan-600 font-semibold ml-2">
                    ログイン
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* 右側：アプリの特徴 */}
          <div className="space-y-6">
            {/* Roopyの紹介 */}
            <div className="bg-gradient-to-br from-cyan-100 to-teal-50 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-white p-3 rounded-full shadow">
                  <Newspaper className="w-8 h-8 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#3A405A]">
                    日本のニュースを英語で聞こう
                  </h3>
                  <p className="text-sm text-[#3A405A] opacity-70">
                    背景知識があるから理解しやすい
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#3A405A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-cyan-500" />
                Roopy Englishの特徴
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <Newspaper className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A405A] mb-1">毎朝約20本の新着ニュース</h4>
                    <p className="text-sm text-[#3A405A] opacity-70">
                      テクノロジー、ビジネス、スポーツなど多様なジャンル
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <Headphones className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A405A] mb-1">自然な英語音声</h4>
                    <p className="text-sm text-[#3A405A] opacity-70">
                      AIが毎日ニュースを読み上げ
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <Globe className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A405A] mb-1">英語スクリプト付き</h4>
                    <p className="text-sm text-[#3A405A] opacity-70">
                      聞き取れなかった部分も確認できる
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A405A] mb-1">1本2-3分でサクッと</h4>
                    <p className="text-sm text-[#3A405A] opacity-70">
                      通勤電車の中でちょうどいい長さ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">無料で始められます</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  毎日2本のニュースが無料
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  英語音声 & スクリプト付き
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  登録は1分で完了
                </li>
              </ul>
              <p className="text-xs opacity-80 mt-3">
                ※全ニュース見放題は月額980円〜
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/english"
                className="text-sm text-[#3A405A] opacity-70 hover:text-cyan-500 hover:opacity-100 transition-colors"
              >
                ← Roopy Englishについて詳しく見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
