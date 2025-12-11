import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { priceType } = await request.json()

    if (!priceType || !['monthly', 'yearly'].includes(priceType)) {
      return NextResponse.json(
        { error: 'Invalid price type' },
        { status: 400 }
      )
    }

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

    // 既存のサブスクリプションを確認
    const { data: existingSub } = await supabaseAdmin
      .from('mukimuki_english_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let customerId = existingSub?.stripe_customer_id

    // Stripe顧客が存在しない場合は作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // サブスクリプションレコードを作成/更新
      await supabaseAdmin
        .from('mukimuki_english_subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          status: 'inactive',
        }, {
          onConflict: 'user_id',
        })
    }

    // 価格IDを取得
    const priceId = priceType === 'monthly'
      ? STRIPE_PRICES.monthly
      : STRIPE_PRICES.yearly

    // Checkout Sessionを作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/english/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/lp/english`,
      metadata: {
        user_id: user.id,
        plan_type: priceType,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: priceType,
        },
      },
      locale: 'ja',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
