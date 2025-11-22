-- ====================================
-- バッジシステムの実装
-- ====================================

-- ====================================
-- 1. バッジマスターテーブル
-- ====================================

CREATE TABLE IF NOT EXISTS public.mukimuki_badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- 絵文字またはアイコン名
  category TEXT NOT NULL, -- 'points' | 'streak' | 'subject' | 'achievement'
  requirement_type TEXT NOT NULL, -- 'total_points' | 'streak_days' | 'subject_complete' など
  requirement_value INTEGER NOT NULL, -- 必要な値（50pt、7日など）
  color TEXT NOT NULL DEFAULT 'gray', -- 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 2. ユーザー獲得バッジテーブル
-- ====================================

CREATE TABLE IF NOT EXISTS public.mukimuki_user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES public.mukimuki_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id) -- 同じバッジは1回のみ獲得
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.mukimuki_user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON public.mukimuki_user_badges(earned_at DESC);

-- ====================================
-- 3. 初期バッジデータの投入
-- ====================================

-- ポイント達成バッジ
INSERT INTO public.mukimuki_badges (name, description, icon, category, requirement_type, requirement_value, color, order_num) VALUES
  ('ブロンズ', '累計50ポイント達成', '🥉', 'points', 'total_points', 50, 'bronze', 1),
  ('シルバー', '累計100ポイント達成', '🥈', 'points', 'total_points', 100, 'silver', 2),
  ('ゴールド', '累計200ポイント達成', '🥇', 'points', 'total_points', 200, 'gold', 3),
  ('プラチナ', '累計500ポイント達成', '💎', 'points', 'total_points', 500, 'platinum', 4),
  ('ダイヤモンド', '累計1000ポイント達成', '👑', 'points', 'total_points', 1000, 'diamond', 5)
ON CONFLICT DO NOTHING;

-- 連続ログインバッジ（将来実装用）
INSERT INTO public.mukimuki_badges (name, description, icon, category, requirement_type, requirement_value, color, order_num) VALUES
  ('継続の証', '3日連続ログイン', '🔥', 'streak', 'streak_days', 3, 'bronze', 10),
  ('習慣の力', '7日連続ログイン', '⚡', 'streak', 'streak_days', 7, 'silver', 11),
  ('鉄の意志', '30日連続ログイン', '💪', 'streak', 'streak_days', 30, 'gold', 12),
  ('不屈の精神', '100日連続ログイン', '🏆', 'streak', 'streak_days', 100, 'platinum', 13)
ON CONFLICT DO NOTHING;

-- ====================================
-- 4. バッジ獲得判定関数
-- ====================================

CREATE OR REPLACE FUNCTION public.check_and_award_badges(target_user_id UUID)
RETURNS TABLE(
  newly_earned_badge_id INTEGER,
  badge_name TEXT,
  badge_icon TEXT,
  badge_description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_total_points INTEGER;
  badge_record RECORD;
BEGIN
  -- ユーザーの総ポイントを取得
  SELECT public.get_user_total_points(target_user_id) INTO user_total_points;

  -- ポイント達成バッジをチェック
  FOR badge_record IN
    SELECT b.id, b.name, b.icon, b.description, b.requirement_value
    FROM public.mukimuki_badges b
    WHERE b.category = 'points'
      AND b.requirement_type = 'total_points'
      AND b.requirement_value <= user_total_points
      AND NOT EXISTS (
        SELECT 1 FROM public.mukimuki_user_badges ub
        WHERE ub.user_id = target_user_id AND ub.badge_id = b.id
      )
    ORDER BY b.requirement_value ASC
  LOOP
    -- バッジを授与
    INSERT INTO public.mukimuki_user_badges (user_id, badge_id)
    VALUES (target_user_id, badge_record.id);

    -- 獲得したバッジ情報を返す
    newly_earned_badge_id := badge_record.id;
    badge_name := badge_record.name;
    badge_icon := badge_record.icon;
    badge_description := badge_record.description;

    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$;

-- ====================================
-- 5. ユーザーの獲得バッジ一覧取得関数
-- ====================================

CREATE OR REPLACE FUNCTION public.get_user_badges(target_user_id UUID)
RETURNS TABLE(
  badge_id INTEGER,
  name TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  earned_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    b.id as badge_id,
    b.name,
    b.description,
    b.icon,
    b.color,
    ub.earned_at
  FROM public.mukimuki_user_badges ub
  JOIN public.mukimuki_badges b ON b.id = ub.badge_id
  WHERE ub.user_id = target_user_id
  ORDER BY ub.earned_at DESC;
$$;

-- ====================================
-- 6. RLSポリシー
-- ====================================

-- バッジマスターは全員閲覧可能
ALTER TABLE public.mukimuki_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.mukimuki_badges FOR SELECT USING (true);

-- ユーザーバッジは自分のものだけ閲覧可能
ALTER TABLE public.mukimuki_user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.mukimuki_user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- 講師は全員のバッジを閲覧可能
CREATE POLICY "Teachers can view all badges" ON public.mukimuki_user_badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );
