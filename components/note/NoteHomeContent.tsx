'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NoteHeader from './NoteHeader'
import NoteBottomNav from './NoteBottomNav'
import PostCard from './PostCard'
import PostComposer from './PostComposer'
import { BookOpen, Target, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  target_university: string | null
  exam_year: number | null
}

interface Entry {
  id: string
  content: string
  study_hours: number | null
  mood: number | null
  entry_date: string
}

interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  profile: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

interface NoteHomeContentProps {
  profile: Profile | null
  todayEntry: Entry | null
  posts: Post[]
  likedPostIds: Set<string>
  userId: string
}

export default function NoteHomeContent({
  profile,
  todayEntry,
  posts: initialPosts,
  likedPostIds: initialLikedPostIds,
  userId,
}: NoteHomeContentProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [likedPostIds, setLikedPostIds] = useState(initialLikedPostIds)
  const [showComposer, setShowComposer] = useState(false)

  const handleNewPost = (newPost: Post) => {
    setPosts([newPost, ...posts])
    setShowComposer(false)
  }

  const handleLike = async (postId: string) => {
    const supabase = createClient()
    const isLiked = likedPostIds.has(postId)

    if (isLiked) {
      await supabase
        .from('roopynote_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)

      setLikedPostIds((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p
        )
      )
    } else {
      await supabase
        .from('roopynote_likes')
        .insert({ user_id: userId, post_id: postId })

      setLikedPostIds((prev) => new Set([...Array.from(prev), postId]))

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
        )
      )
    }

    // likes_countを更新
    await supabase
      .from('roopynote_posts')
      .update({
        likes_count: posts.find(p => p.id === postId)!.likes_count + (isLiked ? -1 : 1)
      })
      .eq('id', postId)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NoteHeader />

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* 今日のサマリー */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">今日の学習</h2>
            <Link
              href="/note/diary"
              className="text-sm text-amber-500 hover:text-amber-600"
            >
              記録する
            </Link>
          </div>

          {todayEntry ? (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {todayEntry.study_hours && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{todayEntry.study_hours}時間</span>
                  </div>
                )}
                {todayEntry.mood && (
                  <div className="text-sm">
                    {['', '😫', '😕', '😐', '😊', '🔥'][todayEntry.mood]}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {todayEntry.content}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-3">
                まだ今日の記録がありません
              </p>
              <Link
                href="/note/diary"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                学習を記録する
              </Link>
            </div>
          )}
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/note/goals"
            className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-orange-100 p-2 rounded-lg">
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">目標を見る</p>
              <p className="text-xs text-gray-500">進捗を確認</p>
            </div>
          </Link>
          <button
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="bg-white/20 p-2 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">つぶやく</p>
              <p className="text-xs text-white/80">今の気持ちを共有</p>
            </div>
          </button>
        </div>

        {/* タイムライン */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800 px-1">みんなのつぶやき</h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-gray-400">
                まだ投稿がありません。
                <br />
                最初のつぶやきを投稿しましょう！
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPostIds.has(post.id)}
                onLike={() => handleLike(post.id)}
                currentUserId={userId}
              />
            ))
          )}
        </div>
      </main>

      {/* 投稿モーダル */}
      {showComposer && (
        <PostComposer
          onClose={() => setShowComposer(false)}
          onPost={handleNewPost}
          profile={profile}
        />
      )}

      <NoteBottomNav />
    </div>
  )
}
