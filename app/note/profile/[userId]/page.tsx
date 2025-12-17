import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import NoteBottomNav from '@/components/note/NoteBottomNav'
import UserProfileContent from '@/components/note/UserProfileContent'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/note/login')
  }

  // 自分のプロフィールなら /note/profile へリダイレクト
  if (userId === user.id) {
    redirect('/note/profile')
  }

  // ユーザープロフィール取得
  const { data: profile, error } = await supabase
    .from('roopynote_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    notFound()
  }

  // 非公開プロフィールのチェック
  if (!profile.is_public) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
          <div className="flex items-center h-14 px-4">
            <Link href="/note" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="font-bold text-gray-800 ml-2">プロフィール</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
          <p className="text-gray-500 text-center">このプロフィールは非公開です</p>
        </div>
        <NoteBottomNav />
      </div>
    )
  }

  // 統計情報
  const { count: entriesCount } = await supabase
    .from('roopynote_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: postsCount } = await supabase
    .from('roopynote_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // フォロー/フォロワー数
  const { count: followingCount } = await supabase
    .from('roopynote_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  const { count: followersCount } = await supabase
    .from('roopynote_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  // 自分がフォローしているか
  const { data: followStatus } = await supabase
    .from('roopynote_follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single()

  // 最近の投稿
  const { data: recentPosts } = await supabase
    .from('roopynote_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="flex items-center h-14 px-4">
          <Link href="/note" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-bold text-gray-800 ml-2">{profile.display_name}</h1>
        </div>
      </header>
      <UserProfileContent
        profile={profile}
        stats={{
          entries: entriesCount || 0,
          posts: postsCount || 0,
          following: followingCount || 0,
          followers: followersCount || 0,
        }}
        recentPosts={recentPosts || []}
        isFollowing={!!followStatus}
        currentUserId={user.id}
      />
      <NoteBottomNav />
    </div>
  )
}
