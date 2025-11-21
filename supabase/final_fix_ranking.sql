-- ====================================
-- 完全修正版：ランキング関数
-- ====================================

-- 既存の関数を完全に削除（CASCADE で依存関係も削除）
DROP FUNCTION IF EXISTS public.get_user_rank(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_weekly_rank(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_weekly_ranking() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_total_points(UUID) CASCADE;

-- ====================================
-- 1. ユーザーの総ポイント数を取得（章クリア + ログインボーナス）
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_total_points(target_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    COALESCE((SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = target_user_id), 0) +
    COALESCE((SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = target_user_id), 0)
  )::INTEGER;
$$;

-- ====================================
-- 2. ユーザーの順位を取得（全期間）
-- SECURITY DEFINER を追加してRLS制限を回避
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_rank(target_user_id UUID)
RETURNS TABLE(
  rank BIGINT,
  total_points INTEGER,
  next_rank_points INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  WITH user_points AS (
    SELECT
      p.id as user_id,
      (
        COALESCE((SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = p.id), 0) +
        COALESCE((SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = p.id), 0)
      )::INTEGER as total_points
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
      COALESCE(up.total_points, 0)::INTEGER as total_points
    FROM user_points up
    LEFT JOIN ranked_users r ON r.user_id = up.user_id
    WHERE up.user_id = target_user_id
  ),
  next_rank AS (
    SELECT MIN(total_points)::INTEGER as points
    FROM ranked_users
    WHERE rank < (SELECT rank FROM current_user_rank)
  )
  SELECT
    cur.rank,
    cur.total_points,
    COALESCE(nr.points, cur.total_points + 1) as next_rank_points
  FROM current_user_rank cur
  LEFT JOIN next_rank nr ON true;
$$;

-- ====================================
-- 3. 週間ランキング用関数
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
$$;

-- ====================================
-- 4. ユーザーの週間ポイントと順位を取得
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
    COALESCE(wp.weekly_points, 0)::INTEGER as weekly_points
  FROM weekly_points wp
  LEFT JOIN ranked_users r ON r.user_id = wp.user_id
  WHERE wp.user_id = target_user_id;
$$;

-- ====================================
-- テスト: 各ユーザーのランクを確認
-- ====================================

DO $$
DECLARE
  test_result RECORD;
BEGIN
  RAISE NOTICE '=== ランキングテスト ===';

  FOR test_result IN
    SELECT
      p.name,
      r.rank,
      r.total_points,
      r.next_rank_points
    FROM public.mukimuki_profiles p
    CROSS JOIN LATERAL public.get_user_rank(p.id) r
    WHERE p.role = 'student'
    ORDER BY r.rank
  LOOP
    RAISE NOTICE '% - 順位: %, ポイント: %, 次のランクまで: %pt',
      test_result.name,
      test_result.rank,
      test_result.total_points,
      test_result.next_rank_points - test_result.total_points;
  END LOOP;
END $$;
