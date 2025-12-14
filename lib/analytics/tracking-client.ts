'use client'

import { tiktokEvents } from './tiktok-pixel'
import { getUTMParams, buildConversionData, getAdSource } from './utm-tracking'

// セッションID管理
const SESSION_KEY = 'roopy_session_id'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

// トラッキングAPIにイベントを送信
async function sendTrackingEvent(eventName: string, eventData?: Record<string, unknown>) {
  try {
    const utmParams = getUTMParams()
    const adSource = getAdSource(utmParams)

    await fetch('/api/english/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        session_id: getSessionId(),
        ad_source: adSource,
        utm_source: utmParams?.utm_source,
        utm_medium: utmParams?.utm_medium,
        utm_campaign: utmParams?.utm_campaign,
        utm_content: utmParams?.utm_content,
        utm_term: utmParams?.utm_term,
        ttclid: utmParams?.ttclid,
        page_path: typeof window !== 'undefined' ? window.location.pathname : null,
        landing_page: utmParams?.landing_page,
        referrer: utmParams?.referrer,
        event_data: eventData,
      }),
    })
  } catch (error) {
    console.error('Tracking error:', error)
  }
}

// コンバージョンデータを送信
async function sendConversionEvent(
  userId: string,
  eventType: 'signup' | 'subscription' | 'churn',
  subscriptionData?: { plan_type: string }
) {
  try {
    const utmParams = getUTMParams()

    await fetch('/api/english/analytics/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        event_type: eventType,
        utm_data: utmParams,
        subscription_data: subscriptionData,
      }),
    })
  } catch (error) {
    console.error('Conversion tracking error:', error)
  }
}

// エクスポートする統合トラッキング関数
export const analytics = {
  // ページビュー
  pageView: () => {
    sendTrackingEvent('page_view')
    tiktokEvents.pageView()
  },

  // ユーザー登録
  signup: async (userId: string, email?: string) => {
    await sendTrackingEvent('signup', { user_id: userId })
    await sendConversionEvent(userId, 'signup')
    tiktokEvents.completeRegistration({ email })
  },

  // ログイン
  login: (userId: string) => {
    sendTrackingEvent('login', { user_id: userId })
    tiktokEvents.identify({ external_id: userId })
  },

  // サブスクリプション開始
  subscriptionStart: async (
    userId: string,
    params: { value: number; plan_type: string; order_id?: string }
  ) => {
    await sendTrackingEvent('subscription_start', {
      user_id: userId,
      value: params.value,
      plan_type: params.plan_type,
    })
    await sendConversionEvent(userId, 'subscription', { plan_type: params.plan_type })
    tiktokEvents.completePurchase({
      value: params.value,
      plan_type: params.plan_type,
      order_id: params.order_id,
    })
  },

  // サブスクリプション開始（チェックアウト開始時）
  initiateCheckout: (params: { value: number; plan_type: string }) => {
    sendTrackingEvent('cta_click', {
      button_name: 'checkout',
      plan_type: params.plan_type,
    })
    tiktokEvents.initiateCheckout(params)
  },

  // サブスクリプション解約
  subscriptionCancel: async (userId: string) => {
    await sendTrackingEvent('subscription_cancel', { user_id: userId })
    await sendConversionEvent(userId, 'churn')
  },

  // ニュース再生
  newsPlay: (params: { news_id: string; news_title: string; category?: string }) => {
    sendTrackingEvent('news_play', params)
    tiktokEvents.viewContent({
      content_id: params.news_id,
      content_name: params.news_title,
      category: params.category,
    })
  },

  // ニュース視聴完了
  newsComplete: (params: { news_id: string; news_title: string; duration?: number }) => {
    sendTrackingEvent('news_complete', params)
  },

  // CTAクリック
  ctaClick: (buttonName: string, additionalData?: Record<string, unknown>) => {
    sendTrackingEvent('cta_click', { button_name: buttonName, ...additionalData })
    tiktokEvents.clickButton({ button_name: buttonName })
  },

  // フォーム送信
  formSubmit: (formName: string, additionalData?: Record<string, unknown>) => {
    sendTrackingEvent('form_submit', { form_name: formName, ...additionalData })
    tiktokEvents.submitForm({ form_name: formName })
  },

  // 先着割引表示
  earlyDiscountView: () => {
    sendTrackingEvent('early_discount_view')
  },

  // カスタムイベント
  custom: (eventName: string, eventData?: Record<string, unknown>) => {
    sendTrackingEvent(eventName, eventData)
    tiktokEvents.custom(eventName, eventData)
  },

  // コンバージョンデータ取得（デバッグ用）
  getConversionData: (eventName: string) => {
    return buildConversionData(eventName)
  },
}
