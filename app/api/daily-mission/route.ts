import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type MissionRow = {
  id: number
  chapter_id: number
  time_limit_seconds: number | null
  reward_points: number | null
  chapter: {
    title: string | null
    subject_id: number | null
    subject:
      | { name: string | null }[]
      | { name: string | null }
      | null
  } | null
}

type ChapterRow = {
  id: number
  title: string
  subject_id: number
}

// 動的ルートとして明示
export const dynamic = 'force-dynamic'

// GET: 今日のデイリーミッションを取得（なければ生成）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // デイリーミッション機能が有効かチェック
    const { data: settings } = await supabase
      .from('mukimuki_system_settings')
      .select('setting_value')
      .eq('setting_key', 'daily_mission_enabled')
      .single()

    if (!settings || settings.setting_value !== 'true') {
      return NextResponse.json({ mission: null, disabled: true }, { status: 200 })
    }

    const mission = await getOrCreateDailyMission(supabase, user.id)

    if (!mission) {
      return NextResponse.json({ error: 'ミッションが見つかりません' }, { status: 404 })
    }

    const formattedMission = formatMissionResponse(mission)

    return NextResponse.json({
      mission: formattedMission,
    })
  } catch (error) {
    console.error('Daily mission GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

async function getOrCreateDailyMission(
  supabase: SupabaseServerClient,
  userId: string
) {
  const today = getTodayDateString()

  // 既存のミッションを確認
  const existingMission = await fetchMissionForDate(supabase, userId, today)
  if (existingMission) {
    return existingMission
  }

  // 教科の表示順に従って章を選択（リスニング優先）
  const selectedChapter = await pickChapterBySubjectPriority(supabase)
  if (!selectedChapter) {
    return null
  }

  const { data, error } = await supabase
    .from('mukimuki_daily_missions')
    .insert({
      user_id: userId,
      chapter_id: selectedChapter.id,
      mission_date: today,
      time_limit_seconds: 300,
      reward_points: 3,
      status: 'active',
    })
    .select(`
      id,
      chapter_id,
      time_limit_seconds,
      reward_points,
      chapter:mukimuki_chapters(
        title,
        subject_id,
        subject:mukimuki_subjects(name)
      )
    `)
    .single()

  if (error) {
    // すでに作成済みの場合（競合）は既存データを返す
    if ((error as { code?: string }).code === '23505') {
      return await fetchMissionForDate(supabase, userId, today)
    }
    console.error('Failed to insert daily mission:', error)
    throw error
  }

  return data as unknown as MissionRow
}

async function fetchMissionForDate(
  supabase: SupabaseServerClient,
  userId: string,
  date: string
) {
  const { data, error } = await supabase
    .from('mukimuki_daily_missions')
    .select(
      `
        id,
        chapter_id,
        time_limit_seconds,
        reward_points,
        chapter:mukimuki_chapters(
          title,
          subject_id,
          subject:mukimuki_subjects(name)
        )
      `
    )
    .eq('user_id', userId)
    .eq('mission_date', date)
    .eq('status', 'active')
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch daily mission:', error)
    throw error
  }

  if (!data) {
    return null
  }
  return data as unknown as MissionRow
}

async function pickChapterBySubjectPriority(supabase: SupabaseServerClient) {
  const { data: subjects, error: subjectsError } = await supabase
    .from('mukimuki_subjects')
    .select('id')
    .order('display_order')

  if (subjectsError) {
    console.error('Failed to fetch subjects for mission:', subjectsError)
    throw subjectsError
  }

  const subjectPriority = (subjects || []).map((subject) => subject.id)

  const { data: chapters, error: chaptersError } = await supabase
    .from('mukimuki_chapters')
    .select('id, title, subject_id')
    .eq('is_published', true)

  if (chaptersError) {
    console.error('Failed to fetch chapters for mission:', chaptersError)
    throw chaptersError
  }

  const chapterList = chapters as ChapterRow[] | null

  if (!chapterList || chapterList.length === 0) {
    return null
  }

  for (const subjectId of subjectPriority) {
    const candidates = chapterList.filter((chapter) => chapter.subject_id === subjectId)
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
  }

  // フォールバック：教科に関わらずランダムで1章選択
  return chapterList[Math.floor(Math.random() * chapterList.length)]
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0]
}

function formatMissionResponse(mission: MissionRow) {
  const subjectData = mission.chapter?.subject
  const normalizedSubject = Array.isArray(subjectData)
    ? subjectData[0]
    : subjectData

  const timeLimitSeconds = mission.time_limit_seconds ?? 300

  return {
    id: mission.id,
    chapter_id: mission.chapter_id,
    chapter_title: mission.chapter?.title ?? '',
    subject_name: normalizedSubject?.name ?? '',
    time_limit_seconds: timeLimitSeconds,
    reward_points: mission.reward_points ?? 3,
    time_limit_minutes: Math.floor(timeLimitSeconds / 60),
  }
}
