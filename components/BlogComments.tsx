'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Trash2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  user_name?: string
}

type Props = {
  blogSlug: string
}

export default function BlogComments({ blogSlug }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()
        setUserName(profile?.name || null)
      }

      // コメントを取得
      await fetchComments()
      setIsLoading(false)
    }

    fetchData()
  }, [blogSlug])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('blog_comments')
      .select(`
        id,
        content,
        created_at,
        user_id
      `)
      .eq('blog_slug', blogSlug)
      .order('created_at', { ascending: true })

    if (data) {
      // ユーザー名を取得
      const userIds = Array.from(new Set(data.map(c => c.user_id)))
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds)

      const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || [])

      const commentsWithNames = data.map(comment => ({
        ...comment,
        user_name: profileMap.get(comment.user_id) || '匿名ユーザー'
      }))

      setComments(commentsWithNames)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)

    const { error } = await supabase
      .from('blog_comments')
      .insert({
        blog_slug: blogSlug,
        user_id: userId,
        content: newComment.trim()
      })

    if (!error) {
      setNewComment('')
      await fetchComments()
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('このコメントを削除しますか？')) return

    await supabase
      .from('blog_comments')
      .delete()
      .eq('id', commentId)

    await fetchComments()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 text-xl font-bold text-[#3A405A]">
        <MessageCircle className="w-5 h-5" />
        コメント ({comments.length})
      </h3>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={userId ? 'コメントを入力...' : 'コメントするにはログインしてください'}
          disabled={!userId || isSubmitting}
          className="w-full p-4 border border-[#E0F7F1] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#5DDFC3] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!userId || !newComment.trim() || isSubmitting}
            className="inline-flex items-center gap-2 bg-[#5DDFC3] text-white px-6 py-2 rounded-full font-medium hover:bg-[#4ECFB3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </div>
      </form>

      {/* コメント一覧 */}
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          まだコメントはありません。最初のコメントを投稿してみましょう！
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-[#E0F7F1] rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E0F7F1] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#5DDFC3]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#3A405A]">
                      {comment.user_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
                {userId === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="mt-3 text-[#3A405A] whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
