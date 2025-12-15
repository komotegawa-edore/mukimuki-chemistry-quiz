'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  blogSlug: string
}

export default function BlogLikeButton({ blogSlug }: Props) {
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      // いいね数を取得
      const { count } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('blog_slug', blogSlug)

      setLikeCount(count || 0)

      // ログインユーザーがいいね済みか確認
      if (user) {
        const { data } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('blog_slug', blogSlug)
          .eq('user_id', user.id)
          .single()

        setHasLiked(!!data)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [blogSlug, supabase])

  const handleLike = async () => {
    if (!userId) {
      // 未ログインの場合はログインページへ
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    setIsLoading(true)

    if (hasLiked) {
      // いいね解除
      await supabase
        .from('blog_likes')
        .delete()
        .eq('blog_slug', blogSlug)
        .eq('user_id', userId)

      setLikeCount(prev => prev - 1)
      setHasLiked(false)
    } else {
      // いいね追加
      await supabase
        .from('blog_likes')
        .insert({ blog_slug: blogSlug, user_id: userId })

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
