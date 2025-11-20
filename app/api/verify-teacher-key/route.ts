import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json()

    // 環境変数から講師用キーを取得
    const validKey = process.env.TEACHER_REGISTRATION_KEY

    if (!validKey) {
      return NextResponse.json(
        { error: 'サーバー設定エラー: 講師用キーが設定されていません' },
        { status: 500 }
      )
    }

    // キーを検証
    if (key !== validKey) {
      return NextResponse.json(
        { error: '講師用キーが正しくありません' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Teacher key verification error:', error)
    return NextResponse.json(
      { error: '検証中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
