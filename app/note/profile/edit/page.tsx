'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NoteHeader from '@/components/note/NoteHeader'
import NoteBottomNav from '@/components/note/NoteBottomNav'
import { ArrowLeft, Save, Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { UNIVERSITIES } from '@/data/universities'

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  target_university: string | null
  exam_year: number | null
  study_hours_goal: number
  is_public: boolean
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // フォーム
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [targetUniversity, setTargetUniversity] = useState('')
  const [examYear, setExamYear] = useState(new Date().getFullYear() + 1)
  const [studyHoursGoal, setStudyHoursGoal] = useState(8)
  const [isPublic, setIsPublic] = useState(true)

  // 大学検索
  const [universitySearch, setUniversitySearch] = useState('')
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)

  const filteredUniversities = universitySearch
    ? UNIVERSITIES.filter(u =>
        u.name.toLowerCase().includes(universitySearch.toLowerCase())
      )
    : []

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/note/login')
        return
      }

      const { data } = await supabase
        .from('roopynote_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
        setTargetUniversity(data.target_university || '')
        setExamYear(data.exam_year || new Date().getFullYear() + 1)
        setStudyHoursGoal(data.study_hours_goal || 8)
        setIsPublic(data.is_public ?? true)
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!profile || !displayName.trim()) return

    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('roopynote_profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          target_university: targetUniversity || null,
          exam_year: examYear,
          study_hours_goal: studyHoursGoal,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'プロフィールを更新しました' })
      setTimeout(() => router.push('/note/profile'), 1000)
    } catch {
      setMessage({ type: 'error', text: '更新に失敗しました' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/note/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-bold text-gray-800">プロフィール編集</h1>
          <button
            onClick={handleSave}
            disabled={isSaving || !displayName.trim()}
            className="p-2 -mr-2 text-amber-500 hover:bg-amber-50 rounded-full disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* アバター */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-3xl mb-4">
              {displayName.charAt(0).toUpperCase() || '?'}
            </div>
            <p className="text-sm text-gray-500">
              アイコンは名前の頭文字が表示されます
            </p>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">基本情報</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="名前を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自己紹介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              rows={3}
              placeholder="自己紹介を入力..."
              maxLength={200}
            />
            <p className="text-xs text-gray-400 text-right">{bio.length}/200</p>
          </div>
        </div>

        {/* 受験情報 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">受験情報</h2>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              志望校
            </label>
            {targetUniversity ? (
              <div className="flex items-center gap-2">
                <span className="flex-1 p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm">
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
                    className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                          onClick={() => {
                            setTargetUniversity(u.name)
                            setUniversitySearch('')
                            setShowUniversityDropdown(false)
                          }}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1日の目標学習時間
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="16"
                value={studyHoursGoal}
                onChange={(e) => setStudyHoursGoal(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <span className="w-16 text-center font-medium text-gray-800">
                {studyHoursGoal}時間
              </span>
            </div>
          </div>
        </div>

        {/* プライバシー */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">プライバシー</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">プロフィールを公開</p>
              <p className="text-xs text-gray-500">
                他のユーザーがあなたのプロフィールを見れるようになります
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={isSaving || !displayName.trim()}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              保存する
            </>
          )}
        </button>
      </main>

      <NoteBottomNav />
    </div>
  )
}
