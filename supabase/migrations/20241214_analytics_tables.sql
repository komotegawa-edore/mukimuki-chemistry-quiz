-- Roopy English 広告分析用テーブル
-- 実行方法: Supabase Dashboard > SQL Editor で実行

-- ============================================
-- 1. コンバージョンイベントテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS english_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 広告トラッキング
  ad_source TEXT,           -- 'tiktok', 'instagram', 'google', 'organic', 'direct'
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ttclid TEXT,              -- TikTok Click ID

  -- ページ情報
  page_path TEXT,
  landing_page TEXT,
  referrer TEXT,

  -- イベント詳細
  event_data JSONB DEFAULT '{}',

  -- デバイス情報
  device_type TEXT,         -- 'mobile', 'desktop', 'tablet'
  browser TEXT,
  os TEXT,

  -- 位置情報
  country TEXT,
  region TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON english_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON english_analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_time ON english_analytics_events(event_time);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ad_source ON english_analytics_events(ad_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_source ON english_analytics_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_campaign ON english_analytics_events(utm_campaign);

-- ============================================
-- 2. ユーザー獲得チャネルテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS english_user_acquisition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ファーストタッチ情報
  first_touch_source TEXT,
  first_touch_medium TEXT,
  first_touch_campaign TEXT,
  first_touch_content TEXT,
  first_touch_term TEXT,
  first_touch_ttclid TEXT,
  first_touch_landing_page TEXT,
  first_touch_referrer TEXT,
  first_touch_time TIMESTAMPTZ,

  -- ラストタッチ情報（コンバージョン時）
  conversion_source TEXT,
  conversion_medium TEXT,
  conversion_campaign TEXT,
  conversion_content TEXT,
  conversion_term TEXT,
  conversion_ttclid TEXT,

  -- コンバージョン情報
  signup_date TIMESTAMPTZ,
  subscription_date TIMESTAMPTZ,
  subscription_plan TEXT,     -- 'monthly', 'yearly', 'early_discount'
  subscription_value INTEGER, -- 金額（円）

  -- ステータス
  is_subscribed BOOLEAN DEFAULT FALSE,
  is_churned BOOLEAN DEFAULT FALSE,
  churn_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_acquisition_first_source ON english_user_acquisition(first_touch_source);
CREATE INDEX IF NOT EXISTS idx_user_acquisition_conversion_source ON english_user_acquisition(conversion_source);
CREATE INDEX IF NOT EXISTS idx_user_acquisition_signup_date ON english_user_acquisition(signup_date);
CREATE INDEX IF NOT EXISTS idx_user_acquisition_subscription_date ON english_user_acquisition(subscription_date);

-- ============================================
-- 3. キャンペーン集計ビュー
-- ============================================
CREATE OR REPLACE VIEW english_campaign_stats AS
SELECT
  DATE_TRUNC('day', signup_date) AS date,
  COALESCE(first_touch_source, 'direct') AS source,
  COALESCE(first_touch_campaign, 'none') AS campaign,
  COUNT(*) AS signups,
  COUNT(CASE WHEN is_subscribed THEN 1 END) AS conversions,
  ROUND(COUNT(CASE WHEN is_subscribed THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) AS conversion_rate,
  SUM(CASE WHEN is_subscribed THEN subscription_value ELSE 0 END) AS revenue
FROM english_user_acquisition
WHERE signup_date IS NOT NULL
GROUP BY DATE_TRUNC('day', signup_date), first_touch_source, first_touch_campaign
ORDER BY date DESC, signups DESC;

-- ============================================
-- 4. 日別サマリービュー
-- ============================================
CREATE OR REPLACE VIEW english_daily_analytics AS
SELECT
  DATE_TRUNC('day', event_time) AS date,
  ad_source,
  COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) AS page_views,
  COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN session_id END) AS sessions,
  COUNT(CASE WHEN event_name = 'signup' THEN 1 END) AS signups,
  COUNT(CASE WHEN event_name = 'subscription_start' THEN 1 END) AS subscriptions,
  COUNT(CASE WHEN event_name = 'news_play' THEN 1 END) AS news_plays
FROM english_analytics_events
GROUP BY DATE_TRUNC('day', event_time), ad_source
ORDER BY date DESC;

-- ============================================
-- 5. TikTok専用分析ビュー
-- ============================================
CREATE OR REPLACE VIEW english_tiktok_analytics AS
SELECT
  DATE_TRUNC('day', event_time) AS date,
  utm_campaign,
  utm_content,
  COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) AS impressions,
  COUNT(DISTINCT session_id) AS unique_visitors,
  COUNT(CASE WHEN event_name = 'signup' THEN 1 END) AS signups,
  COUNT(CASE WHEN event_name = 'subscription_start' THEN 1 END) AS conversions,
  ROUND(
    COUNT(CASE WHEN event_name = 'signup' THEN 1 END)::NUMERIC /
    NULLIF(COUNT(DISTINCT session_id), 0) * 100, 2
  ) AS signup_rate
FROM english_analytics_events
WHERE ad_source = 'tiktok' OR utm_source ILIKE '%tiktok%' OR ttclid IS NOT NULL
GROUP BY DATE_TRUNC('day', event_time), utm_campaign, utm_content
ORDER BY date DESC;

-- ============================================
-- 6. RLSポリシー
-- ============================================
ALTER TABLE english_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_user_acquisition ENABLE ROW LEVEL SECURITY;

-- 管理者（teacherロール）のみ全データ閲覧可能
CREATE POLICY "Teachers can view all analytics"
  ON english_analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can view all acquisition data"
  ON english_user_acquisition FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- サービスロールは全操作可能
CREATE POLICY "Service role full access to analytics"
  ON english_analytics_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to acquisition"
  ON english_user_acquisition FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 7. 更新日時の自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_acquisition_updated_at
  BEFORE UPDATE ON english_user_acquisition
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Analytics tables created successfully!';
END $$;
