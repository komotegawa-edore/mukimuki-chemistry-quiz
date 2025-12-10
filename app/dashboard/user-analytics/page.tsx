import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import UserAnalyticsView from './UserAnalyticsView'

export default async function UserAnalyticsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  const supabase = await createClient()

  // ユーザー一覧を取得（流入元情報付き）
  const { data: users } = await supabase
    .from('mukimuki_profiles')
    .select('id, name, nickname, created_at, referrer_source, referrer_detail, role')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  // 流入元別の集計
  const sourceCounts: Record<string, number> = {}
  users?.forEach((user) => {
    const source = user.referrer_source || 'unknown'
    sourceCounts[source] = (sourceCounts[source] || 0) + 1
  })

  // MBTI経由の登録数を取得
  const { count: mbtiConversions } = await supabase
    .from('mukimuki_mbti_results')
    .select('*', { count: 'exact', head: true })
    .not('converted_user_id', 'is', null)

  return (
    <div className="min-h-screen bg-[#F4F9F7]">
      <Header
        title="ユーザー流入分析"
        rightContent={
          <Link
            href="/dashboard"
            className="text-[#5DDFC3] hover:text-[#4ECFB3] font-medium text-sm transition-colors"
          >
            ← ダッシュボードに戻る
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <UserAnalyticsView
          users={users || []}
          sourceCounts={sourceCounts}
          mbtiConversions={mbtiConversions || 0}
        />
      </main>
    </div>
  )
}
