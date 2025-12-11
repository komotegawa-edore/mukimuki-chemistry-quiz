import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export interface Subscription {
  id: number
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive'
  plan_type: 'monthly' | 'yearly'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// ユーザーのサブスクリプション状態を取得
export async function getUserSubscription(): Promise<Subscription | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('mukimuki_english_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data as Subscription | null
}

// ユーザーが有効なサブスクリプションを持っているかチェック
export async function hasActiveSubscription(): Promise<boolean> {
  const subscription = await getUserSubscription()

  if (!subscription) return false

  // アクティブまたはトライアル中
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    return true
  }

  // キャンセル済みでも期間内ならアクセス可能
  if (subscription.status === 'canceled' && subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end)
    return endDate > new Date()
  }

  return false
}

// サブスクリプション状態を確認（サーバーサイド専用）
export async function checkSubscriptionStatus(userId: string): Promise<{
  hasAccess: boolean
  subscription: Subscription | null
}> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabaseAdmin
    .from('mukimuki_english_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  const subscription = data as Subscription | null

  if (!subscription) {
    return { hasAccess: false, subscription: null }
  }

  let hasAccess = false

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    hasAccess = true
  } else if (subscription.status === 'canceled' && subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end)
    hasAccess = endDate > new Date()
  }

  return { hasAccess, subscription }
}
