import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST: クイズ回答提出（生徒用）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quest_id } = await params
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // リクエストボディ取得
    const body = await request.json()
    const { answers } = body // answers: [{ question_id: number, answer: number }]

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 })
    }

    // クエスト情報取得
    const { data: quest, error: questError } = await supabase
      .from('mukimuki_temporary_quests')
      .select('*')
      .eq('id', quest_id)
      .single()

    if (questError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // 問題一覧取得
    const { data: questions, error: questionsError } = await supabase
      .from('mukimuki_temporary_quest_questions')
      .select('*')
      .eq('quest_id', quest_id)
      .order('order_num', { ascending: true })

    if (questionsError || !questions) {
      return NextResponse.json({ error: 'Questions not found' }, { status: 404 })
    }

    // 採点処理
    let score = 0
    let total_points = 0
    const detailedAnswers = []

    for (const question of questions) {
      total_points += question.points

      const userAnswer = answers.find(a => a.question_id === question.id)
      const isCorrect = userAnswer && userAnswer.answer === question.correct_answer

      if (isCorrect) {
        score += question.points
      }

      detailedAnswers.push({
        question_id: question.id,
        answer: userAnswer ? userAnswer.answer : null,
        correct: isCorrect,
        correct_answer: question.correct_answer,
        points: question.points,
        earned_points: isCorrect ? question.points : 0
      })
    }

    // 正答率計算
    const percentage = Math.round((score / total_points) * 100)
    const is_cleared = percentage >= quest.passing_score

    // 初回クリアチェック
    const { data: previousResults } = await supabase
      .from('mukimuki_temporary_quest_results')
      .select('is_cleared')
      .eq('user_id', user.id)
      .eq('quest_id', quest_id)
      .eq('is_cleared', true)
      .limit(1)

    const is_first_clear = is_cleared && (!previousResults || previousResults.length === 0)

    // 報酬ポイント付与判定
    const reward_points_awarded = is_first_clear ? quest.reward_points : 0

    // 結果を保存
    const { data: result, error: saveError } = await supabase
      .from('mukimuki_temporary_quest_results')
      .insert({
        user_id: user.id,
        quest_id: parseInt(quest_id),
        score,
        total_points,
        percentage,
        is_cleared,
        is_first_clear,
        reward_points_awarded,
        answers: detailedAnswers
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save result:', saveError)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    // 初回クリア時、プロフィールのポイントを更新
    if (is_first_clear && reward_points_awarded > 0) {
      const { data: profile } = await supabase
        .from('mukimuki_profiles')
        .select('chapter_clear_points')
        .eq('id', user.id)
        .single()

      if (profile) {
        await supabase
          .from('mukimuki_profiles')
          .update({
            chapter_clear_points: profile.chapter_clear_points + reward_points_awarded
          })
          .eq('id', user.id)
      }
    }

    return NextResponse.json({
      result: {
        ...result,
        quest_title: quest.title,
        quest_passing_score: quest.passing_score
      }
    })

  } catch (error) {
    console.error('Unexpected error in POST /api/temporary-quests/[id]/submit:', error)
    return NextResponse.json({ error: 'Failed to submit answers' }, { status: 500 })
  }
}
