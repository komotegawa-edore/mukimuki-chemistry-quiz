'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { GraduationCap, UserPlus, UserMinus, Loader2 } from 'lucide-react'

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

interface UserProfileContentProps {
  profile: Profile
  stats: Stats
  recentPosts: Post[]
  isFollowing: boolean
  currentUserId: string
}

export default function UserProfileContent({
  profile,
  stats,
  recentPosts,
  isFollowing: initialIsFollowing,
  currentUserId,
}: UserProfileContentProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(stats.followers)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isFollowing) {
        // フォロー解除
        await supabase
          .from('roopynote_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.id)

        setIsFollowing(false)
        setFollowersCount(prev => prev - 1)
      } else {
        // フォロー
        await supabase
          .from('roopynote_follows')
          .insert({
            follower_id: currentUserId,
            following_id: profile.id,
          })

        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('Follow error:', err)
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-xl font-bold text-gray-800 truncate">
              {profile.display_name}
            </h1>

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

            {/* フォローボタン */}
            <button
              onClick={handleFollow}
              disabled={isLoading}
              className={`mt-3 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  フォロー中
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  フォローする
                </>
              )}
            </button>
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
            <p className="text-lg font-bold text-gray-800">{followersCount}</p>
            <p className="text-xs text-gray-500">フォロワー</p>
          </div>
        </div>
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

      {/* 投稿がない場合 */}
      {recentPosts.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-gray-500">まだ投稿がありません</p>
        </div>
      )}
    </main>
  )
}
