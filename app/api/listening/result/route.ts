import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ListeningResultRequest {
  questionId: string
  isCorrect: boolean
  userAnswer: number
  timeSpent?: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ListeningResultRequest = await request.json()
    const { questionId, isCorrect, userAnswer, timeSpent } = body

    if (!questionId || typeof isCorrect !== 'boolean' || typeof userAnswer !== 'number') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // 今日すでに完了しているかチェック
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingResults } = await supabase
      .from('mukimuki_listening_results')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
      .limit(1)

    const isFirstToday = !existingResults || existingResults.length === 0
    const pointsEarned = isFirstToday ? 3 : 0

    // 結果を保存
    const { error: insertError } = await supabase
      .from('mukimuki_listening_results')
      .insert({
        user_id: user.id,
        question_id: questionId,
        is_correct: isCorrect,
        user_answer: userAnswer,
        time_spent: timeSpent || null,
        points_earned: pointsEarned,
      })

    if (insertError) {
      console.error('Failed to insert listening result:', insertError)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    // ポイントはlistening_resultsのpoints_earnedカラムに保存済み
    // get_user_rank関数で自動的に合算される

    return NextResponse.json({
      success: true,
      pointsEarned,
      isFirstToday,
    })
  } catch (error) {
    console.error('Listening result API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
