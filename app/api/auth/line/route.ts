import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const redirectUri = `${siteUrl}/api/auth/callback/line`

  console.log('LINE Auth - Channel ID:', channelId ? 'Set' : 'Not Set')
  console.log('LINE Auth - Channel Secret:', channelSecret ? 'Set' : 'Not Set')
  console.log('LINE Auth - Site URL:', siteUrl)

  if (!channelId || !channelSecret) {
    console.error('LINE環境変数が設定されていません')
    console.error('Channel ID:', channelId ? 'Set' : 'Not Set')
    console.error('Channel Secret:', channelSecret ? 'Set' : 'Not Set')

    // ユーザーにわかりやすいエラーメッセージを表示するためログインページへリダイレクト
    return NextResponse.redirect(
      `${siteUrl || 'http://localhost:3000'}/login?error=line_not_configured`
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
