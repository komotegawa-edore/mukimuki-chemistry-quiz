import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import CSVImport from '@/components/CSVImport'
import DashboardContent from '@/components/DashboardContent'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  const supabase = await createClient()

  // 教科一覧を取得
  const { data: subjects } = await supabase
    .from('mukimuki_subjects')
    .select('*')
    .order('display_order')

  // 全章を取得（教科情報も含む）
  const { data: chapters } = await supabase
    .from('mukimuki_chapters')
    .select('*, subject:mukimuki_subjects(*)')
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
        {/* ガイドへのリンク */}
        <div className="mb-8">
          <Link
            href="/dashboard/guide"
            className="block bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <span>📚</span>
                  問題管理ガイド
                </h2>
                <p className="text-green-50 text-sm">
                  CSV一括インポート、問題の管理方法、定着率の見方などを解説
                </p>
              </div>
              <span className="text-white text-2xl">→</span>
            </div>
          </Link>
        </div>

        <div className="mb-8">
          <CSVImport />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">問題管理</h2>
          <DashboardContent
            subjects={subjects || []}
            chapters={chapters || []}
          />
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
