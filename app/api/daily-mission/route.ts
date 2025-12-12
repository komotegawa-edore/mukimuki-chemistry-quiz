import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const DUAL_MISSION_SUBJECTS = [3, 1] // 3: Listening, 1: 無機化学

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type MissionRow = {
  id: number
  chapter_id: number
  time_limit_seconds: number | null
  reward_points: number | null
  chapter: {
    id: number | null
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

type MissionResponse = ReturnType<typeof formatMissionResponse>

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
      return NextResponse.json({ missions: [], disabled: true }, { status: 200 })
    }

    const missions = await getOrCreateDailyMissions(supabase, user.id, DUAL_MISSION_SUBJECTS)

    if (missions.length === 0) {
      return NextResponse.json({ missions: [] }, { status: 200 })
    }

    const formatted = missions.map(formatMissionResponse)

    return NextResponse.json({
      missions: formatted,
    })
  } catch (error) {
    console.error('Daily mission GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

async function getOrCreateDailyMissions(
  supabase: SupabaseServerClient,
  userId: string,
  subjectPriority: number[]
) {
  const today = getTodayDateString()
  const existingMissions = await fetchMissionsForDate(supabase, userId, today)

  const missionsBySubject = new Map<number, MissionRow>()
  existingMissions.forEach((mission) => {
    const subjectId = mission.chapter?.subject_id ?? undefined
    if (subjectId) {
      missionsBySubject.set(subjectId, mission)
    }
  })

  const ensuredMissions: MissionRow[] = []

  for (const subjectId of subjectPriority) {
    let mission: MissionRow | null | undefined = missionsBySubject.get(subjectId)
    if (!mission) {
      mission = await createMissionForSubject(supabase, userId, today, subjectId)
      if (mission) {
        missionsBySubject.set(subjectId, mission)
      }
    }

    if (mission) {
      ensuredMissions.push(mission)
    }
  }

  return ensuredMissions
}

async function fetchMissionsForDate(
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
          id,
          title,
          subject_id,
          subject:mukimuki_subjects(name)
        )
      `
    )
    .eq('user_id', userId)
    .eq('mission_date', date)
    .eq('status', 'active')

  if (error) {
    console.error('Failed to fetch daily missions:', error)
    throw error
  }

  return ((data ?? []) as unknown as MissionRow[])
}

async function createMissionForSubject(
  supabase: SupabaseServerClient,
  userId: string,
  date: string,
  subjectId: number
) {
  const chapter = await pickChapterForSubject(supabase, subjectId)
  if (!chapter) {
    return null
  }

  // 既にミッションが存在する場合は再取得する（競合対策）
  const existing = await fetchMissionsForDate(supabase, userId, date)
  const existingForSubject = existing.find((m) => m.chapter?.subject_id === subjectId)
  if (existingForSubject) {
    return existingForSubject
  }

  const { data, error } = await supabase
    .from('mukimuki_daily_missions')
    .insert({
      user_id: userId,
      chapter_id: chapter.id,
      mission_date: date,
      time_limit_seconds: 300,
      reward_points: 3,
      status: 'active',
    })
    .select(
      `
        id,
        chapter_id,
        time_limit_seconds,
        reward_points,
        chapter:mukimuki_chapters(
          id,
          title,
          subject_id,
          subject:mukimuki_subjects(name)
        )
      `
    )
    .single()

  if (error) {
    // UNIQUE違反は競合時に発生するので、再取得して返す
    if (error.code === '23505') {
      const missions = await fetchMissionsForDate(supabase, userId, date)
      return missions.find((mission) => mission.chapter?.subject_id === subjectId) ?? null
    }
    console.error('Failed to insert daily mission:', error)
    throw error
  }

  return data as unknown as MissionRow
}

async function pickChapterForSubject(
  supabase: SupabaseServerClient,
  subjectId: number
) {
  const { data, error } = await supabase
    .from('mukimuki_chapters')
    .select('id, title, subject_id')
    .eq('subject_id', subjectId)
    .eq('is_published', true)

  if (error) {
    console.error('Failed to fetch chapters for subject', subjectId, error)
    throw error
  }

  const chapters = data as ChapterRow[] | null
  if (!chapters || chapters.length === 0) {
    return null
  }

  return chapters[Math.floor(Math.random() * chapters.length)]
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
    subject_id: mission.chapter?.subject_id ?? 0,
    subject_name: normalizedSubject?.name ?? '',
    time_limit_seconds: timeLimitSeconds,
    reward_points: mission.reward_points ?? 3,
    time_limit_minutes: Math.floor(timeLimitSeconds / 60),
  }
}
