import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ユーザー獲得データの記録・更新API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      event_type, // 'signup' | 'subscription'
      utm_data,
      subscription_data,
    } = body

    if (!user_id || !event_type) {
      return NextResponse.json(
        { error: 'user_id and event_type are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (event_type === 'signup') {
      // サインアップ時：ファーストタッチ情報を記録
      const { error } = await supabaseAdmin
        .from('english_user_acquisition')
        .upsert({
          user_id,
          first_touch_source: utm_data?.utm_source || null,
          first_touch_medium: utm_data?.utm_medium || null,
          first_touch_campaign: utm_data?.utm_campaign || null,
          first_touch_content: utm_data?.utm_content || null,
          first_touch_term: utm_data?.utm_term || null,
          first_touch_ttclid: utm_data?.ttclid || null,
          first_touch_landing_page: utm_data?.landing_page || null,
          first_touch_referrer: utm_data?.referrer || null,
          first_touch_time: utm_data?.timestamp || new Date().toISOString(),
          signup_date: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        })

      if (error) {
        console.error('Signup acquisition error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else if (event_type === 'subscription') {
      // サブスクリプション時：コンバージョン情報を記録
      const planValue = getPlanValue(subscription_data?.plan_type)

      const { error } = await supabaseAdmin
        .from('english_user_acquisition')
        .update({
          conversion_source: utm_data?.utm_source || null,
          conversion_medium: utm_data?.utm_medium || null,
          conversion_campaign: utm_data?.utm_campaign || null,
          conversion_content: utm_data?.utm_content || null,
          conversion_term: utm_data?.utm_term || null,
          conversion_ttclid: utm_data?.ttclid || null,
          subscription_date: new Date().toISOString(),
          subscription_plan: subscription_data?.plan_type || null,
          subscription_value: planValue,
          is_subscribed: true,
        })
        .eq('user_id', user_id)

      if (error) {
        console.error('Subscription conversion error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else if (event_type === 'churn') {
      // 解約時
      const { error } = await supabaseAdmin
        .from('english_user_acquisition')
        .update({
          is_churned: true,
          churn_date: new Date().toISOString(),
        })
        .eq('user_id', user_id)

      if (error) {
        console.error('Churn tracking error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Conversion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// プランの価値（円）を取得
function getPlanValue(planType: string | undefined): number {
  switch (planType) {
    case 'monthly':
      return 980
    case 'yearly':
      return 9800
    case 'early_discount':
      return 450
    default:
      return 0
  }
}
