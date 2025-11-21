import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import CSVImport from '@/components/CSVImport'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  const supabase = await createClient()

  // 全章を取得
  const { data: chapters } = await supabase
    .from('mukimuki_chapters')
    .select('*')
    .order('order_num')

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-black">講師ダッシュボード</h1>
          <form action={handleLogout}>
            <button
              type="submit"
              className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <CSVImport />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">章管理</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters?.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/dashboard/questions/${chapter.id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-black">{chapter.title}</h3>
                    <span className="text-sm text-black">#{chapter.order_num}</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">問題を管理 →</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">分析</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <Link
              href="/dashboard/analytics"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div>
                <h3 className="font-semibold text-black mb-1">生徒の定着率</h3>
                <p className="text-sm text-gray-600">
                  章別・問題別の定着率を確認できます
                </p>
              </div>
              <span className="text-blue-600 font-semibold">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
