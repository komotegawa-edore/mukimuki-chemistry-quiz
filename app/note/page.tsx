import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoteHomeContent from '@/components/note/NoteHomeContent'

export default async function NotePage() {
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

  // 今日の学習記録
  const today = new Date().toISOString().split('T')[0]
  const { data: todayEntry } = await supabase
    .from('roopynote_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .single()

  // 最新のつぶやき
  const { data: posts } = await supabase
    .from('roopynote_posts')
    .select(`
      *,
      profile:roopynote_profiles(id, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  // 自分のいいね
  const { data: myLikes } = await supabase
    .from('roopynote_likes')
    .select('post_id')
    .eq('user_id', user.id)

  const likedPostIds = new Set(myLikes?.map(l => l.post_id) || [])

  return (
    <NoteHomeContent
      profile={profile}
      todayEntry={todayEntry}
      posts={posts || []}
      likedPostIds={likedPostIds}
      userId={user.id}
    />
  )
}
