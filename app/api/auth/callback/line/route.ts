import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // エラーチェック
  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=line_auth_no_code`
    )
  }

  // CSRF対策: stateを検証
  const cookieStore = await cookies()
  const savedState = cookieStore.get('line_oauth_state')?.value

  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=line_auth_invalid_state`
    )
  }

  // stateクッキーを削除
  cookieStore.delete('line_oauth_state')

  try {
    // 1. アクセストークンを取得
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/line`,
        client_id: process.env.LINE_CHANNEL_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('LINE token error:', errorData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=line_token_failed`
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. ユーザープロフィールを取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!profileResponse.ok) {
      console.error('LINE profile error')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=line_profile_failed`
      )
    }

    const profile = await profileResponse.json()

    // 3. Supabaseでユーザーを作成または認証
    const supabase = await createClient()

    // LINEのuserIdを使ってメールアドレスを生成（LINEはメールを返さない場合がある）
    const email = `line_${profile.userId}@line.app`
    // セキュアなパスワードを生成（LINEのuserIdとシークレットを組み合わせ）
    const password = `${profile.userId}_${process.env.LINE_CHANNEL_SECRET}`

    // まず既存ユーザーでログインを試みる
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // ログインに失敗した場合、原因を確認
      // "Invalid login credentials" または "Email not confirmed" の場合のみ新規作成を試みる
      if (signInError.message?.includes('Invalid login credentials') ||
          signInError.message?.includes('User not found') ||
          signInError.message?.includes('Email not confirmed')) {

        // Admin APIを使用してメール確認をスキップしてユーザーを作成
        const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // メール確認をスキップ
          user_metadata: {
            name: profile.displayName,
            role: 'student', // LINEログインは生徒アカウントのみ
            avatar_url: profile.pictureUrl,
            line_user_id: profile.userId,
            provider: 'line',
          },
        })

        if (signUpError) {
          console.error('Supabase signup error:', signUpError)

          // レート制限エラーの場合は専用メッセージ
          if (signUpError.status === 429) {
            return NextResponse.redirect(
              `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=rate_limit`
            )
          }

          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=signup_failed`
          )
        }

        // 新規ユーザー作成成功、通常のクライアントでログイン
        console.log('New LINE user created:', signUpData.user?.id)

        // Admin APIで作成したユーザーでログイン
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          console.error('Login after signup error:', loginError)
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=line_auth_failed`
          )
        }
      } else {
        // その他のエラー（パスワード間違いなど）
        console.error('Login error:', signInError)
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=line_auth_failed`
        )
      }
    } else {
      // 既存ユーザーでログイン成功
      console.log('Existing LINE user logged in:', signInData.user?.id)
    }

    // ログイン成功、ホームへリダイレクト
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/`)
  } catch (error) {
    console.error('LINE login error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=line_auth_failed`
    )
  }
}
