import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/line`

  if (!channelId) {
    return NextResponse.json(
      { error: 'LINE設定が不完全です' },
      { status: 500 }
    )
  }

  // CSRF対策用のstateを生成
  const state = crypto.randomUUID()

  // stateをクッキーに保存（セキュアに管理）
  const cookieStore = await cookies()
  cookieStore.set('line_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10分
    path: '/',
  })

  // LINE認証URLを構築
  const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', channelId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('scope', 'profile openid email')

  return NextResponse.redirect(authUrl.toString())
}
