import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface QuestionWithChapter {
  id: number
  question_text: string
  chapter_id: number
  correct_answer: string
  mukimuki_chapters: {
    id: number
    title: string
    order_num: number
    subject_id: number
    subject: {
      id: number
      name: string
      display_order: number
    } | null
  } | null
}

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

    // 全ての問題を取得（教科情報も含む）
    const { data: rawQuestions } = await supabase
      .from('mukimuki_questions')
      .select('id, question_text, chapter_id, correct_answer, mukimuki_chapters(id, title, order_num, subject_id, subject:mukimuki_subjects(id, name, display_order))')
      .order('chapter_id')

    const questions = rawQuestions as QuestionWithChapter[] | null

    // 全ての生徒を取得
    const { data: students } = await supabase
      .from('mukimuki_profiles')
      .select('id, name')
      .eq('role', 'student')
      .order('name')

    // 全てのテスト結果を取得（answersを含む）
    const { data: results } = await supabase
      .from('mukimuki_test_results')
      .select('user_id, answers')

    // 問題ごとの正答データを集計
    // questionId -> studentId -> { isCorrect: boolean, attempts: number }
    const questionStats = new Map<
      number,
      Map<string, { correct: number; total: number }>
    >()

    results?.forEach((result) => {
      if (!result.answers) return

      const answers = result.answers as Record<string, string>
      Object.entries(answers).forEach(([questionId, studentAnswer]) => {
        const qId = parseInt(questionId)
        const question = questions?.find((q) => q.id === qId)
        if (!question) return

        if (!questionStats.has(qId)) {
          questionStats.set(qId, new Map())
        }

        const studentMap = questionStats.get(qId)!
        if (!studentMap.has(result.user_id)) {
          studentMap.set(result.user_id, { correct: 0, total: 0 })
        }

        const stats = studentMap.get(result.user_id)!
        stats.total += 1
        if (studentAnswer === question.correct_answer) {
          stats.correct += 1
        }
      })
    })

    // レスポンス形式に整形
    const masteryData = questions?.map((question) => {
      const studentResults: Record<
        string,
        { correct: number; total: number; percentage: number }
      > = {}

      students?.forEach((student) => {
        const stats = questionStats.get(question.id)?.get(student.id)
        if (stats) {
          studentResults[student.id] = {
            correct: stats.correct,
            total: stats.total,
            percentage: Math.round((stats.correct / stats.total) * 100),
          }
        } else {
          studentResults[student.id] = {
            correct: 0,
            total: 0,
            percentage: 0,
          }
        }
      })

      const subjectData = question.mukimuki_chapters?.subject
      return {
        questionId: question.id,
        questionText: question.question_text,
        chapterId: question.chapter_id,
        chapterTitle: question.mukimuki_chapters?.title || '',
        chapterOrderNum: question.mukimuki_chapters?.order_num || 0,
        subjectId: question.mukimuki_chapters?.subject_id || 0,
        subjectName: subjectData?.name || '',
        subjectDisplayOrder: subjectData?.display_order || 0,
        studentResults,
      }
    })

    return NextResponse.json({
      questions: masteryData,
      students: students || [],
    })
  } catch (error) {
    console.error('Failed to fetch question mastery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question mastery' },
      { status: 500 }
    )
  }
}
