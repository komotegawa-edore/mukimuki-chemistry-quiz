import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 講師権限チェック
    const { data: profile } = await supabase
      .from('mukimuki_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isTeacher = profile?.role === 'teacher'

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const chapterId = searchParams.get('chapterId')

    // 権限チェック: 生徒は自分のデータのみ閲覧可能
    if (userId && userId !== user.id && !isTeacher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ユーザーIDが指定されていない場合は自分のデータ
    const targetUserId = (isTeacher && userId) ? userId : user.id

    let query = supabase
      .from('mukimuki_test_results')
      .select('*, mukimuki_chapters(id, title, order_num)')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    if (chapterId) {
      const chapterIdNum = parseInt(chapterId)
      if (!Number.isInteger(chapterIdNum) || chapterIdNum <= 0) {
        return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 })
      }
      query = query.eq('chapter_id', chapterIdNum)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch results:', error)
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in GET /api/results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('POST /api/results: No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { chapter_id, score, total, answers } = body

    console.log('POST /api/results:', {
      user_id: user.id,
      chapter_id,
      score,
      total,
      answersCount: Object.keys(answers || {}).length,
    })

    // 章から教科IDを取得
    const { data: chapter, error: chapterError } = await supabase
      .from('mukimuki_chapters')
      .select('subject_id')
      .eq('id', chapter_id)
      .single()

    if (chapterError || !chapter) {
      console.error('Failed to fetch chapter:', chapterError)
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    console.log('Chapter subject_id:', chapter.subject_id)

    // テスト結果を保存
    const { data, error } = await supabase
      .from('mukimuki_test_results')
      .insert({
        user_id: user.id,
        chapter_id,
        subject_id: chapter.subject_id,
        score,
        total,
        answers,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to insert test result:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Test result saved successfully:', data.id)

    // 100%達成の場合、ポイントを付与（1日1回のみ）
    let pointsAwarded = false
    let newBadges: any[] = []
    if (score === total && score > 0) {
      console.log('Perfect score! Attempting to award points...')

      const { error: pointError } = await supabase
        .from('mukimuki_chapter_clears')
        .insert({
          user_id: user.id,
          chapter_id,
          points: 1,
        })

      if (pointError) {
        console.log('Point insert error:', pointError)
        if (pointError.code === '23505') {
          console.log('Points already awarded today for this chapter')
        } else {
          console.error('Unexpected error awarding points:', pointError)
        }
      } else {
        console.log('Points awarded successfully!')
        pointsAwarded = true

        // ポイントを獲得した場合、バッジチェック
        const { data: badges, error: badgeError } = await supabase.rpc('check_and_award_badges', {
          target_user_id: user.id,
        })

        if (badgeError) {
          console.error('Badge check failed:', badgeError)
        } else {
          newBadges = badges || []
          console.log('Badges checked:', newBadges.length, 'new badges')
        }
      }
    }

    return NextResponse.json(
      { ...data, pointsAwarded, newBadges },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/results - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to create result', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
