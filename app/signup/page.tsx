'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [teacherKey, setTeacherKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 講師アカウントの場合、キーを検証
      if (role === 'teacher') {
        const verifyResponse = await fetch('/api/verify-teacher-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: teacherKey }),
        })

        if (!verifyResponse.ok) {
          const data = await verifyResponse.json()
          setError(data.error || '講師用キーが正しくありません')
          setIsLoading(false)
          return
        }
      }

      const supabase = createClient()

      // 1. ユーザー作成（メタデータに名前とロールを含める）
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/`,
          data: {
            name,
            role,
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

      // 3. セッションが確立されるまで少し待つ
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 4. 完全なページリロードでホームへリダイレクト
      window.location.href = '/'
    } catch (err) {
      setError('アカウント作成に失敗しました')
      console.error(err)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F9F7] px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <Image
              src="/Roopy-full-1.png"
              alt="Roopy（るーぴー）"
              width={200}
              height={67}
              className="mx-auto mb-2"
              priority
            />
            <h1 className="text-2xl font-bold text-[#3A405A] mb-1">
              アカウント作成
            </h1>
            <p className="text-[#3A405A] text-sm">
              大学受験学習アプリ
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

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#3A405A]">役割</label>
              <div className="flex gap-4">
                <label className="flex items-center text-[#3A405A]">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                    className="mr-2 accent-[#5DDFC3]"
                  />
                  生徒
                </label>
                <label className="flex items-center text-[#3A405A]">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === 'teacher'}
                    onChange={() => setRole('teacher')}
                    className="mr-2 accent-[#5DDFC3]"
                  />
                  講師
                </label>
              </div>
            </div>

            {role === 'teacher' && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#3A405A]">
                  講師用認証キー
                </label>
                <input
                  type="password"
                  value={teacherKey}
                  onChange={(e) => setTeacherKey(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent"
                  placeholder="講師用キーを入力"
                />
                <p className="text-xs text-[#3A405A] opacity-70 mt-1">
                  ※講師アカウント作成には認証キーが必要です
                </p>
              </div>
            )}

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
              onClick={() => {
                console.log('LINE登録ボタンがクリックされました')
                window.location.href = '/api/auth/line'
              }}
              disabled={isLoading}
              className="mt-4 w-full py-3 bg-[#06C755] text-white rounded-lg font-semibold hover:bg-[#05b34b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINEで登録
            </button>
            <p className="text-xs text-center text-[#3A405A] opacity-70 mt-2">
              ※LINEで登録すると自動的に生徒アカウントが作成されます
            </p>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#3A405A]">すでにアカウントをお持ちですか？</span>
            <Link href="/login" className="text-[#5DDFC3] hover:text-[#4ECFB3] font-semibold ml-2">
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
