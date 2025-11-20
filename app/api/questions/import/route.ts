import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'

interface CSVRow {
  chapter_id: string
  question_text: string
  choice_a: string
  choice_b: string
  choice_c: string
  choice_d: string
  correct_answer: string
  explanation?: string
}

interface ImportResult {
  success: number
  errors: Array<{ row: number; error: string }>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 講師権限確認
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
      return NextResponse.json({ error: 'Teacher access required' }, { status: 403 })
    }

    // CSVテキストを取得
    const body = await request.json()
    const { csvText } = body

    if (!csvText) {
      return NextResponse.json({ error: 'CSV data is required' }, { status: 400 })
    }

    // CSVをパース
    const parseResult = Papa.parse<CSVRow>(csvText, {
      header: true,
      delimiter: ',',
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'CSV parsing error',
          details: parseResult.errors.map((err) => ({
            row: err.row,
            error: err.message,
          })),
        },
        { status: 400 }
      )
    }

    const rows = parseResult.data
    const result: ImportResult = {
      success: 0,
      errors: [],
    }

    // バリデーションとインポート
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2 // ヘッダー + 0-indexed

      try {
        // バリデーション
        const chapterId = parseInt(row.chapter_id)
        if (isNaN(chapterId) || chapterId < 1 || chapterId > 33) {
          throw new Error(`章ID ${row.chapter_id} は無効です（1-33の範囲で指定してください）`)
        }

        if (!row.question_text || !row.question_text.trim()) {
          throw new Error('問題文は必須です')
        }

        if (!row.choice_a || !row.choice_b || !row.choice_c || !row.choice_d) {
          throw new Error('すべての選択肢（A-D）は必須です')
        }

        const correctAnswer = row.correct_answer.trim().toUpperCase()
        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
          throw new Error(
            `正解 "${row.correct_answer}" は無効です（A, B, C, D のいずれかを指定してください）`
          )
        }

        // 章の存在確認
        const { data: chapter, error: chapterError } = await supabase
          .from('mukimuki_chapters')
          .select('id')
          .eq('id', chapterId)
          .single()

        if (chapterError || !chapter) {
          throw new Error(`章ID ${chapterId} は存在しません`)
        }

        // 問題を挿入
        const { error: insertError } = await supabase
          .from('mukimuki_questions')
          .insert({
            chapter_id: chapterId,
            question_text: row.question_text.trim(),
            choice_a: row.choice_a.trim(),
            choice_b: row.choice_b.trim(),
            choice_c: row.choice_c.trim(),
            choice_d: row.choice_d.trim(),
            correct_answer: correctAnswer as 'A' | 'B' | 'C' | 'D',
            explanation: row.explanation?.trim() || null,
            updated_by: user.id,
          })

        if (insertError) {
          throw new Error(`データベースエラー: ${insertError.message}`)
        }

        result.success++
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    )
  }
}
