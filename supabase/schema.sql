-- ====================================
-- 無機化学小テストアプリ - データベーススキーマ
-- ※ 複数アプリ管理のため mukimuki_ プレフィックス付き
-- ====================================

-- プロフィールテーブル（auth.usersと連動）
CREATE TABLE IF NOT EXISTS public.mukimuki_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 章テーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_chapters (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  order_num INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 問題テーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_questions (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES public.mukimuki_chapters(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT NOT NULL,
  choice_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  updated_by UUID REFERENCES public.mukimuki_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- テスト結果テーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_test_results (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES public.mukimuki_chapters(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  answers JSONB, -- 各問題の解答履歴を保存
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_mukimuki_questions_chapter_id ON public.mukimuki_questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_test_results_user_id ON public.mukimuki_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_test_results_chapter_id ON public.mukimuki_test_results(chapter_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_chapters_order_num ON public.mukimuki_chapters(order_num);

-- ====================================
-- RLS (Row Level Security) ポリシー
-- ====================================

-- RLSを有効化
ALTER TABLE public.mukimuki_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mukimuki_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mukimuki_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mukimuki_test_results ENABLE ROW LEVEL SECURITY;

-- ====================================
-- mukimuki_profiles テーブルのポリシー
-- ====================================

-- 自分のプロフィールは読める
CREATE POLICY "mukimuki_users_can_view_own_profile"
  ON public.mukimuki_profiles FOR SELECT
  USING (auth.uid() = id);

-- 講師は全プロフィールを読める
CREATE POLICY "mukimuki_teachers_can_view_all_profiles"
  ON public.mukimuki_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 自分のプロフィールは更新できる
CREATE POLICY "mukimuki_users_can_update_own_profile"
  ON public.mukimuki_profiles FOR UPDATE
  USING (auth.uid() = id);

-- プロフィール作成は認証済みユーザー
CREATE POLICY "mukimuki_authenticated_users_can_insert_own_profile"
  ON public.mukimuki_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ====================================
-- mukimuki_chapters テーブルのポリシー
-- ====================================

-- 全員が章を読める
CREATE POLICY "mukimuki_everyone_can_view_chapters"
  ON public.mukimuki_chapters FOR SELECT
  USING (true);

-- 講師のみ章を作成・更新・削除
CREATE POLICY "mukimuki_teachers_can_manage_chapters"
  ON public.mukimuki_chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- ====================================
-- mukimuki_questions テーブルのポリシー
-- ====================================

-- 全員が問題を読める
CREATE POLICY "mukimuki_everyone_can_view_questions"
  ON public.mukimuki_questions FOR SELECT
  USING (true);

-- 講師のみ問題を作成
CREATE POLICY "mukimuki_teachers_can_create_questions"
  ON public.mukimuki_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 講師のみ問題を更新
CREATE POLICY "mukimuki_teachers_can_update_questions"
  ON public.mukimuki_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 講師のみ問題を削除
CREATE POLICY "mukimuki_teachers_can_delete_questions"
  ON public.mukimuki_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- ====================================
-- mukimuki_test_results テーブルのポリシー
-- ====================================

-- 生徒は自分の結果のみ読める
CREATE POLICY "mukimuki_students_can_view_own_results"
  ON public.mukimuki_test_results FOR SELECT
  USING (auth.uid() = user_id);

-- 講師は全結果を読める
CREATE POLICY "mukimuki_teachers_can_view_all_results"
  ON public.mukimuki_test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 生徒は自分の結果を作成できる
CREATE POLICY "mukimuki_students_can_insert_own_results"
  ON public.mukimuki_test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- トリガー関数：updated_at の自動更新
-- ====================================

-- トリガー関数は共通で使用（既に存在する場合はスキップ）
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mukimuki_profiles_updated_at
  BEFORE UPDATE ON public.mukimuki_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER mukimuki_questions_updated_at
  BEFORE UPDATE ON public.mukimuki_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ====================================
-- 初期データ：33章分のデータを投入
-- ====================================

INSERT INTO public.mukimuki_chapters (title, order_num) VALUES
  ('第1章 水素', 1),
  ('第2章 希ガス', 2),
  ('第3章 ハロゲン', 3),
  ('第4章 酸素', 4),
  ('第5章 硫黄', 5),
  ('第6章 窒素', 6),
  ('第7章 リン', 7),
  ('第8章 炭素・ケイ素', 8),
  ('第9章 アルカリ金属', 9),
  ('第10章 アルカリ土類金属', 10),
  ('第11章 両性元素（亜鉛・アルミニウム・スズ・鉛）', 11),
  ('第12章 鉄・銅・銀', 12),
  ('第13章 金属イオンの分離', 13),
  ('第14章 気体の製法と性質', 14),
  ('第15章 炎色反応', 15),
  ('第16章 沈殿反応', 16),
  ('第17章 酸化還元反応', 17),
  ('第18章 錯イオン', 18),
  ('第19章 無機化合物の製法', 19),
  ('第20章 化学工業', 20),
  ('第21章 結晶構造', 21),
  ('第22章 電池と電気分解', 22),
  ('第23章 陽イオンの系統分析', 23),
  ('第24章 陰イオンの系統分析', 24),
  ('第25章 塩の性質', 25),
  ('第26章 遷移元素', 26),
  ('第27章 金属の製錬', 27),
  ('第28章 ハロゲン化物', 28),
  ('第29章 硫化物', 29),
  ('第30章 窒素化合物', 30),
  ('第31章 リン化合物', 31),
  ('第32章 ケイ素化合物', 32),
  ('第33章 金属の単体・化合物', 33)
ON CONFLICT (order_num) DO NOTHING;

-- ====================================
-- サンプルデータ：第1章の問題（ダミー）
-- ====================================

-- 注: 講師ユーザーIDは実際の運用時に設定
-- 以下はサンプルのため、updated_by は NULL のまま
INSERT INTO public.mukimuki_questions (chapter_id, question_text, choice_a, choice_b, choice_c, choice_d, correct_answer) VALUES
  (1, '水素の製法として正しいのはどれか？', '水の電気分解', '塩酸と硫酸の反応', '酸化鉄の還元', '水素化ナトリウムの分解', 'A'),
  (1, '水素の性質について誤っているものはどれか？', '無色無臭の気体', '最も軽い元素', '水に溶けやすい', '還元性を持つ', 'C'),
  (1, '水素と酸素の反応で生成するものは？', '水', '過酸化水素', 'オゾン', '水酸化物', 'A');
