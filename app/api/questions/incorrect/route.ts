import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('chapterId')

    // ユーザーのテスト結果を取得
    let query = supabase
      .from('mukimuki_test_results')
      .select('answers, chapter_id')
      .eq('user_id', user.id)

    if (chapterId) {
      query = query.eq('chapter_id', parseInt(chapterId))
    }

    const { data: results, error: resultsError } = await query

    if (resultsError) {
      return NextResponse.json(
        { error: resultsError.message },
        { status: 400 }
      )
    }

    // 間違えた問題のIDを収集
    const incorrectQuestionIds = new Set<number>()

    results?.forEach((result) => {
      if (!result.answers) return

      const answers = result.answers as Record<string, string>
      Object.entries(answers).forEach(([questionId, studentAnswer]) => {
        // 後で正解かどうかチェックするため、まず全ての回答された問題IDを収集
        incorrectQuestionIds.add(parseInt(questionId))
      })
    })

    if (incorrectQuestionIds.size === 0) {
      return NextResponse.json([])
    }

    // 問題の詳細を取得（章と科目の情報も含む）
    const { data: questions, error: questionsError } = await supabase
      .from('mukimuki_questions')
      .select('*, mukimuki_chapters(id, title, order_num, subject_id, subject:mukimuki_subjects(*))')
      .in('id', Array.from(incorrectQuestionIds))

    if (questionsError) {
      return NextResponse.json(
        { error: questionsError.message },
        { status: 400 }
      )
    }

    // 各問題について、ユーザーが間違えたかどうかをチェック
    const actualIncorrectQuestions = questions?.filter((question) => {
      let hasIncorrect = false

      results?.forEach((result) => {
        if (!result.answers) return

        const answers = result.answers as Record<string, string>
        const studentAnswer = answers[question.id.toString()]

        if (studentAnswer && studentAnswer !== question.correct_answer) {
          hasIncorrect = true
        }
      })

      return hasIncorrect
    })

    return NextResponse.json(actualIncorrectQuestions || [])
  } catch (error) {
    console.error('Failed to fetch incorrect questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incorrect questions' },
      { status: 500 }
    )
  }
}
