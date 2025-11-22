-- ====================================
-- 問題の公開/非公開フラグを追加
-- ====================================

-- questions テーブルに is_published カラムを追加
ALTER TABLE public.mukimuki_questions
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 既存の全問題を公開状態に設定
UPDATE public.mukimuki_questions
SET is_published = true
WHERE is_published IS NULL;

-- NOT NULL制約を追加
ALTER TABLE public.mukimuki_questions
  ALTER COLUMN is_published SET NOT NULL;

-- インデックスを追加（公開状態での検索が高速化）
CREATE INDEX IF NOT EXISTS idx_mukimuki_questions_is_published
  ON public.mukimuki_questions(is_published);

-- コメント追加
COMMENT ON COLUMN public.mukimuki_questions.is_published
  IS '問題の公開状態: true=公開、false=非公開（講師のみ表示）';

-- 確認クエリ
SELECT
  chapter_id,
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE is_published = true) as published_questions,
  COUNT(*) FILTER (WHERE is_published = false) as unpublished_questions
FROM mukimuki_questions
GROUP BY chapter_id
ORDER BY chapter_id;
