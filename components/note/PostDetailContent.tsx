'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle, Send, Loader2, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import NoteBottomNav from './NoteBottomNav'

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  target_university?: string | null
}

interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
  roopynote_profiles: Profile
  likes_count: number
  comments_count: number
  is_liked: boolean
}

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  roopynote_profiles: Profile
}

interface PostDetailContentProps {
  post: Post
  comments: Comment[]
  currentUserId: string
}

export default function PostDetailContent({
  post,
  comments: initialComments,
  currentUserId,
}: PostDetailContentProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const profile = post.roopynote_profiles
  const isOwnPost = post.user_id === currentUserId

  const handleLike = async () => {
    const supabase = createClient()
    const newIsLiked = !isLiked

    setIsLiked(newIsLiked)
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)

    if (newIsLiked) {
      await supabase
        .from('roopynote_likes')
        .insert({ post_id: post.id, user_id: currentUserId })
    } else {
      await supabase
        .from('roopynote_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('roopynote_comments')
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: newComment.trim(),
        })
        .select(`
          *,
          roopynote_profiles!roopynote_comments_user_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setComments(prev => [...prev, data])
      setNewComment('')
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('roopynote_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', currentUserId)

    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId))
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('この投稿を削除しますか？')) return

    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('roopynote_posts')
      .delete()
      .eq('id', post.id)
      .eq('user_id', currentUserId)

    if (!error) {
      router.push('/note')
    } else {
      setIsDeleting(false)
      alert('削除に失敗しました')
    }
  }

  // Escape keyでメニューを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMenu(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-800">投稿</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* 投稿内容 */}
        <div className="bg-white border-b">
          <div className="p-4">
            {/* ユーザー情報 */}
            <div className="flex items-start justify-between mb-3">
              <Link
                href={`/note/profile/${profile.id}`}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  {profile.display_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{profile.display_name}</p>
                  {profile.target_university && (
                    <p className="text-xs text-gray-500">{profile.target_university}志望</p>
                  )}
                </div>
              </Link>

              {isOwnPost && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-20 overflow-hidden">
                        <button
                          onClick={handleDeletePost}
                          disabled={isDeleting}
                          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 w-full disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{isDeleting ? '削除中...' : '削除'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 本文 */}
            <p className="text-gray-800 text-lg whitespace-pre-wrap mb-4">
              {post.content}
            </p>

            {/* 画像 */}
            {post.image_url && (
              <div className="mb-4">
                <img
                  src={post.image_url}
                  alt=""
                  className="w-full rounded-xl"
                />
              </div>
            )}

            {/* 日時 */}
            <p className="text-sm text-gray-500 mb-4">
              {new Date(post.created_at).toLocaleString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

            {/* アクション */}
            <div className="flex items-center gap-6 pt-3 border-t">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 group"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isLiked
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-500 group-hover:text-red-500'
                  }`}
                />
                <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                  {likesCount}
                </span>
              </button>

              <button
                onClick={() => inputRef.current?.focus()}
                className="flex items-center gap-2 group"
              >
                <MessageCircle className="w-6 h-6 text-gray-500 group-hover:text-amber-500" />
                <span className="text-sm text-gray-500">{comments.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* コメント入力 */}
        <div className="bg-white border-b sticky top-14 z-30">
          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              ?
            </div>
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
                placeholder="コメントを追加..."
                className="flex-1 bg-transparent outline-none text-sm"
                maxLength={280}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="text-amber-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* コメント一覧 */}
        <div className="divide-y">
          {comments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>まだコメントはありません</p>
              <p className="text-sm">最初のコメントを投稿しましょう</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4">
                <div className="flex items-start gap-3">
                  <Link
                    href={`/note/profile/${comment.roopynote_profiles.id}`}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  >
                    {comment.roopynote_profiles.display_name?.charAt(0).toUpperCase() || '?'}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/note/profile/${comment.roopynote_profiles.id}`}
                        className="font-bold text-gray-800 text-sm hover:underline"
                      >
                        {comment.roopynote_profiles.display_name}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm mt-1 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  {comment.user_id === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <NoteBottomNav />
    </div>
  )
}
