# LINEログインの実装ガイド

## 重要な注意事項

**Supabaseは現在、LINEログインをネイティブでサポートしていません。**

LINEログインを実装するには、以下の2つの方法があります：

## 方法1: カスタムOAuthプロバイダーとして実装（推奨）

この方法では、LINE Login APIを直接使用し、取得したユーザー情報をSupabaseに連携します。

### 必要な手順

#### 1. LINE Developersでアプリを登録

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. 新規プロバイダーを作成
3. 新規チャネルを作成（LINE Login）
4. チャネル基本設定で以下を取得：
   - Channel ID
   - Channel Secret
5. コールバックURLを設定：
   - 開発: `http://localhost:3000/api/auth/callback/line`
   - 本番: `https://your-app.vercel.app/api/auth/callback/line`

#### 2. 環境変数の設定

`.env.local` に追加：

```env
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
```

#### 3. APIルートの実装

`app/api/auth/line/route.ts` を作成：

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/line`
  const state = crypto.randomUUID() // CSRF対策

  // stateをセッションに保存（本番環境では適切な方法で）
  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=profile%20openid%20email`

  return NextResponse.redirect(authUrl)
}
```

`app/api/auth/callback/line/route.ts` を作成：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect('/login?error=no_code')
  }

  // stateの検証（CSRF対策）
  // ... state検証ロジック

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

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. ユーザープロフィールを取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const profile = await profileResponse.json()

    // 3. Supabaseでユーザーを作成または取得
    const supabase = await createClient()

    // LINEのuserIdを使ってメールアドレスを生成（LINEはメールを返さない場合がある）
    const email = `line_${profile.userId}@line.app`

    // Supabaseにユーザーを作成（既存の場合はログイン）
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: profile.userId, // LINEのuserIdをパスワードとして使用
    })

    if (authError) {
      // ユーザーが存在しない場合は作成
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: profile.userId,
        options: {
          data: {
            name: profile.displayName,
            role: 'student', // LINEログインは生徒のみ
            avatar_url: profile.pictureUrl,
            line_user_id: profile.userId,
          },
        },
      })

      if (signUpError) {
        return NextResponse.redirect('/login?error=signup_failed')
      }
    }

    return NextResponse.redirect('/')
  } catch (error) {
    console.error('LINE login error:', error)
    return NextResponse.redirect('/login?error=line_auth_failed')
  }
}
```

#### 4. ログインボタンの追加

`app/login/page.tsx` に追加：

```tsx
<button
  onClick={() => window.location.href = '/api/auth/line'}
  className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
  LINEでログイン
</button>
```

## 方法2: Supabaseの他のOAuthプロバイダーを使用（簡易代替案）

LINEログインの実装が複雑な場合、Supabaseがネイティブにサポートしている以下のプロバイダーを使用することを検討してください：

### サポートされているプロバイダー
- Google
- GitHub
- Facebook
- Twitter/X
- Discord
- Azure

### Googleログインの実装例

#### 1. Supabase Dashboardで設定

1. Supabase Dashboard → Authentication → Providers
2. Google を有効化
3. Google Cloud ConsoleでOAuth認証情報を作成
4. Client IDとClient Secretを取得してSupabaseに設定

#### 2. 環境変数（不要 - Supabaseが管理）

#### 3. コード実装

```tsx
// app/login/page.tsx
const handleGoogleLogin = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    setError('Googleログインに失敗しました')
  }
}

// ボタン
<button
  onClick={handleGoogleLogin}
  className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
>
  Googleでログイン
</button>
```

#### 4. コールバックハンドラー

```tsx
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(requestUrl.origin)
}
```

## 推奨事項

**開発の簡便性とセキュリティを考慮すると、Googleログイン（方法2）の使用を推奨します。**

理由：
1. Supabaseがネイティブにサポート
2. 実装が簡単
3. セキュリティ対策が標準で組み込まれている
4. メンテナンスが容易

LINEログインが必須の場合は、方法1を実装してください。ただし、以下の点に注意が必要です：
- CSRF対策（stateパラメータの検証）
- セッション管理
- エラーハンドリング
- LINEのAPI仕様変更への対応

## 次のステップ

どちらの方法を選択するか決定したら、実装を開始してください。質問があればお気軽にお問い合わせください。
