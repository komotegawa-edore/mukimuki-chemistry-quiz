import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PostDetailContent from '@/components/note/PostDetailContent'

interface PageProps {
  params: Promise<{ postId: string }>
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/note/login')
  }

  // 投稿を取得
  const { data: post, error } = await supabase
    .from('roopynote_posts')
    .select(`
      *,
      roopynote_profiles!roopynote_posts_user_id_fkey (
        id,
        display_name,
        avatar_url,
        target_university
      )
    `)
    .eq('id', postId)
    .single()

  if (error || !post) {
    notFound()
  }

  // いいね数を取得
  const { count: likesCount } = await supabase
    .from('roopynote_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  // ユーザーがいいねしているか確認
  const { data: userLike } = await supabase
    .from('roopynote_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  // コメントを取得
  const { data: comments } = await supabase
    .from('roopynote_comments')
    .select(`
      *,
      roopynote_profiles!roopynote_comments_user_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  // コメント数
  const { count: commentsCount } = await supabase
    .from('roopynote_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  return (
    <PostDetailContent
      post={{
        ...post,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
        is_liked: !!userLike,
      }}
      comments={comments || []}
      currentUserId={user.id}
    />
  )
}
