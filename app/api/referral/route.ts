import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: 自分の招待コードと紹介統計を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // プロフィールから招待コードを取得
    const { data: profile, error: profileError } = await supabase
      .from('mukimuki_profiles')
      .select('referral_code, bonus_daily_quests, referred_by, referral_completed')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    // 招待機能の設定を取得
    const { data: allSettings } = await supabase
      .from('mukimuki_system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'referral_excluded_user_ids',
        'referral_enabled',
        'referral_valid_until',
        'referral_campaign_title',
        'referral_campaign_description'
      ])

    const settingsMap: Record<string, string> = {}
    allSettings?.forEach(s => {
      settingsMap[s.setting_key] = s.setting_value
    })

    // 招待機能が無効の場合
    if (settingsMap['referral_enabled'] === 'false') {
      return NextResponse.json({ isDisabled: true })
    }

    // 有効期限チェック
    const validUntil = settingsMap['referral_valid_until']
    if (validUntil && new Date(validUntil) < new Date()) {
      return NextResponse.json({ isExpired: true })
    }

    // 除外ユーザーチェック
    let isExcluded = false
    if (settingsMap['referral_excluded_user_ids']) {
      try {
        const excludedIds = JSON.parse(settingsMap['referral_excluded_user_ids'])
        isExcluded = Array.isArray(excludedIds) && excludedIds.includes(user.id)
      } catch {
        // JSON parse error - ignore
      }
    }

    // 除外ユーザーの場合は非表示フラグを返す
    if (isExcluded) {
      return NextResponse.json({ isExcluded: true })
    }

    // キャンペーン情報
    const campaignTitle = settingsMap['referral_campaign_title'] || '友達紹介キャンペーン'
    const campaignDescription = settingsMap['referral_campaign_description'] || ''

    // 紹介統計を取得
    const { data: stats, error: statsError } = await supabase.rpc('get_referral_stats', {
      p_user_id: user.id,
    })

    if (statsError) {
      console.error('Referral stats error:', statsError)
    }

    const referralStats = stats && stats.length > 0 ? stats[0] : null

    // 紹介した人のリストを取得
    const { data: referrals, error: referralsError } = await supabase
      .from('mukimuki_referrals')
      .select(`
        id,
        status,
        created_at,
        completed_at,
        referred:referred_id(id, name)
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('Referrals fetch error:', referralsError)
    }

    return NextResponse.json({
      referralCode: profile.referral_code,
      bonusDailyQuests: profile.bonus_daily_quests || 0,
      totalReferrals: referralStats?.total_referrals || 0,
      completedReferrals: referralStats?.completed_referrals || 0,
      pendingReferrals: referralStats?.pending_referrals || 0,
      referrals: referrals || [],
      campaignTitle,
      campaignDescription,
      validUntil: validUntil || null,
    })

  } catch (error) {
    console.error('Referral GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
