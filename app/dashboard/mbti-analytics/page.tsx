import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import Header from '@/components/Header'
import MBTIAnalyticsView from './MBTIAnalyticsView'

export default async function MBTIAnalyticsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#F4F9F7]">
      <Header
        title="MBTI診断分析"
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
        <MBTIAnalyticsView />
      </main>
    </div>
  )
}
