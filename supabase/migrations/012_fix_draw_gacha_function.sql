-- draw_gacha関数を更新
-- 修正点:
-- 1. total_pointsカラムではなくget_user_total_points()関数を使用
-- 2. カラム名のあいまいさを解消（prize_type → p_prize_type等）
-- 3. ポイント消費をlogin_bonusesテーブル経由で行う

DROP FUNCTION IF EXISTS draw_gacha(UUID);

CREATE OR REPLACE FUNCTION draw_gacha(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  prize_id INTEGER,
  prize_name VARCHAR(100),
  prize_description TEXT,
  p_prize_type VARCHAR(50),
  p_prize_value INTEGER,
  remaining_points INTEGER
) AS $$
DECLARE
  v_current_points INTEGER;
  v_total_remaining INTEGER;
  v_random_num INTEGER;
  v_cumulative INTEGER := 0;
  v_prize RECORD;
  v_selected_prize_id INTEGER;
  v_excluded_ids TEXT;
  v_is_excluded BOOLEAN := false;
BEGIN
  -- 除外ユーザーチェック
  SELECT setting_value INTO v_excluded_ids
  FROM mukimuki_system_settings
  WHERE setting_key = 'referral_excluded_user_ids';

  IF v_excluded_ids IS NOT NULL THEN
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

  -- get_user_total_points関数でポイントを取得
  v_current_points := public.get_user_total_points(p_user_id);

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

  -- 残り景品数を計算
  SELECT COALESCE(SUM(remaining_stock), 0) INTO v_total_remaining
  FROM mukimuki_gacha_prizes WHERE is_active = true AND remaining_stock > 0;

  IF v_total_remaining = 0 THEN
    RETURN QUERY SELECT
      false,
      '景品がすべてなくなりました'::TEXT,
      NULL::INTEGER,
      NULL::VARCHAR(100),
      NULL::TEXT,
      NULL::VARCHAR(50),
      NULL::INTEGER,
      v_current_points;
    RETURN;
  END IF;

  -- 在庫ベースでランダム抽選
  v_random_num := floor(random() * v_total_remaining) + 1;

  FOR v_prize IN
    SELECT gp.id, gp.name, gp.description, gp.prize_type, gp.prize_value, gp.remaining_stock
    FROM mukimuki_gacha_prizes gp
    WHERE gp.is_active = true AND gp.remaining_stock > 0
    ORDER BY gp.display_order
  LOOP
    v_cumulative := v_cumulative + v_prize.remaining_stock;
    IF v_random_num <= v_cumulative THEN
      v_selected_prize_id := v_prize.id;
      EXIT;
    END IF;
  END LOOP;

  -- ポイント消費（マイナスのログインボーナスとして記録）
  INSERT INTO mukimuki_login_bonuses (user_id, login_date, points)
  VALUES (p_user_id, NOW()::DATE, -50);

  -- 景品在庫を減らす
  UPDATE mukimuki_gacha_prizes SET remaining_stock = remaining_stock - 1 WHERE id = v_selected_prize_id;

  -- 履歴を記録
  INSERT INTO mukimuki_gacha_history (user_id, prize_id, points_used)
  VALUES (p_user_id, v_selected_prize_id, 50);

  -- 結果を返す（カラム名を明示的に指定）
  RETURN QUERY
  SELECT
    true,
    'ガチャを引きました！'::TEXT,
    gp.id,
    gp.name,
    gp.description,
    gp.prize_type,
    gp.prize_value,
    (public.get_user_total_points(p_user_id))::INTEGER
  FROM mukimuki_gacha_prizes gp
  WHERE gp.id = v_selected_prize_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
