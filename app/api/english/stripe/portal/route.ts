import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    // ユーザー認証確認
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Service role clientでサブスクリプション情報を取得
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // サブスクリプション情報を取得
    const { data: subscription } = await supabaseAdmin
      .from('mukimuki_english_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Stripe Customer Portalセッションを作成
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/english/account`,
      })

      return NextResponse.json({ url: portalSession.url })
    } catch (stripeError: unknown) {
      // Stripe顧客が見つからない場合、DBのサブスクリプション情報をクリア
      if (stripeError && typeof stripeError === 'object' && 'code' in stripeError && stripeError.code === 'resource_missing') {
        console.error('Stripe customer not found, clearing subscription data')

        await supabaseAdmin
          .from('mukimuki_english_subscriptions')
          .delete()
          .eq('user_id', user.id)

        return NextResponse.json(
          { error: 'Subscription data was invalid and has been cleared. Please subscribe again.' },
          { status: 404 }
        )
      }
      throw stripeError
    }
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
