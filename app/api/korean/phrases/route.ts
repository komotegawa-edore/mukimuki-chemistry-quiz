import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { KoreanPhrase, KoreanPhraseRow, KoreanCategory } from '@/lib/types/database'

// フレーズをクイズ用に変換
function toQuizPhrase(row: KoreanPhraseRow): KoreanPhrase {
  // 正解と誤答をシャッフル
  const allChoices = [row.japanese_meaning, ...row.wrong_choices]
  const shuffled = shuffleArray([...allChoices])
  const correctIndex = shuffled.indexOf(row.japanese_meaning)

  return {
    id: row.id,
    koreanText: row.korean_text,
    japaneseMeaning: row.japanese_meaning,
    romanization: row.romanization,
    audioUrl: row.audio_url,
    choices: shuffled,
    correctIndex,
    category: row.category,
    difficultyLevel: row.difficulty_level,
  }
}

// 配列をシャッフル
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category') as KoreanCategory | null
    const count = parseInt(searchParams.get('count') || '10', 10)
    const shuffle = searchParams.get('shuffle') !== 'false'
    const audioOnly = searchParams.get('audioOnly') === 'true'

    let query = supabase
      .from('mukimuki_korean_phrases')
      .select('*')
      .eq('is_published', true)

    if (category) {
      query = query.eq('category', category)
    }

    // リスニングモード：音声ありのみ
    if (audioOnly) {
      query = query.not('audio_url', 'is', null)
    }

    query = query.limit(count)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching Korean phrases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch phrases' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        phrases: [],
        total: 0,
      })
    }

    // シャッフルして返す
    const phrases = shuffle ? shuffleArray(data) : data
    const quizPhrases = phrases.map(toQuizPhrase)

    return NextResponse.json({
      phrases: quizPhrases,
      total: quizPhrases.length,
    })
  } catch (error) {
    console.error('Error in Korean phrases API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
