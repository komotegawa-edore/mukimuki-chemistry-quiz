-- ====================================
-- 週間ランキングを月曜始まりに変更
-- ====================================

-- ヘルパー関数: 今週の月曜日を取得
CREATE OR REPLACE FUNCTION public.get_this_week_monday()
RETURNS DATE
LANGUAGE SQL
STABLE
AS $$
  SELECT DATE_TRUNC('week', CURRENT_DATE)::DATE;
$$;

-- ====================================
-- 週間ランキング用関数（月曜始まり）
-- ====================================

CREATE OR REPLACE FUNCTION public.get_weekly_ranking()
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  weekly_points INTEGER,
  rank BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  WITH weekly_points AS (
    SELECT
      p.id as user_id,
      p.name as user_name,
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
      )::INTEGER as weekly_points
    FROM public.mukimuki_profiles p
    WHERE p.role = 'student'
  )
  SELECT
    wp.user_id,
    wp.user_name,
    wp.weekly_points,
    RANK() OVER (ORDER BY wp.weekly_points DESC) as rank
  FROM weekly_points wp
  WHERE wp.weekly_points > 0
  ORDER BY rank ASC
  LIMIT 10;
$$;

-- ====================================
-- ユーザーの週間ポイントと順位を取得（月曜始まり）
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_weekly_rank(target_user_id UUID)
RETURNS TABLE(
  rank BIGINT,
  weekly_points INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  WITH weekly_points AS (
    SELECT
      p.id as user_id,
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
      )::INTEGER as weekly_points
    FROM public.mukimuki_profiles p
    WHERE p.role = 'student'
  ),
  ranked_users AS (
    SELECT
      user_id,
      weekly_points,
      RANK() OVER (ORDER BY weekly_points DESC) as rank
    FROM weekly_points
    WHERE weekly_points > 0
  )
  SELECT
    COALESCE(r.rank, (SELECT COUNT(*) + 1 FROM ranked_users)::BIGINT) as rank,
    COALESCE(wp.weekly_points, 0)::INTEGER as weekly_points
  FROM weekly_points wp
  LEFT JOIN ranked_users r ON r.user_id = wp.user_id
  WHERE wp.user_id = target_user_id;
$$;

-- ====================================
-- テスト: 今週の月曜日を確認
-- ====================================

DO $$
DECLARE
  this_monday DATE;
BEGIN
  this_monday := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  RAISE NOTICE '=== 週間ランキング設定 ===';
  RAISE NOTICE '今日: %', CURRENT_DATE;
  RAISE NOTICE '今週の月曜日: %', this_monday;
  RAISE NOTICE '期間: % 〜 今日', this_monday;
END $$;
