'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PenLine, BookOpen, Target, MessageCircle, CheckCircle, Mail, Search } from 'lucide-react'
import { UNIVERSITY_GROUPS, UNIVERSITIES } from '@/data/universities'

export default function NoteSignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [targetUniversity, setTargetUniversity] = useState('')
  const [examYear, setExamYear] = useState(new Date().getFullYear() + 1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [universitySearch, setUniversitySearch] = useState('')
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)

  // 検索フィルタリング
  const filteredUniversities = universitySearch
    ? UNIVERSITIES.filter(u =>
        u.name.toLowerCase().includes(universitySearch.toLowerCase())
      )
    : []

  const handleSelectUniversity = (name: string) => {
    setTargetUniversity(name)
    setUniversitySearch('')
    setShowUniversityDropdown(false)
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/note`,
        },
      })

      if (error) {
        setError('Googleで登録に失敗しました')
        setIsLoading(false)
      }
    } catch {
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
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/note`,
          data: {
            name,
            target_university: targetUniversity,
            exam_year: examYear,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setError('ユーザーの作成に失敗しました')
        setIsLoading(false)
        return
      }

      // プロフィールを更新（志望校と受験年度）
      if (targetUniversity || examYear) {
        await supabase
          .from('roopynote_profiles')
          .update({
            target_university: targetUniversity || null,
            exam_year: examYear || null,
          })
          .eq('id', authData.user.id)
      }

      setIsSuccess(true)
      setIsLoading(false)
    } catch {
      setError('アカウント作成に失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl">
              <PenLine className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            RoopyNote
          </h1>
          <p className="text-lg text-gray-600">
            受験生のための学習記録・目標管理・つぶやきアプリ
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* 左側：フォーム */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Mail className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    認証メールを送信しました
                  </h2>
                  <p className="text-gray-500">{email}</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-2">次のステップ</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>メールボックスを確認してください</li>
                        <li>認証リンクをクリックしてください</li>
                        <li>認証完了後、ログインしてご利用ください</li>
                      </ol>
                    </div>
                  </div>
                </div>
                <Link
                  href="/note/login"
                  className="block w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-600 transition-all"
                >
                  ログインページへ
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    アカウント作成
                  </h2>
                  <p className="text-gray-500 text-sm">
                    無料で始められます
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">名前</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="山田太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      パスワード
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="6文字以上"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        志望校（任意）
                      </label>
                      {targetUniversity ? (
                        <div className="flex items-center gap-2">
                          <span className="flex-1 p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-gray-800">
                            {targetUniversity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTargetUniversity('')}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={universitySearch}
                              onChange={(e) => {
                                setUniversitySearch(e.target.value)
                                setShowUniversityDropdown(true)
                              }}
                              onFocus={() => setShowUniversityDropdown(true)}
                              className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                              placeholder="大学名で検索..."
                            />
                          </div>
                          {showUniversityDropdown && universitySearch && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredUniversities.length > 0 ? (
                                filteredUniversities.slice(0, 10).map((u) => (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => handleSelectUniversity(u.name)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-amber-50 flex items-center justify-between"
                                  >
                                    <span>{u.name}</span>
                                    <span className="text-xs text-gray-400">{u.category}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-400">
                                  該当する大学がありません
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        受験年度
                      </label>
                      <select
                        value={examYear}
                        onChange={(e) => setExamYear(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      >
                        {[0, 1, 2, 3].map((i) => {
                          const year = new Date().getFullYear() + i
                          return (
                            <option key={year} value={year}>
                              {year}年度
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                      <span className="px-2 bg-white text-gray-500">または</span>
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
                  <span className="text-gray-500">すでにアカウントをお持ちですか？</span>
                  <Link href="/note/login" className="text-amber-500 hover:text-amber-600 font-semibold ml-2">
                    ログイン
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* 右側：アプリの特徴 */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-amber-500" />
                RoopyNoteでできること
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">学習記録</h4>
                    <p className="text-sm text-gray-600">
                      毎日の勉強内容を記録。カレンダーで振り返りも簡単。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">目標管理</h4>
                    <p className="text-sm text-gray-600">
                      日次・週次・月次の目標を設定。進捗をグラフで確認。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">つぶやき</h4>
                    <p className="text-sm text-gray-600">
                      今の気持ちや目標を投稿。同じ受験生とつながろう。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">無料で使えます</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  全ての機能が無料
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  広告なし
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  登録は1分で完了
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
