-- ====================================
-- マルチ教科対応マイグレーション
-- 実行日: 2025-11-22
-- ====================================

-- ====================================
-- 1. 教科テーブルの作成
-- ====================================

CREATE TABLE IF NOT EXISTS public.mukimuki_subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('text', 'image', 'audio', 'mixed')) DEFAULT 'text',
  display_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_mukimuki_subjects_display_order
  ON public.mukimuki_subjects(display_order);

-- RLS有効化
ALTER TABLE public.mukimuki_subjects ENABLE ROW LEVEL SECURITY;

-- 全員が教科を閲覧可能
CREATE POLICY "mukimuki_everyone_can_view_subjects"
  ON public.mukimuki_subjects FOR SELECT
  USING (true);

-- 講師のみ教科を管理
CREATE POLICY "mukimuki_teachers_can_manage_subjects"
  ON public.mukimuki_subjects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- updated_at トリガー
CREATE TRIGGER mukimuki_subjects_updated_at
  BEFORE UPDATE ON public.mukimuki_subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ====================================
-- 2. 初期教科データの投入
-- ====================================

INSERT INTO public.mukimuki_subjects (name, description, media_type, display_order) VALUES
  ('無機化学', 'ジャンプアップノート無機化学・33章', 'text', 1),
  ('有機化学', '有機化学・構造式問題対応', 'image', 2),
  ('リスニング', '音声問題対応', 'audio', 3)
ON CONFLICT (name) DO NOTHING;

-- ====================================
-- 3. chapters テーブルに subject_id を追加
-- ====================================

-- カラム追加（NULL許可で最初は追加）
ALTER TABLE public.mukimuki_chapters
  ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES public.mukimuki_subjects(id) ON DELETE CASCADE;

-- 既存の33章すべてに「無機化学」(id=1) を設定
UPDATE public.mukimuki_chapters
SET subject_id = (SELECT id FROM public.mukimuki_subjects WHERE name = '無機化学')
WHERE subject_id IS NULL;

-- NOT NULL制約を追加
ALTER TABLE public.mukimuki_chapters
  ALTER COLUMN subject_id SET NOT NULL;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_mukimuki_chapters_subject_id
  ON public.mukimuki_chapters(subject_id);

-- UNIQUE制約を更新（同じ教科内で order_num が一意）
-- 既存の UNIQUE 制約を削除
ALTER TABLE public.mukimuki_chapters
  DROP CONSTRAINT IF EXISTS mukimuki_chapters_order_num_key;

-- 新しい UNIQUE 制約を追加
ALTER TABLE public.mukimuki_chapters
  ADD CONSTRAINT mukimuki_chapters_subject_order_unique
  UNIQUE (subject_id, order_num);

-- ====================================
-- 4. questions テーブルにメディア対応カラムを追加
-- ====================================

-- 問題文の画像・音声URL
ALTER TABLE public.mukimuki_questions
  ADD COLUMN IF NOT EXISTS question_image_url TEXT,
  ADD COLUMN IF NOT EXISTS question_audio_url TEXT;

-- 選択肢の画像URL（A～D）
ALTER TABLE public.mukimuki_questions
  ADD COLUMN IF NOT EXISTS choice_a_image_url TEXT,
  ADD COLUMN IF NOT EXISTS choice_b_image_url TEXT,
  ADD COLUMN IF NOT EXISTS choice_c_image_url TEXT,
  ADD COLUMN IF NOT EXISTS choice_d_image_url TEXT;

-- メディアタイプ（問題の種類）
ALTER TABLE public.mukimuki_questions
  ADD COLUMN IF NOT EXISTS media_type TEXT
    CHECK (media_type IN ('text', 'image', 'audio', 'mixed'))
    DEFAULT 'text';

-- 解説文とその画像URL
ALTER TABLE public.mukimuki_questions
  ADD COLUMN IF NOT EXISTS explanation TEXT,
  ADD COLUMN IF NOT EXISTS explanation_image_url TEXT;

-- 既存の全問題を 'text' タイプに設定
UPDATE public.mukimuki_questions
SET media_type = 'text'
WHERE media_type IS NULL;

-- NOT NULL制約
ALTER TABLE public.mukimuki_questions
  ALTER COLUMN media_type SET NOT NULL;

-- ====================================
-- 5. test_results テーブルへの教科情報追加（オプション）
-- ====================================

-- 教科横断的な統計のため、subject_id を追加
ALTER TABLE public.mukimuki_test_results
  ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES public.mukimuki_subjects(id) ON DELETE CASCADE;

-- 既存レコードに教科IDを設定
UPDATE public.mukimuki_test_results
SET subject_id = (
  SELECT subject_id
  FROM public.mukimuki_chapters
  WHERE mukimuki_chapters.id = mukimuki_test_results.chapter_id
)
WHERE subject_id IS NULL;

-- NOT NULL制約
ALTER TABLE public.mukimuki_test_results
  ALTER COLUMN subject_id SET NOT NULL;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_mukimuki_test_results_subject_id
  ON public.mukimuki_test_results(subject_id);

-- ====================================
-- 6. 動画対応の準備（将来用）
-- ====================================

-- 動画URLカラムをコメントアウトで準備
-- ALTER TABLE public.mukimuki_questions
--   ADD COLUMN IF NOT EXISTS question_video_url TEXT;

-- COMMENT ON COLUMN public.mukimuki_questions.question_video_url
--   IS '将来的な動画対応用（実験動画など）';

-- ====================================
-- マイグレーション完了
-- ====================================

-- 確認用クエリ（コメントアウト解除して使用）
-- SELECT
--   s.name AS subject,
--   COUNT(DISTINCT c.id) AS chapter_count,
--   COUNT(q.id) AS question_count
-- FROM mukimuki_subjects s
-- LEFT JOIN mukimuki_chapters c ON s.id = c.subject_id
-- LEFT JOIN mukimuki_questions q ON c.id = q.chapter_id
-- GROUP BY s.id, s.name
-- ORDER BY s.display_order;
