-- ====================================
-- ログインボーナス用テーブル
-- ====================================

-- ログインボーナス記録テーブル（1日1回のみ記録）
CREATE TABLE IF NOT EXISTS public.mukimuki_login_bonuses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 同じユーザー・同じ日付で1レコードのみ
  UNIQUE(user_id, login_date)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_mukimuki_login_bonuses_user_id ON public.mukimuki_login_bonuses(user_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_login_bonuses_login_date ON public.mukimuki_login_bonuses(login_date);

-- ====================================
-- RLS (Row Level Security) ポリシー
-- ====================================

ALTER TABLE public.mukimuki_login_bonuses ENABLE ROW LEVEL SECURITY;

-- 生徒は自分のログインボーナスのみ読める
CREATE POLICY "mukimuki_students_can_view_own_login_bonuses"
  ON public.mukimuki_login_bonuses FOR SELECT
  USING (auth.uid() = user_id);

-- 講師は全ログインボーナスを読める
CREATE POLICY "mukimuki_teachers_can_view_all_login_bonuses"
  ON public.mukimuki_login_bonuses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- システムがログインボーナスを作成（認証済みユーザー）
CREATE POLICY "mukimuki_users_can_insert_own_login_bonuses"
  ON public.mukimuki_login_bonuses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- 便利な関数：ユーザーの総ポイント数を取得（章クリア + ログインボーナス）
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_total_points(target_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(
    (SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = target_user_id), 0
  )::INTEGER + COALESCE(
    (SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = target_user_id), 0
  )::INTEGER;
$$ LANGUAGE SQL STABLE;
