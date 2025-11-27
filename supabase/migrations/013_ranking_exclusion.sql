-- ランキング除外機能
-- 管理画面から特定ユーザーをランキングから除外できるようにする

-- 1. 除外ユーザー設定を追加
INSERT INTO mukimuki_system_settings (setting_key, setting_value)
VALUES ('ranking_excluded_user_ids', '[]')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. get_weekly_ranking関数を更新（除外ユーザーを除く）
CREATE OR REPLACE FUNCTION public.get_weekly_ranking()
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  weekly_points INTEGER,
  rank BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_excluded_ids UUID[];
  v_excluded_json TEXT;
BEGIN
  -- 除外ユーザーIDを取得
  SELECT setting_value INTO v_excluded_json
  FROM mukimuki_system_settings
  WHERE setting_key = 'ranking_excluded_user_ids';

  IF v_excluded_json IS NOT NULL AND v_excluded_json != '[]' THEN
    SELECT ARRAY(SELECT (jsonb_array_elements_text(v_excluded_json::jsonb))::UUID)
    INTO v_excluded_ids;
  ELSE
    v_excluded_ids := ARRAY[]::UUID[];
  END IF;

  RETURN QUERY
  WITH weekly_points AS (
    SELECT
      p.id as uid,
      p.name as uname,
      (
        COALESCE((
          SELECT SUM(points)
          FROM public.mukimuki_chapter_clears
          WHERE user_id = p.id
            AND cleared_date >= DATE_TRUNC('week', CURRENT_DATE)::DATE
        ), 0) +
        COALESCE((
          SELECT SUM(points)
          FROM public.mukimuki_login_bonuses
          WHERE user_id = p.id
            AND login_date >= DATE_TRUNC('week', CURRENT_DATE)::DATE
        ), 0)
      )::INTEGER as pts
    FROM public.mukimuki_profiles p
    WHERE p.role = 'student'
      AND NOT (p.id = ANY(v_excluded_ids))
  )
  SELECT
    wp.uid,
    wp.uname,
    wp.pts,
    RANK() OVER (ORDER BY wp.pts DESC) as rnk
  FROM weekly_points wp
  WHERE wp.pts > 0
  ORDER BY rnk ASC
  LIMIT 10;
END;
$$;

-- 3. get_user_weekly_rank関数を更新（除外ユーザーを除く）
CREATE OR REPLACE FUNCTION public.get_user_weekly_rank(target_user_id UUID)
RETURNS TABLE(
  rank BIGINT,
  weekly_points INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_excluded_ids UUID[];
  v_excluded_json TEXT;
BEGIN
  -- 除外ユーザーIDを取得
  SELECT setting_value INTO v_excluded_json
  FROM mukimuki_system_settings
  WHERE setting_key = 'ranking_excluded_user_ids';

  IF v_excluded_json IS NOT NULL AND v_excluded_json != '[]' THEN
    SELECT ARRAY(SELECT (jsonb_array_elements_text(v_excluded_json::jsonb))::UUID)
    INTO v_excluded_ids;
  ELSE
    v_excluded_ids := ARRAY[]::UUID[];
  END IF;

  RETURN QUERY
  WITH weekly_points AS (
    SELECT
      p.id as uid,
      (
        COALESCE((
          SELECT SUM(points)
          FROM public.mukimuki_chapter_clears
          WHERE user_id = p.id
            AND cleared_date >= DATE_TRUNC('week', CURRENT_DATE)::DATE
        ), 0) +
        COALESCE((
          SELECT SUM(points)
          FROM public.mukimuki_login_bonuses
          WHERE user_id = p.id
            AND login_date >= DATE_TRUNC('week', CURRENT_DATE)::DATE
        ), 0)
      )::INTEGER as pts
    FROM public.mukimuki_profiles p
    WHERE p.role = 'student'
      AND NOT (p.id = ANY(v_excluded_ids))
  ),
  ranked_users AS (
    SELECT
      uid,
      pts,
      RANK() OVER (ORDER BY pts DESC) as rnk
    FROM weekly_points
    WHERE pts > 0
  )
  SELECT
    COALESCE(r.rnk, (SELECT COUNT(*) + 1 FROM ranked_users)::BIGINT) as rank,
    COALESCE(wp.pts, 0)::INTEGER as weekly_points
  FROM weekly_points wp
  LEFT JOIN ranked_users r ON r.uid = wp.uid
  WHERE wp.uid = target_user_id;
END;
$$;

-- 4. get_user_rank関数を更新（除外ユーザーを除く）
CREATE OR REPLACE FUNCTION public.get_user_rank(target_user_id UUID)
RETURNS TABLE(
  rank BIGINT,
  total_points INTEGER,
  next_rank_points INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_excluded_ids UUID[];
  v_excluded_json TEXT;
BEGIN
  -- 除外ユーザーIDを取得
  SELECT setting_value INTO v_excluded_json
  FROM mukimuki_system_settings
  WHERE setting_key = 'ranking_excluded_user_ids';

  IF v_excluded_json IS NOT NULL AND v_excluded_json != '[]' THEN
    SELECT ARRAY(SELECT (jsonb_array_elements_text(v_excluded_json::jsonb))::UUID)
    INTO v_excluded_ids;
  ELSE
    v_excluded_ids := ARRAY[]::UUID[];
  END IF;

  RETURN QUERY
  WITH user_points AS (
    SELECT
      p.id as uid,
      (
        COALESCE((SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = p.id), 0) +
        COALESCE((SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = p.id), 0)
      )::INTEGER as pts
    FROM public.mukimuki_profiles p
    WHERE p.role = 'student'
      AND NOT (p.id = ANY(v_excluded_ids))
  ),
  ranked_users AS (
    SELECT
      uid,
      pts,
      RANK() OVER (ORDER BY pts DESC) as rnk
    FROM user_points
    WHERE pts > 0
  ),
  current_user_rank AS (
    SELECT
      COALESCE(r.rnk, (SELECT COUNT(*) + 1 FROM ranked_users)::BIGINT) as rnk,
      COALESCE(up.pts, 0)::INTEGER as pts
    FROM user_points up
    LEFT JOIN ranked_users r ON r.uid = up.uid
    WHERE up.uid = target_user_id
  ),
  next_rank AS (
    SELECT MIN(pts)::INTEGER as npts
    FROM ranked_users
    WHERE rnk < (SELECT rnk FROM current_user_rank)
  )
  SELECT
    cur.rnk,
    cur.pts,
    COALESCE(nr.npts, cur.pts + 1) as next_rank_points
  FROM current_user_rank cur
  LEFT JOIN next_rank nr ON true;
END;
$$;
