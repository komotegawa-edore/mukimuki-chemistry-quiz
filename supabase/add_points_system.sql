-- ====================================
-- ポイントシステム用テーブル
-- ====================================

-- ポイント記録テーブル（1日1章1回のみ記録）
CREATE TABLE IF NOT EXISTS public.mukimuki_chapter_clears (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES public.mukimuki_chapters(id) ON DELETE CASCADE,
  cleared_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 同じユーザー・同じ章・同じ日付で1レコードのみ
  UNIQUE(user_id, chapter_id, cleared_date)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_mukimuki_chapter_clears_user_id ON public.mukimuki_chapter_clears(user_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_chapter_clears_cleared_date ON public.mukimuki_chapter_clears(cleared_date);

-- ====================================
-- RLS (Row Level Security) ポリシー
-- ====================================

ALTER TABLE public.mukimuki_chapter_clears ENABLE ROW LEVEL SECURITY;

-- 生徒は自分のポイントのみ読める
CREATE POLICY "mukimuki_students_can_view_own_clears"
  ON public.mukimuki_chapter_clears FOR SELECT
  USING (auth.uid() = user_id);

-- 講師は全ポイントを読める
CREATE POLICY "mukimuki_teachers_can_view_all_clears"
  ON public.mukimuki_chapter_clears FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- システムがポイントを作成（認証済みユーザー）
CREATE POLICY "mukimuki_users_can_insert_own_clears"
  ON public.mukimuki_chapter_clears FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- 便利な関数：ユーザーの総ポイント数を取得
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_total_points(target_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(points), 0)::INTEGER
  FROM public.mukimuki_chapter_clears
  WHERE user_id = target_user_id;
$$ LANGUAGE SQL STABLE;

-- ====================================
-- 便利な関数：ユーザーの順位を取得
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_rank(target_user_id UUID)
RETURNS TABLE(
  rank BIGINT,
  total_points INTEGER,
  next_rank_points INTEGER
) AS $$
  WITH user_points AS (
    SELECT
      user_id,
      SUM(points) as total_points
    FROM public.mukimuki_chapter_clears
    GROUP BY user_id
  ),
  ranked_users AS (
    SELECT
      user_id,
      total_points,
      RANK() OVER (ORDER BY total_points DESC) as rank
    FROM user_points
  ),
  current_user_rank AS (
    SELECT
      rank,
      total_points
    FROM ranked_users
    WHERE user_id = target_user_id
  ),
  next_rank AS (
    SELECT MIN(total_points) as points
    FROM ranked_users
    WHERE rank < (SELECT rank FROM current_user_rank)
  )
  SELECT
    COALESCE(cur.rank, (SELECT COUNT(*) + 1 FROM user_points)::BIGINT) as rank,
    COALESCE(cur.total_points, 0)::INTEGER as total_points,
    COALESCE(nr.points, COALESCE(cur.total_points, 0) + 1)::INTEGER as next_rank_points
  FROM current_user_rank cur
  FULL OUTER JOIN next_rank nr ON true
  LIMIT 1;
$$ LANGUAGE SQL STABLE;
