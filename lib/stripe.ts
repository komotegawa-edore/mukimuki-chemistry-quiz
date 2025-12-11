import Stripe from 'stripe'

// サーバーサイド用Stripeインスタンス
// 環境変数が未設定の場合はダミー値を使用（ビルド時のエラー回避）
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})

// 価格ID（Stripeダッシュボードで作成後に設定）
export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
}

// プラン詳細
export const PLAN_DETAILS = {
  monthly: {
    name: '月額プラン',
    price: 980,
    interval: 'month' as const,
  },
  yearly: {
    name: '年間プラン',
    price: 9800,
    interval: 'year' as const,
  },
}
