-- ====================================
-- 韓国語リスニングクイズアプリ - Korean Phrases Table
-- ====================================

-- 韓国語フレーズテーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_korean_phrases (
  id TEXT PRIMARY KEY,                    -- 例: "KR250103_001"
  phrase_date DATE NOT NULL,              -- フレーズ作成日
  category TEXT NOT NULL CHECK (category IN ('love', 'breakup', 'friendship', 'hope', 'daily')),
  korean_text TEXT NOT NULL,              -- 韓国語フレーズ
  japanese_meaning TEXT NOT NULL,         -- 日本語訳（正解）
  romanization TEXT,                      -- ローマ字表記（初心者向け）
  audio_url TEXT,                         -- 音声ファイルURL
  wrong_choices TEXT[] NOT NULL,          -- 誤答選択肢（3つ）
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level IN (1, 2, 3)), -- 1:初級, 2:中級, 3:上級
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_korean_phrases_date ON public.mukimuki_korean_phrases(phrase_date DESC);
CREATE INDEX IF NOT EXISTS idx_korean_phrases_category ON public.mukimuki_korean_phrases(category);
CREATE INDEX IF NOT EXISTS idx_korean_phrases_published ON public.mukimuki_korean_phrases(is_published);

-- RLSを有効化
ALTER TABLE public.mukimuki_korean_phrases ENABLE ROW LEVEL SECURITY;

-- 全員が公開フレーズを読める（ログイン不要）
CREATE POLICY "korean_phrases_read_public"
  ON public.mukimuki_korean_phrases FOR SELECT
  USING (is_published = true);

-- 講師のみフレーズを作成・更新・削除
CREATE POLICY "korean_phrases_teachers_manage"
  ON public.mukimuki_korean_phrases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- updated_atの自動更新トリガー
CREATE TRIGGER mukimuki_korean_phrases_updated_at
  BEFORE UPDATE ON public.mukimuki_korean_phrases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
