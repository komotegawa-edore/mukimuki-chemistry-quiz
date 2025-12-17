import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoteHeader from '@/components/note/NoteHeader'
import NoteBottomNav from '@/components/note/NoteBottomNav'
import GoalsContent from '@/components/note/GoalsContent'

export default async function NoteGoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/note/login')
  }

  // 目標を取得（アクティブなもの）
  const { data: goals } = await supabase
    .from('roopynote_goals')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active', 'completed'])
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NoteHeader title="目標" />
      <GoalsContent goals={goals || []} userId={user.id} />
      <NoteBottomNav />
    </div>
  )
}
