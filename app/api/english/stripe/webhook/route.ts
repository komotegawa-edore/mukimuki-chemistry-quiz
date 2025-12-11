import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id

          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          const userId = session.metadata?.user_id
          const planType = session.metadata?.plan_type || 'monthly'

          if (userId) {
            const periodStart = 'current_period_start' in subscription
              ? new Date((subscription as any).current_period_start * 1000).toISOString()
              : null
            const periodEnd = 'current_period_end' in subscription
              ? new Date((subscription as any).current_period_end * 1000).toISOString()
              : null

            await supabaseAdmin
              .from('mukimuki_english_subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
                stripe_price_id: subscription.items.data[0]?.price.id,
                status: subscription.status,
                plan_type: planType,
                current_period_start: periodStart,
                current_period_end: periodEnd,
                cancel_at_period_end: subscription.cancel_at_period_end,
              }, {
                onConflict: 'user_id',
              })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (userId) {
          const periodStart = 'current_period_start' in subscription
            ? new Date((subscription as any).current_period_start * 1000).toISOString()
            : null
          const periodEnd = 'current_period_end' in subscription
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : null

          await supabaseAdmin
            .from('mukimuki_english_subscriptions')
            .update({
              status: subscription.status,
              stripe_price_id: subscription.items.data[0]?.price.id,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabaseAdmin
          .from('mukimuki_english_subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const sub = (invoice as any).subscription
        const subscriptionId = typeof sub === 'string' ? sub : sub?.id

        if (subscriptionId) {
          await supabaseAdmin
            .from('mukimuki_english_subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const sub = (invoice as any).subscription
        const subscriptionId = typeof sub === 'string' ? sub : sub?.id

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          const periodStart = 'current_period_start' in subscription
            ? new Date((subscription as any).current_period_start * 1000).toISOString()
            : null
          const periodEnd = 'current_period_end' in subscription
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : null

          await supabaseAdmin
            .from('mukimuki_english_subscriptions')
            .update({
              status: subscription.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
            })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
