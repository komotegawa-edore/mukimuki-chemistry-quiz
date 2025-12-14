import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        hasAccess: false,
        subscription: null,
        reason: 'not_authenticated'
      })
    }

    const { data: subscription } = await supabase
      .from('mukimuki_english_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({
        hasAccess: false,
        subscription: null,
        reason: 'no_subscription'
      })
    }

    let hasAccess = false

    // アクティブまたはトライアル中
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      hasAccess = true
    }
    // キャンセル済みでも期間内ならアクセス可能
    else if (subscription.status === 'canceled' && subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end)
      hasAccess = endDate > new Date()
    }

    return NextResponse.json({
      hasAccess,
      subscription: {
        status: subscription.status,
        planType: subscription.plan_type,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    })
  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json(
      { hasAccess: false, subscription: null, error: 'Failed to check subscription' },
      { status: 500 }
    )
  }
}
