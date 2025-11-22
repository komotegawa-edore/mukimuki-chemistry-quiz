import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // 講師権限チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('mukimuki_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 全ての章を取得（教科情報も含む）
    const { data: chapters } = await supabase
      .from('mukimuki_chapters')
      .select('id, title, order_num, subject_id, subject:mukimuki_subjects(id, name, display_order)')
      .order('order_num')

    // 全ての生徒を取得
    const { data: students } = await supabase
      .from('mukimuki_profiles')
      .select('id, name')
      .eq('role', 'student')
      .order('name')

    // 全てのテスト結果を取得
    const { data: results } = await supabase
      .from('mukimuki_test_results')
      .select('user_id, chapter_id, score, total, created_at')

    // 章ごと・生徒ごとの統計を集計
    // chapterId -> studentId -> { totalCorrect, totalQuestions, attempts }
    const chapterStats = new Map<
      number,
      Map<string, { totalCorrect: number; totalQuestions: number; attempts: number }>
    >()

    results?.forEach((result) => {
      if (!chapterStats.has(result.chapter_id)) {
        chapterStats.set(result.chapter_id, new Map())
      }

      const studentMap = chapterStats.get(result.chapter_id)!
      if (!studentMap.has(result.user_id)) {
        studentMap.set(result.user_id, {
          totalCorrect: 0,
          totalQuestions: 0,
          attempts: 0,
        })
      }

      const stats = studentMap.get(result.user_id)!
      stats.totalCorrect += result.score
      stats.totalQuestions += result.total
      stats.attempts += 1
    })

    // レスポンス形式に整形
    const masteryData = chapters?.map((chapter) => {
      const studentResults: Record<
        string,
        {
          totalCorrect: number
          totalQuestions: number
          percentage: number
          attempts: number
        }
      > = {}

      students?.forEach((student) => {
        const stats = chapterStats.get(chapter.id)?.get(student.id)
        if (stats) {
          studentResults[student.id] = {
            totalCorrect: stats.totalCorrect,
            totalQuestions: stats.totalQuestions,
            percentage: Math.round(
              (stats.totalCorrect / stats.totalQuestions) * 100
            ),
            attempts: stats.attempts,
          }
        } else {
          studentResults[student.id] = {
            totalCorrect: 0,
            totalQuestions: 0,
            percentage: 0,
            attempts: 0,
          }
        }
      })

      const subjectData = Array.isArray(chapter.subject)
        ? chapter.subject[0]
        : chapter.subject as { id: number; name: string; display_order: number } | null

      return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterOrderNum: chapter.order_num,
        subjectId: chapter.subject_id,
        subjectName: subjectData?.name || '',
        subjectDisplayOrder: subjectData?.display_order || 0,
        studentResults,
      }
    })

    return NextResponse.json({
      chapters: masteryData,
      students: students || [],
    })
  } catch (error) {
    console.error('Failed to fetch chapter mastery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapter mastery' },
      { status: 500 }
    )
  }
}
