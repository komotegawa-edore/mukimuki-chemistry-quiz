-- ====================================
-- ポイントシステムの修正と週間ランキング追加
-- ====================================

-- ====================================
-- 1. ユーザーの総ポイント数を取得（章クリア + ログインボーナス）
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_total_points(target_user_id UUID)
RETURNS INTEGER AS $$
  SELECT (
    COALESCE((SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = target_user_id), 0) +
    COALESCE((SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = target_user_id), 0)
  )::INTEGER;
$$ LANGUAGE SQL STABLE;

-- ====================================
-- 2. ユーザーの順位を取得（全期間）
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_rank(target_user_id UUID)
RETURNS TABLE(
  rank BIGINT,
  total_points INTEGER,
  next_rank_points INTEGER
) AS $$
  WITH user_points AS (
    SELECT
      p.id as user_id,
      (
        COALESCE((SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = p.id), 0) +
        COALESCE((SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = p.id), 0)
      ) as total_points
    FROM public.mukimuki_profiles p
    WHERE p.role = 'student'
  ),
  ranked_users AS (
    SELECT
      user_id,
      total_points,
      RANK() OVER (ORDER BY total_points DESC) as rank
    FROM user_points
    WHERE total_points > 0
  ),
  current_user_rank AS (
    SELECT
      COALESCE(r.rank, (SELECT COUNT(*) + 1 FROM ranked_users)::BIGINT) as rank,
      COALESCE(up.total_points, 0) as total_points
    FROM user_points up
    LEFT JOIN ranked_users r ON r.user_id = up.user_id
    WHERE up.user_id = target_user_id
  ),
  next_rank AS (
    SELECT MIN(total_points) as points
    FROM ranked_users
    WHERE rank < (SELECT rank FROM current_user_rank)
  )
  SELECT
    cur.rank,
    cur.total_points,
    COALESCE(nr.points, cur.total_points + 1) as next_rank_points
  FROM current_user_rank cur
  LEFT JOIN next_rank nr ON true;
$$ LANGUAGE SQL STABLE;

-- ====================================
-- 3. 週間ランキング用関数
-- ====================================

CREATE OR REPLACE FUNCTION public.get_weekly_ranking()
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  weekly_points INTEGER,
  rank BIGINT
) AS $$
  WITH weekly_points AS (
    SELECT
      p.id as user_id,
      p.name as user_name,
      (
        COALESCE((
          SELECT SUM(points)
          FROM public.mukimuki_chapter_clears
          WHERE user_id = p.id
            AND cleared_date >= CURRENT_DATE - INTERVAL '7 days'
        ), 0) +
        COALESCE((
          SELECT SUM(points)
          FROM public.mukimuki_login_bonuses
          WHERE user_id = p.id
            AND login_date >= CURRENT_DATE - INTERVAL '7 days'
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
$$ LANGUAGE SQL STABLE;

-- ====================================
-- 4. ユーザーの週間ポイントと順位を取得
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_weekly_rank(target_user_id UUID)
RETURNS TABLE(
  rank BIGINT,
  weekly_points INTEGER
) AS $$
  WITH weekly_points AS (
    SELECT
      p.id as user_id,
      (
        COALESCE((
          SELECT SUM(points)
          FROM public.mukimuki_chapter_clears
          WHERE user_id = p.id
            AND cleared_date >= CURRENT_DATE - INTERVAL '7 days'
        ), 0) +
        COALESCE((
          SELECT SUM(points)
          FROM public.mukimuki_login_bonuses
          WHERE user_id = p.id
            AND login_date >= CURRENT_DATE - INTERVAL '7 days'
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
    COALESCE(wp.weekly_points, 0) as weekly_points
  FROM weekly_points wp
  LEFT JOIN ranked_users r ON r.user_id = wp.user_id
  WHERE wp.user_id = target_user_id;
$$ LANGUAGE SQL STABLE;
