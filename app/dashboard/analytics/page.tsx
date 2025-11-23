import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import AnalyticsTabView from '@/components/AnalyticsTabView'
import Header from '@/components/Header'

export default async function AnalyticsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="定着率分析"
        rightContent={
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← ダッシュボードに戻る
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnalyticsTabView />
      </main>
    </div>
  )
}
