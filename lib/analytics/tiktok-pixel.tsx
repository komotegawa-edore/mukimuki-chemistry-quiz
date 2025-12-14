'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { saveUTMParams, getUTMParams } from './utm-tracking'

// TikTok Pixel ID（環境変数から取得）
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

// TikTok Pixel のグローバル型定義
declare global {
  interface Window {
    ttq: {
      load: (pixelId: string) => void
      page: () => void
      track: (event: string, params?: Record<string, unknown>) => void
      identify: (params: { email?: string; phone_number?: string; external_id?: string }) => void
    }
  }
}

// TikTok Pixel スクリプトコンポーネント
export function TikTokPixel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // UTMパラメータの保存とページビュー追跡
  useEffect(() => {
    // UTMパラメータを保存
    if (searchParams) {
      const utmParams = {
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_content: searchParams.get('utm_content'),
        utm_term: searchParams.get('utm_term'),
        ttclid: searchParams.get('ttclid'), // TikTok Click ID
      }

      // いずれかのパラメータがあれば保存
      if (Object.values(utmParams).some(v => v)) {
        saveUTMParams(utmParams)
      }
    }

    // TikTok Pixel ページビュー
    if (window.ttq && pathname?.startsWith('/english')) {
      window.ttq.page()
    }
  }, [pathname, searchParams])

  // TikTok Pixel IDがない場合はレンダリングしない
  if (!TIKTOK_PIXEL_ID) {
    return null
  }

  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;
            var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
            var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
            var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${TIKTOK_PIXEL_ID}');
            ttq.page();
          }(window, document, 'ttq');
        `,
      }}
    />
  )
}

// TikTok イベント追跡ユーティリティ
export const tiktokEvents = {
  // ページビュー（自動追跡されるが、手動でも呼べる）
  pageView: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page()
    }
  },

  // ユーザー登録完了
  completeRegistration: (params?: { email?: string }) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('CompleteRegistration', {
        content_name: 'Roopy English',
        ...params,
      })
    }
  },

  // サブスクリプション購入開始
  initiateCheckout: (params: { value: number; currency?: string; plan_type: string }) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('InitiateCheckout', {
        content_name: 'Roopy English Subscription',
        content_type: 'subscription',
        value: params.value,
        currency: params.currency || 'JPY',
        quantity: 1,
        description: params.plan_type,
      })
    }
  },

  // サブスクリプション購入完了
  completePurchase: (params: { value: number; currency?: string; plan_type: string; order_id?: string }) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('CompletePayment', {
        content_name: 'Roopy English Subscription',
        content_type: 'subscription',
        value: params.value,
        currency: params.currency || 'JPY',
        quantity: 1,
        description: params.plan_type,
        order_id: params.order_id,
      })
    }
  },

  // コンテンツ視聴（ニュース再生）
  viewContent: (params: { content_id: string; content_name: string; category?: string }) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ViewContent', {
        content_id: params.content_id,
        content_name: params.content_name,
        content_category: params.category,
        content_type: 'news',
      })
    }
  },

  // ボタンクリック（CTAなど）
  clickButton: (params: { button_name: string; page?: string }) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ClickButton', params)
    }
  },

  // フォーム送信
  submitForm: (params: { form_name: string }) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('SubmitForm', params)
    }
  },

  // カスタムイベント
  custom: (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track(eventName, params)
    }
  },

  // ユーザー識別（ログイン後に呼ぶ）
  identify: (params: { email?: string; external_id?: string }) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.identify(params)
    }
  },
}
