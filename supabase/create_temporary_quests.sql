-- 臨時クエスト機能のテーブル作成

-- 1. 臨時クエストテーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_temporary_quests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  reward_points INTEGER NOT NULL DEFAULT 5 CHECK (reward_points >= 1 AND reward_points <= 100),
  passing_score INTEGER NOT NULL DEFAULT 80 CHECK (passing_score >= 1 AND passing_score <= 100),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.mukimuki_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 臨時クエスト問題テーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_temporary_quest_questions (
  id SERIAL PRIMARY KEY,
  quest_id INTEGER NOT NULL REFERENCES public.mukimuki_temporary_quests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  choices JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 1 CHECK (points >= 1 AND points <= 10),
  explanation TEXT,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(quest_id, order_num)
);

-- 3. 臨時クエスト結果テーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_temporary_quest_results (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id),
  quest_id INTEGER NOT NULL REFERENCES public.mukimuki_temporary_quests(id),
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  is_cleared BOOLEAN NOT NULL,
  is_first_clear BOOLEAN NOT NULL DEFAULT false,
  reward_points_awarded INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_temporary_quests_published ON public.mukimuki_temporary_quests(is_published, start_date, end_date);
CREATE INDEX idx_temporary_quests_created_by ON public.mukimuki_temporary_quests(created_by);
CREATE INDEX idx_temporary_quest_questions_quest_id ON public.mukimuki_temporary_quest_questions(quest_id);
CREATE INDEX idx_temporary_quest_results_user_id ON public.mukimuki_temporary_quest_results(user_id);
CREATE INDEX idx_temporary_quest_results_quest_id ON public.mukimuki_temporary_quest_results(quest_id);
CREATE INDEX idx_temporary_quest_results_user_quest ON public.mukimuki_temporary_quest_results(user_id, quest_id);

-- updated_at自動更新トリガー
CREATE TRIGGER update_temporary_quests_updated_at
  BEFORE UPDATE ON public.mukimuki_temporary_quests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_temporary_quest_questions_updated_at
  BEFORE UPDATE ON public.mukimuki_temporary_quest_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLSを有効化
ALTER TABLE public.mukimuki_temporary_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mukimuki_temporary_quest_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mukimuki_temporary_quest_results ENABLE ROW LEVEL SECURITY;

-- RLSポリシー設定

-- 講師：全テーブルのCRUD権限
-- 1. 臨時クエスト
CREATE POLICY "mukimuki_teachers_can_manage_temporary_quests"
  ON public.mukimuki_temporary_quests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 2. 臨時クエスト問題
CREATE POLICY "mukimuki_teachers_can_manage_temporary_quest_questions"
  ON public.mukimuki_temporary_quest_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 3. 臨時クエスト結果（講師は全員の結果を閲覧可能）
CREATE POLICY "mukimuki_teachers_can_view_all_temporary_quest_results"
  ON public.mukimuki_temporary_quest_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 生徒：条件付きアクセス
-- 1. 臨時クエスト（公開済み・期間内のみ閲覧）
CREATE POLICY "mukimuki_students_can_view_published_temporary_quests"
  ON public.mukimuki_temporary_quests FOR SELECT
  USING (
    is_published = true
    AND start_date <= NOW()
    AND end_date >= NOW()
  );

-- 2. 臨時クエスト問題（公開されたクエストの問題を閲覧可能）
CREATE POLICY "mukimuki_students_can_view_temporary_quest_questions"
  ON public.mukimuki_temporary_quest_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_temporary_quests
      WHERE id = quest_id
        AND is_published = true
        AND start_date <= NOW()
        AND end_date >= NOW()
    )
  );

-- 3. 臨時クエスト結果（自分の結果のみ作成・閲覧）
CREATE POLICY "mukimuki_students_can_insert_own_temporary_quest_results"
  ON public.mukimuki_temporary_quest_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mukimuki_students_can_view_own_temporary_quest_results"
  ON public.mukimuki_temporary_quest_results FOR SELECT
  USING (auth.uid() = user_id);

-- コメント追加
COMMENT ON TABLE public.mukimuki_temporary_quests IS '臨時クエスト：期間限定の特別クエスト';
COMMENT ON TABLE public.mukimuki_temporary_quest_questions IS '臨時クエストの問題：2〜6択の単一選択式';
COMMENT ON TABLE public.mukimuki_temporary_quest_results IS '臨時クエストの結果：生徒の挑戦履歴';

COMMENT ON COLUMN public.mukimuki_temporary_quests.reward_points IS '報酬ポイント（1〜100pt）';
COMMENT ON COLUMN public.mukimuki_temporary_quests.passing_score IS 'クリア基準（1〜100%）';
COMMENT ON COLUMN public.mukimuki_temporary_quest_questions.choices IS '選択肢の配列（JSONB、2〜6個）';
COMMENT ON COLUMN public.mukimuki_temporary_quest_questions.correct_answer IS '正解のインデックス（0始まり）';
COMMENT ON COLUMN public.mukimuki_temporary_quest_questions.points IS 'この問題の配点（1〜10点）';
COMMENT ON COLUMN public.mukimuki_temporary_quest_results.percentage IS '正答率（0〜100%）';
COMMENT ON COLUMN public.mukimuki_temporary_quest_results.is_cleared IS 'クリア判定（percentage >= passing_score）';
COMMENT ON COLUMN public.mukimuki_temporary_quest_results.is_first_clear IS '初回クリアかどうか（報酬ポイント付与判定）';
COMMENT ON COLUMN public.mukimuki_temporary_quest_results.reward_points_awarded IS '付与された報酬ポイント';
COMMENT ON COLUMN public.mukimuki_temporary_quest_results.answers IS '各問題への回答（JSONB）';
