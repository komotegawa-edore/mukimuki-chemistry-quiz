import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/juku-admin/login?error=oauth_failed`)
    }

    // ユーザーが新規作成された場合、プロフィールを確認/作成
    if (data?.user) {
      const { data: profile } = await supabase
        .from('juku_owner_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // プロフィールが存在しない場合は作成
      if (!profile) {
        const { error: insertError } = await supabase
          .from('juku_owner_profiles')
          .insert({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'オーナー',
            email: data.user.email || '',
          })

        if (insertError) {
          console.error('Profile creation error:', insertError)
        }
      }
    }
  }

  // juku-admin ダッシュボードへリダイレクト
  return NextResponse.redirect(`${origin}/juku-admin`)
}
