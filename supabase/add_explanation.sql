-- 問題テーブルに解説カラムを追加
ALTER TABLE public.mukimuki_questions
ADD COLUMN IF NOT EXISTS explanation TEXT;

-- 既存の問題にデフォルトの解説を追加（オプション）
UPDATE public.mukimuki_questions
SET explanation = '解説が未設定です。'
WHERE explanation IS NULL;

-- 解説カラムにコメントを追加
COMMENT ON COLUMN public.mukimuki_questions.explanation IS '問題の解説文';
