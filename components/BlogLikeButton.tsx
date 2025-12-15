'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  blogSlug: string
}

// 匿名ユーザー用のIDを取得または生成
function getAnonymousId(): string {
  const key = 'blog_anonymous_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

// いいね済みかどうかをローカルストレージで確認
function hasLikedLocally(blogSlug: string): boolean {
  const likes = JSON.parse(localStorage.getItem('blog_likes') || '[]')
  return likes.includes(blogSlug)
}

// いいね状態をローカルストレージに保存
function setLikedLocally(blogSlug: string, liked: boolean) {
  const likes = JSON.parse(localStorage.getItem('blog_likes') || '[]')
  if (liked && !likes.includes(blogSlug)) {
    likes.push(blogSlug)
  } else if (!liked) {
    const index = likes.indexOf(blogSlug)
    if (index > -1) likes.splice(index, 1)
  }
  localStorage.setItem('blog_likes', JSON.stringify(likes))
}

export default function BlogLikeButton({ blogSlug }: Props) {
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [anonymousId, setAnonymousId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      // 匿名IDを取得
      const anonId = getAnonymousId()
      setAnonymousId(anonId)

      // いいね数を取得
      const { count } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('blog_slug', blogSlug)

      setLikeCount(count || 0)

      // いいね済みか確認
      if (user) {
        // ログインユーザーはDBで確認
        const { data } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('blog_slug', blogSlug)
          .eq('user_id', user.id)
          .single()
        setHasLiked(!!data)
      } else {
        // 匿名ユーザーはローカルストレージで確認
        setHasLiked(hasLikedLocally(blogSlug))
      }

      setIsLoading(false)
    }

    fetchData()
  }, [blogSlug, supabase])

  const handleLike = async () => {
    setIsLoading(true)

    if (hasLiked) {
      // いいね解除
      if (userId) {
        await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_slug', blogSlug)
          .eq('user_id', userId)
      } else if (anonymousId) {
        await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_slug', blogSlug)
          .eq('anonymous_id', anonymousId)
        setLikedLocally(blogSlug, false)
      }

      setLikeCount(prev => prev - 1)
      setHasLiked(false)
    } else {
      // いいね追加
      if (userId) {
        await supabase
          .from('blog_likes')
          .insert({ blog_slug: blogSlug, user_id: userId })
      } else if (anonymousId) {
        await supabase
          .from('blog_likes')
          .insert({ blog_slug: blogSlug, anonymous_id: anonymousId })
        setLikedLocally(blogSlug, true)
      }

      setLikeCount(prev => prev + 1)
      setHasLiked(true)
    }

    setIsLoading(false)
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
        hasLiked
          ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart
        className={`w-5 h-5 transition-all ${hasLiked ? 'fill-pink-600' : ''}`}
      />
      <span>{likeCount}</span>
    </button>
  )
}
