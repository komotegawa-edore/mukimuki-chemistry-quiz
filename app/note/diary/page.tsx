import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoteHeader from '@/components/note/NoteHeader'
import NoteBottomNav from '@/components/note/NoteBottomNav'
import DiaryContent from '@/components/note/DiaryContent'

export default async function NoteDiaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/note/login')
  }

  // 今月の記録を取得
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const { data: entries } = await supabase
    .from('roopynote_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', firstDay.toISOString().split('T')[0])
    .lte('entry_date', lastDay.toISOString().split('T')[0])
    .order('entry_date', { ascending: false })

  // 今日の記録
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries?.find((e) => e.entry_date === today) || null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NoteHeader title="学習記録" />
      <DiaryContent
        entries={entries || []}
        todayEntry={todayEntry}
        userId={user.id}
        currentMonth={now}
      />
      <NoteBottomNav />
    </div>
  )
}
