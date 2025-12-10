import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'
import AnalyticsTabView from '@/components/AnalyticsTabView'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'

type ListeningChapterStat = {
  chapterId: number
  title: string
  orderNum: number
  uniqueUsers: number
  totalAttempts: number
  avgScore: number | null
}

export default async function AnalyticsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  const listeningStats = await getListeningChapterStats()

  return (
    <div className="min-h-screen bg-[#F4F9F7]">
      <Header
        title="定着率分析"
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
        <AnalyticsTabView />
        <ListeningProgressSection stats={listeningStats} />
      </main>
    </div>
  )
}

async function getListeningChapterStats(): Promise<ListeningChapterStat[]> {
  const supabase = await createClient()

  const { data: chapters, error } = await supabase
    .from('mukimuki_chapters')
    .select('id, title, order_num')
    .eq('subject_id', 3)
    .order('order_num')

  if (error || !chapters || chapters.length === 0) {
    if (error) {
      console.error('Failed to fetch listening chapters', error)
    }
    return []
  }

  const chapterIds = chapters.map((chapter) => chapter.id)

  const { data: results, error: resultsError } = await supabase
    .from('mukimuki_test_results')
    .select('chapter_id, user_id, score, total')
    .in('chapter_id', chapterIds)

  if (resultsError) {
    console.error('Failed to fetch listening test results', resultsError)
  }

  const statsMap = new Map<
    number,
    {
      uniqueUsers: Set<string>
      attempts: number
      scoreSum: number
      scoreCount: number
    }
  >()

  results?.forEach((result) => {
    if (!statsMap.has(result.chapter_id)) {
      statsMap.set(result.chapter_id, {
        uniqueUsers: new Set(),
        attempts: 0,
        scoreSum: 0,
        scoreCount: 0,
      })
    }

    const stats = statsMap.get(result.chapter_id)!
    stats.uniqueUsers.add(result.user_id)
    stats.attempts += 1

    if (result.total && result.total > 0) {
      stats.scoreSum += (result.score / result.total) * 100
      stats.scoreCount += 1
    }
  })

  return chapters.map((chapter) => {
    const stats = statsMap.get(chapter.id)
    const avgScore =
      stats && stats.scoreCount > 0
        ? Math.round((stats.scoreSum / stats.scoreCount) * 10) / 10
        : null

    return {
      chapterId: chapter.id,
      title: chapter.title,
      orderNum: chapter.order_num,
      uniqueUsers: stats ? stats.uniqueUsers.size : 0,
      totalAttempts: stats?.attempts ?? 0,
      avgScore,
    }
  })
}

function ListeningProgressSection({ stats }: { stats: ListeningChapterStat[] }) {
  const hasAnyAttempts = stats.some((stat) => stat.totalAttempts > 0)

  const getBadgeColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-500'
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <section className="mt-12">
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#E0F7F1]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#3A405A] mb-2">リスニング実施状況</h3>
          <p className="text-sm text-[#3A405A] opacity-70">
            subject_id=3（chapter_id: 47 ~ 76）のセットごとの受験人数と平均正答率を確認できます。
          </p>
        </div>

        {stats.length === 0 ? (
          <p className="text-sm text-gray-500">リスニング章がまだ登録されていません。</p>
        ) : (
          <>
            {!hasAnyAttempts && (
              <p className="text-sm text-gray-500 mb-4">
                まだリスニング問題の受験履歴がありません。
              </p>
            )}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">章</th>
                    <th className="px-4 py-3 text-right font-semibold text-black">ユニーク受験者</th>
                    <th className="px-4 py-3 text-right font-semibold text-black">受験回数</th>
                    <th className="px-4 py-3 text-right font-semibold text-black">平均正答率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.map((chapter) => (
                    <tr key={chapter.chapterId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-black">
                        <p className="font-medium">{chapter.title}</p>
                        <p className="text-xs text-gray-500">第{chapter.orderNum}章</p>
                      </td>
                      <td className="px-4 py-3 text-right text-black font-semibold">
                        {chapter.uniqueUsers}
                      </td>
                      <td className="px-4 py-3 text-right text-black">{chapter.totalAttempts}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getBadgeColor(
                            chapter.avgScore
                          )}`}
                        >
                          {chapter.avgScore !== null ? `${chapter.avgScore}%` : 'データなし'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
