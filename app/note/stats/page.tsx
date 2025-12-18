import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoteHeader from '@/components/note/NoteHeader'
import NoteBottomNav from '@/components/note/NoteBottomNav'
import StatsContent from '@/components/note/StatsContent'

export default async function NoteStatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/note/login')
  }

  // 過去30日の記録を取得
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: entries } = await supabase
    .from('roopynote_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('entry_date', { ascending: true })

  // 全期間の記録数
  const { count: totalEntries } = await supabase
    .from('roopynote_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 全期間の投稿数
  const { count: totalPosts } = await supabase
    .from('roopynote_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 達成した目標数
  const { count: completedGoals } = await supabase
    .from('roopynote_goals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NoteHeader title="統計" />
      <StatsContent
        entries={entries || []}
        totalEntries={totalEntries || 0}
        totalPosts={totalPosts || 0}
        completedGoals={completedGoals || 0}
      />
      <NoteBottomNav />
    </div>
  )
}
