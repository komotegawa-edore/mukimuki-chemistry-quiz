-- ガチャ機能修正
-- 方針: ランキングは獲得ポイントで計算（ガチャ消費を差し引かない）
--       ガチャ用の「使用可能ポイント」は別関数で計算

-- ====================================
-- 1. ガチャ用：使用可能ポイントを取得する関数（新規作成）
-- ====================================
CREATE OR REPLACE FUNCTION public.get_user_available_points(target_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT GREATEST(0, (
    COALESCE((SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = target_user_id), 0) +
    COALESCE((SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = target_user_id), 0) -
    COALESCE((SELECT SUM(points_used) FROM public.mukimuki_gacha_history WHERE user_id = target_user_id), 0)
  ))::INTEGER;
$$;

-- ====================================
-- 2. draw_gacha関数を更新（使用可能ポイントを使用）
-- ====================================
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

  -- 使用可能ポイントを取得（ガチャ消費後のポイント）
  v_current_points := public.get_user_available_points(p_user_id);

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
  SELECT COALESCE(SUM(gp2.remaining_stock), 0) INTO v_total_remaining
  FROM mukimuki_gacha_prizes gp2 WHERE gp2.is_active = true AND gp2.remaining_stock > 0;

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
    SELECT gp3.id, gp3.name, gp3.description, gp3.prize_type, gp3.prize_value, gp3.remaining_stock
    FROM mukimuki_gacha_prizes gp3
    WHERE gp3.is_active = true AND gp3.remaining_stock > 0
    ORDER BY gp3.display_order
  LOOP
    v_cumulative := v_cumulative + v_prize.remaining_stock;
    IF v_random_num <= v_cumulative THEN
      v_selected_prize_id := v_prize.id;
      EXIT;
    END IF;
  END LOOP;

  -- 景品在庫を減らす
  UPDATE mukimuki_gacha_prizes SET remaining_stock = remaining_stock - 1 WHERE id = v_selected_prize_id;

  -- 履歴を記録（points_usedでポイント消費を追跡）
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
    (public.get_user_available_points(p_user_id))::INTEGER
  FROM mukimuki_gacha_prizes gp
  WHERE gp.id = v_selected_prize_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
