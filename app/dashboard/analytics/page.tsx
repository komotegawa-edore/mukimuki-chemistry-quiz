import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import AnalyticsTabView from '@/components/AnalyticsTabView'

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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← ダッシュボードに戻る
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-black">
              定着率分析
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnalyticsTabView />
      </main>
    </div>
  )
}
