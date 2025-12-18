'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Settings, BookOpen, MessageCircle, Calendar, GraduationCap, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  target_university: string | null
  exam_year: number | null
  is_public: boolean
  created_at: string
}

interface Post {
  id: string
  content: string
  created_at: string
}

interface Stats {
  entries: number
  posts: number
  following: number
  followers: number
}

interface ProfileContentProps {
  profile: Profile | null
  stats: Stats
  recentPosts: Post[]
  isOwnProfile: boolean
}

export default function ProfileContent({
  profile,
  stats,
  recentPosts,
  isOwnProfile,
}: ProfileContentProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/note/login'
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">プロフィールが見つかりません</p>
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* プロフィールカード */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* アバター */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile.display_name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 truncate">
                {profile.display_name}
              </h1>
              {isOwnProfile && (
                <Link
                  href="/note/profile/edit"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                </Link>
              )}
            </div>

            {/* 志望校・受験年度 */}
            {(profile.target_university || profile.exam_year) && (
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <GraduationCap className="w-4 h-4" />
                <span>
                  {profile.target_university || '志望校未設定'}
                  {profile.exam_year && ` (${profile.exam_year}年度)`}
                </span>
              </div>
            )}

            {/* 自己紹介 */}
            {profile.bio && (
              <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stats.entries}</p>
            <p className="text-xs text-gray-500">記録</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stats.posts}</p>
            <p className="text-xs text-gray-500">投稿</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stats.following}</p>
            <p className="text-xs text-gray-500">フォロー</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stats.followers}</p>
            <p className="text-xs text-gray-500">フォロワー</p>
          </div>
        </div>
      </div>

      {/* クイックリンク */}
      <div className="bg-white rounded-2xl shadow-sm divide-y">
        <Link
          href="/note/diary"
          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="bg-amber-100 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">学習記録</p>
            <p className="text-xs text-gray-500">過去の記録を見る</p>
          </div>
        </Link>

        <Link
          href="/note/timeline"
          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="bg-orange-100 p-2 rounded-lg">
            <MessageCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">自分の投稿</p>
            <p className="text-xs text-gray-500">{stats.posts}件の投稿</p>
          </div>
        </Link>

        <Link
          href="/note/stats"
          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="bg-green-100 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">統計</p>
            <p className="text-xs text-gray-500">学習の振り返り</p>
          </div>
        </Link>
      </div>

      {/* 最近の投稿 */}
      {recentPosts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">最近の投稿</h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/note/timeline/${post.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(post.created_at).toLocaleDateString('ja-JP')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ログアウト */}
      {isOwnProfile && (
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          <span>{isLoggingOut ? 'ログアウト中...' : 'ログアウト'}</span>
        </button>
      )}
    </main>
  )
}
