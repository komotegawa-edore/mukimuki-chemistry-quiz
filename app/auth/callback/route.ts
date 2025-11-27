import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
    if (data?.user && referrerId) {
      console.log('OAuth callback - user:', data.user.id, 'referrerId:', referrerId)

      // RLSをバイパスするためにサービスロールキーを使用
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: profile } = await supabaseAdmin
        .from('mukimuki_profiles')
        .select('id, referred_by')
        .eq('id', data.user.id)
        .single()

      console.log('OAuth callback - existing profile:', profile)

      // プロフィールが存在しない場合は作成（招待者情報も含める）
      if (!profile) {
        console.log('Creating new profile with referrer:', referrerId)
        const { error: insertError } = await supabaseAdmin
          .from('mukimuki_profiles')
          .insert({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'ユーザー',
            role: 'student',
            referred_by: referrerId,
            bonus_daily_quests: 1,
          })

        if (insertError) {
          console.error('Profile creation error:', insertError)
        } else {
          // 紹介レコードを作成
          const { error: referralError } = await supabaseAdmin
            .from('mukimuki_referrals')
            .insert({
              referrer_id: referrerId,
              referred_id: data.user.id,
              status: 'pending',
            })
          if (referralError) {
            console.error('Referral record creation error:', referralError)
          }
        }
      } else if (profile && !profile.referred_by) {
        // プロフィールは存在するがreferred_byがnullの場合は更新
        console.log('Updating existing profile with referrer:', referrerId)
        const { error: updateError } = await supabaseAdmin
          .from('mukimuki_profiles')
          .update({
            referred_by: referrerId,
            bonus_daily_quests: 1,
          })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Profile update error:', updateError)
        } else {
          // 紹介レコードを作成（重複チェック）
          const { data: existingReferral } = await supabaseAdmin
            .from('mukimuki_referrals')
            .select('id')
            .eq('referrer_id', referrerId)
            .eq('referred_id', data.user.id)
            .single()

          if (!existingReferral) {
            const { error: referralError } = await supabaseAdmin
              .from('mukimuki_referrals')
              .insert({
                referrer_id: referrerId,
                referred_id: data.user.id,
                status: 'pending',
              })
            if (referralError) {
              console.error('Referral record creation error:', referralError)
            }
          }
        }
      }
    }
  }

  // ログイン成功、ホームへリダイレクト
  return NextResponse.redirect(`${origin}/`)
}
