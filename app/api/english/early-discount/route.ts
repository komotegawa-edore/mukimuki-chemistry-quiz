import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // クーポンが設定されていない場合は対象外
    if (!process.env.STRIPE_EARLY_COUPON_ID) {
      return NextResponse.json({ available: false })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // アクティブなサブスクリプション数をカウント
    const { count } = await supabaseAdmin
      .from('mukimuki_english_subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing'])

    const currentCount = count ?? 0
    const remaining = Math.max(0, 100 - currentCount)
    const available = remaining > 0

    return NextResponse.json({
      available,
      remaining,
      discountedPrice: 450,
      originalPrice: 980,
    })
  } catch (error) {
    console.error('Early discount check error:', error)
    return NextResponse.json({ available: false })
  }
}
