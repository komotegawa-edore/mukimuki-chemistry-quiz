'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
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

interface PostComposerProps {
  onClose: () => void
  onPost: (post: Post) => void
  profile: Profile | null
}

export default function PostComposer({ onClose, onPost, profile }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxLength = 280
  const remaining = maxLength - content.length

  const handleSubmit = async () => {
    if (!content.trim() || !profile) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('roopynote_posts')
        .insert({
          user_id: profile.id,
          content: content.trim(),
        })
        .select()
        .single()

      if (insertError) {
        setError('投稿に失敗しました')
        setIsLoading(false)
        return
      }

      // 新しい投稿を親コンポーネントに渡す
      onPost({
        ...data,
        profile: {
          id: profile.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        },
      })
    } catch {
      setError('投稿に失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800">つぶやく</h2>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isLoading || content.length > maxLength}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '投稿'
            )}
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex gap-3">
            {/* アバター */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile?.display_name.charAt(0).toUpperCase() || '?'
              )}
            </div>

            {/* テキストエリア */}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="いま何してる？"
                className="w-full min-h-[120px] resize-none border-none focus:ring-0 text-gray-800 placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              title="画像を追加（準備中）"
              disabled
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>

          <div
            className={`text-sm ${
              remaining < 0
                ? 'text-red-500'
                : remaining < 20
                ? 'text-amber-500'
                : 'text-gray-400'
            }`}
          >
            {remaining}
          </div>
        </div>
      </div>
    </div>
  )
}
