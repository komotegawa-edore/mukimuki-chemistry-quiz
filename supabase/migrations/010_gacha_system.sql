-- ガチャシステム用テーブル

-- ガチャ景品マスタ
CREATE TABLE IF NOT EXISTS mukimuki_gacha_prizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,           -- 景品名 (A賞、B賞、C賞、ハズレ)
  description TEXT,                      -- 景品説明
  prize_type VARCHAR(50) NOT NULL,       -- 'amazon_gift' / 'lose'
  prize_value INTEGER DEFAULT 0,         -- 金額（円）
  probability DECIMAL(5, 4) NOT NULL,    -- 当選確率 (0.0200 = 2%)
  display_order INTEGER DEFAULT 0,       -- 表示順
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ガチャ履歴
CREATE TABLE IF NOT EXISTS mukimuki_gacha_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_id INTEGER REFERENCES mukimuki_gacha_prizes(id),
  points_used INTEGER NOT NULL DEFAULT 50,  -- 使用ポイント
  is_claimed BOOLEAN DEFAULT false,         -- 景品受け取り済みか
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_gacha_history_user ON mukimuki_gacha_history(user_id);
CREATE INDEX IF NOT EXISTS idx_gacha_history_created ON mukimuki_gacha_history(created_at DESC);

-- RLSポリシー
ALTER TABLE mukimuki_gacha_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mukimuki_gacha_history ENABLE ROW LEVEL SECURITY;

-- 景品マスタ: 誰でも閲覧可能
CREATE POLICY "Anyone can view active prizes" ON mukimuki_gacha_prizes
  FOR SELECT USING (is_active = true);

-- 講師は全景品を閲覧・編集可能
CREATE POLICY "Teachers can manage prizes" ON mukimuki_gacha_prizes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- ガチャ履歴: 自分の履歴のみ閲覧可能
CREATE POLICY "Users can view own gacha history" ON mukimuki_gacha_history
  FOR SELECT USING (user_id = auth.uid());

-- ガチャ履歴: 自分の履歴を作成可能
CREATE POLICY "Users can insert own gacha history" ON mukimuki_gacha_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 講師は全履歴を閲覧可能
CREATE POLICY "Teachers can view all gacha history" ON mukimuki_gacha_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 初期景品データ（100回で約32,000円の予算）
INSERT INTO mukimuki_gacha_prizes (name, description, prize_type, prize_value, probability, display_order) VALUES
  ('A賞', 'Amazonギフト券 5,000円分', 'amazon_gift', 5000, 0.0200, 1),  -- 2%
  ('B賞', 'Amazonギフト券 3,000円分', 'amazon_gift', 3000, 0.0400, 2),  -- 4%
  ('C賞', 'Amazonギフト券 1,000円分', 'amazon_gift', 1000, 0.1000, 3),  -- 10%
  ('ハズレ', '残念...次回に期待！', 'lose', 0, 0.8400, 4);              -- 84%

-- ガチャを引く関数
CREATE OR REPLACE FUNCTION draw_gacha(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  prize_id INTEGER,
  prize_name VARCHAR(100),
  prize_description TEXT,
  prize_type VARCHAR(50),
  prize_value INTEGER,
  remaining_points INTEGER
) AS $$
DECLARE
  v_current_points INTEGER;
  v_random DECIMAL;
  v_cumulative DECIMAL := 0;
  v_prize RECORD;
  v_selected_prize_id INTEGER;
  v_excluded_ids TEXT;
  v_is_excluded BOOLEAN := false;
BEGIN
  -- 除外ユーザーチェック（招待機能と同じリストを使用）
  SELECT setting_value INTO v_excluded_ids
  FROM mukimuki_system_settings
  WHERE setting_key = 'referral_excluded_user_ids';

  IF v_excluded_ids IS NOT NULL THEN
    -- JSONArray内にユーザーIDが含まれているかチェック
    v_is_excluded := v_excluded_ids::jsonb ? p_user_id::text;
  END IF;

  IF v_is_excluded THEN
    RETURN QUERY SELECT
      false,
      'この機能は利用できません'::TEXT,
      NULL::INTEGER,
      NULL::VARCHAR(100),
      NULL::TEXT,
      NULL::VARCHAR(50),
      NULL::INTEGER,
      0::INTEGER;
    RETURN;
  END IF;

  -- 現在のポイントを取得
  SELECT total_points INTO v_current_points
  FROM mukimuki_profiles
  WHERE id = p_user_id;

  -- ポイント不足チェック
  IF v_current_points < 50 THEN
    RETURN QUERY SELECT
      false,
      'ポイントが不足しています（50pt必要）'::TEXT,
      NULL::INTEGER,
      NULL::VARCHAR(100),
      NULL::TEXT,
      NULL::VARCHAR(50),
      NULL::INTEGER,
      v_current_points;
    RETURN;
  END IF;

  -- ランダム値生成 (0-1)
  v_random := random();

  -- 確率に基づいて景品を選択
  FOR v_prize IN
    SELECT id, name, description, prize_type, prize_value, probability
    FROM mukimuki_gacha_prizes
    WHERE is_active = true
    ORDER BY display_order
  LOOP
    v_cumulative := v_cumulative + v_prize.probability;
    IF v_random <= v_cumulative THEN
      v_selected_prize_id := v_prize.id;
      EXIT;
    END IF;
  END LOOP;

  -- ポイントを減算
  UPDATE mukimuki_profiles
  SET total_points = total_points - 50
  WHERE id = p_user_id;

  -- 履歴を記録
  INSERT INTO mukimuki_gacha_history (user_id, prize_id, points_used)
  VALUES (p_user_id, v_selected_prize_id, 50);

  -- 結果を返す
  RETURN QUERY
  SELECT
    true,
    'ガチャを引きました！'::TEXT,
    gp.id,
    gp.name,
    gp.description,
    gp.prize_type,
    gp.prize_value,
    mp.total_points
  FROM mukimuki_gacha_prizes gp
  CROSS JOIN mukimuki_profiles mp
  WHERE gp.id = v_selected_prize_id
    AND mp.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ガチャ機能の有効/無効設定
INSERT INTO mukimuki_system_settings (setting_key, setting_value)
VALUES ('gacha_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;
