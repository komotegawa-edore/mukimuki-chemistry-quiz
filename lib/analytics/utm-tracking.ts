// UTM パラメータ追跡システム

export interface UTMParams {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  ttclid: string | null // TikTok Click ID
  landing_page?: string
  referrer?: string
  timestamp?: string
}

const UTM_STORAGE_KEY = 'roopy_utm_params'
const UTM_EXPIRY_DAYS = 30 // 30日間保持

// UTMパラメータを保存
export function saveUTMParams(params: Partial<UTMParams>) {
  if (typeof window === 'undefined') return

  const existingParams = getUTMParams()

  const utmData: UTMParams = {
    utm_source: params.utm_source || existingParams?.utm_source || null,
    utm_medium: params.utm_medium || existingParams?.utm_medium || null,
    utm_campaign: params.utm_campaign || existingParams?.utm_campaign || null,
    utm_content: params.utm_content || existingParams?.utm_content || null,
    utm_term: params.utm_term || existingParams?.utm_term || null,
    ttclid: params.ttclid || existingParams?.ttclid || null,
    landing_page: params.landing_page || existingParams?.landing_page || window.location.pathname,
    referrer: params.referrer || existingParams?.referrer || document.referrer || undefined,
    timestamp: params.timestamp || existingParams?.timestamp || new Date().toISOString(),
  }

  // LocalStorageに保存
  localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({
    data: utmData,
    expiry: Date.now() + UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  }))

  // Cookieにも保存（クロスセッション用）
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + UTM_EXPIRY_DAYS)
  document.cookie = `${UTM_STORAGE_KEY}=${encodeURIComponent(JSON.stringify(utmData))}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`

  return utmData
}

// UTMパラメータを取得
export function getUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null

  // まずLocalStorageから試す
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY)
    if (stored) {
      const { data, expiry } = JSON.parse(stored)
      if (Date.now() < expiry) {
        return data
      }
      // 期限切れなら削除
      localStorage.removeItem(UTM_STORAGE_KEY)
    }
  } catch {
    // エラーは無視
  }

  // Cookieから試す
  try {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === UTM_STORAGE_KEY && value) {
        return JSON.parse(decodeURIComponent(value))
      }
    }
  } catch {
    // エラーは無視
  }

  return null
}

// UTMパラメータをクリア
export function clearUTMParams() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(UTM_STORAGE_KEY)
  document.cookie = `${UTM_STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

// 広告ソースを判定
export function getAdSource(params: UTMParams | null): string {
  if (!params) return 'direct'

  if (params.ttclid) return 'tiktok'
  if (params.utm_source?.toLowerCase().includes('tiktok')) return 'tiktok'
  if (params.utm_source?.toLowerCase().includes('instagram')) return 'instagram'
  if (params.utm_source?.toLowerCase().includes('facebook')) return 'facebook'
  if (params.utm_source?.toLowerCase().includes('google')) return 'google'
  if (params.utm_source?.toLowerCase().includes('twitter') || params.utm_source?.toLowerCase().includes('x')) return 'twitter'
  if (params.utm_source?.toLowerCase().includes('youtube')) return 'youtube'
  if (params.utm_source) return params.utm_source

  // Referrerから判定
  if (params.referrer) {
    const referrer = params.referrer.toLowerCase()
    if (referrer.includes('tiktok.com')) return 'tiktok'
    if (referrer.includes('instagram.com')) return 'instagram'
    if (referrer.includes('facebook.com')) return 'facebook'
    if (referrer.includes('google.')) return 'google'
    if (referrer.includes('twitter.com') || referrer.includes('x.com')) return 'twitter'
    if (referrer.includes('youtube.com')) return 'youtube'
  }

  return 'organic'
}

// コンバージョンデータを構築
export function buildConversionData(eventName: string, eventData?: Record<string, unknown>) {
  const utmParams = getUTMParams()
  const adSource = getAdSource(utmParams)

  return {
    event_name: eventName,
    event_time: new Date().toISOString(),
    ad_source: adSource,
    utm_source: utmParams?.utm_source || null,
    utm_medium: utmParams?.utm_medium || null,
    utm_campaign: utmParams?.utm_campaign || null,
    utm_content: utmParams?.utm_content || null,
    utm_term: utmParams?.utm_term || null,
    ttclid: utmParams?.ttclid || null,
    landing_page: utmParams?.landing_page || null,
    referrer: utmParams?.referrer || null,
    first_touch_time: utmParams?.timestamp || null,
    ...eventData,
  }
}
