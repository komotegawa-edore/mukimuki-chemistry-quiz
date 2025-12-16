-- =============================================
-- 塾サイトビルダー テーマカラム追加
-- =============================================

-- themeカラムを追加（デフォルトは'default'）
ALTER TABLE juku_sites
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default';

-- 既存のデータにデフォルト値を設定
UPDATE juku_sites SET theme = 'default' WHERE theme IS NULL;
