import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import CSVImport from '@/components/CSVImport'
import DashboardContent from '@/components/DashboardContent'
import DailyMissionSettings from '@/components/DailyMissionSettings'
import ServiceSettings from '@/components/ServiceSettings'
import Header from '@/components/Header'
import { BookOpen, ArrowRight, Trophy, Bell, Zap, Users, FileText } from 'lucide-react'

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
      <Header
        title="講師ダッシュボード"
        rightContent={
          <form action={handleLogout}>
            <button
              type="submit"
              className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap text-black"
            >
              ログアウト
            </button>
          </form>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ガイドとランキングへのリンク */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/guide"
            className="block bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  問題管理ガイド
                </h2>
                <p className="text-white opacity-90 text-sm">
                  CSV一括インポート、問題の管理方法、定着率の見方などを解説
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </Link>

          <Link
            href="/dashboard/rankings"
            className="block bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  ユーザーランキング
                </h2>
                <p className="text-white opacity-90 text-sm">
                  プレゼント企画用：順位、名前、メールアドレスを表示
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </Link>

          <Link
            href="/dashboard/announcements"
            className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  お知らせ管理
                </h2>
                <p className="text-white opacity-90 text-sm">
                  生徒に表示するお知らせを作成・編集・削除
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </Link>

          <Link
            href="/dashboard/temporary-quests"
            className="block bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  臨時クエスト
                </h2>
                <p className="text-white opacity-90 text-sm">
                  期間限定の特別クエストを作成・管理
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </Link>

          <Link
            href="/dashboard/blog-referrals"
            className="block bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  ブログ流入分析
                </h2>
                <p className="text-white opacity-90 text-sm">
                  どのブログ記事から登録されたかを分析
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </Link>

          <Link
            href="/dashboard/user-analytics"
            className="block bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  ユーザー流入分析
                </h2>
                <p className="text-white opacity-90 text-sm">
                  新規ユーザーの流入元を確認
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        {/* システム設定 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">システム設定</h2>
          <div className="space-y-4">
            <ServiceSettings />
            <DailyMissionSettings />
          </div>
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
