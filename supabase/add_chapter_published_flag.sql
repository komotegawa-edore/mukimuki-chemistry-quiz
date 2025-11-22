-- ====================================
-- 章に公開/非公開フラグを追加
-- ====================================

-- is_published カラムを追加（デフォルトは true）
ALTER TABLE public.mukimuki_chapters
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_mukimuki_chapters_is_published
ON public.mukimuki_chapters(is_published);

-- 既存の全章を公開状態に設定（念のため）
UPDATE public.mukimuki_chapters
SET is_published = true
WHERE is_published IS NULL;

COMMENT ON COLUMN public.mukimuki_chapters.is_published IS '章の公開状態。false の場合、生徒には表示されない';
