import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const referrerId = requestUrl.searchParams.get('referrer_id')
  const origin = requestUrl.origin

  console.log('OAuth callback - referrerId:', referrerId, 'code:', code ? 'present' : 'missing')

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
    }

    // ユーザーが新規作成された場合、プロフィールを確認/作成
    if (data?.user) {
      console.log('OAuth callback - user:', data.user.id, 'referrerId:', referrerId)

      const { data: profile } = await supabase
        .from('mukimuki_profiles')
        .select('id, referred_by')
        .eq('id', data.user.id)
        .single()

      console.log('OAuth callback - existing profile:', profile)

      // プロフィールが存在しない場合は作成（招待者情報も含める）
      if (!profile) {
        console.log('Creating new profile with referrer:', referrerId)
        const { error: insertError } = await supabase
          .from('mukimuki_profiles')
          .insert({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'ユーザー',
            role: 'student',
            referred_by: referrerId || null,
            bonus_daily_quests: referrerId ? 1 : 0,
          })

        if (insertError) {
          console.error('Profile creation error:', insertError)
        } else if (referrerId) {
          await supabase
            .from('mukimuki_referrals')
            .insert({
              referrer_id: referrerId,
              referred_id: data.user.id,
              status: 'pending',
            })
        }
      } else if (profile && !profile.referred_by && referrerId) {
        // プロフィールは存在するがreferred_byがnullで、referrerIdがある場合は更新
        console.log('Updating existing profile with referrer:', referrerId)
        await supabase
          .from('mukimuki_profiles')
          .update({
            referred_by: referrerId,
            bonus_daily_quests: 1,
          })
          .eq('id', data.user.id)

        await supabase
          .from('mukimuki_referrals')
          .insert({
            referrer_id: referrerId,
            referred_id: data.user.id,
            status: 'pending',
          })
      }
    }
  }

  // ログイン成功、ホームへリダイレクト
  return NextResponse.redirect(`${origin}/`)
}
