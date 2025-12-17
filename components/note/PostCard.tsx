'use client'

import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

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

interface PostCardProps {
  post: Post
  isLiked: boolean
  onLike: () => void
  currentUserId: string
}

export default function PostCard({ post, isLiked, onLike, currentUserId }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ja,
  })

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* アバター */}
        <Link href={`/note/profile/${post.profile.id}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
            {post.profile.avatar_url ? (
              <img
                src={post.profile.avatar_url}
                alt={post.profile.display_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              post.profile.display_name.charAt(0).toUpperCase()
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href={`/note/profile/${post.profile.id}`}
                className="font-semibold text-gray-800 hover:underline text-sm"
              >
                {post.profile.display_name}
              </Link>
              <span className="text-xs text-gray-400">{timeAgo}</span>
            </div>
            {currentUserId === post.user_id && (
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* コンテンツ */}
          <p className="text-gray-700 mt-1 whitespace-pre-wrap text-sm">
            {post.content}
          </p>

          {/* 画像 */}
          {post.image_url && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <img
                src={post.image_url}
                alt=""
                className="w-full object-cover max-h-80"
              />
            </div>
          )}

          {/* アクション */}
          <div className="flex items-center gap-6 mt-3">
            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
              />
              <span className="text-xs">{post.likes_count || ''}</span>
            </button>

            <Link
              href={`/note/timeline/${post.id}`}
              className="flex items-center gap-1.5 text-gray-400 hover:text-amber-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{post.comments_count || ''}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
