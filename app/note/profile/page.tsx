import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoteHeader from '@/components/note/NoteHeader'
import NoteBottomNav from '@/components/note/NoteBottomNav'
import ProfileContent from '@/components/note/ProfileContent'

export default async function NoteProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/note/login')
  }

  // プロフィール取得
  const { data: profile } = await supabase
    .from('roopynote_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 統計情報
  const { count: entriesCount } = await supabase
    .from('roopynote_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: postsCount } = await supabase
    .from('roopynote_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // フォロー/フォロワー数
  const { count: followingCount } = await supabase
    .from('roopynote_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id)

  const { count: followersCount } = await supabase
    .from('roopynote_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user.id)

  // 最近の投稿
  const { data: recentPosts } = await supabase
    .from('roopynote_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NoteHeader title="マイページ" />
      <ProfileContent
        profile={profile}
        stats={{
          entries: entriesCount || 0,
          posts: postsCount || 0,
          following: followingCount || 0,
          followers: followersCount || 0,
        }}
        recentPosts={recentPosts || []}
        isOwnProfile={true}
      />
      <NoteBottomNav />
    </div>
  )
}
