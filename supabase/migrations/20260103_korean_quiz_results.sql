-- Korean Quiz Results (Anonymous tracking)
CREATE TABLE IF NOT EXISTS public.mukimuki_korean_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,  -- ブラウザセッション識別用
  category TEXT,             -- カテゴリ（nullable = 全カテゴリ）
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  phrase_ids TEXT[] NOT NULL,  -- 出題されたフレーズID
  answers JSONB,               -- 回答詳細 [{phraseId, correct, selectedIndex}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_korean_quiz_results_session ON mukimuki_korean_quiz_results(session_id);
CREATE INDEX IF NOT EXISTS idx_korean_quiz_results_created ON mukimuki_korean_quiz_results(created_at DESC);

-- RLS
ALTER TABLE mukimuki_korean_quiz_results ENABLE ROW LEVEL SECURITY;

-- 誰でも挿入可能（匿名トラッキング）
CREATE POLICY "Anyone can insert korean quiz results"
  ON mukimuki_korean_quiz_results
  FOR INSERT
  WITH CHECK (true);

-- 読み取りは認証ユーザーのみ（管理用）
CREATE POLICY "Authenticated users can read korean quiz results"
  ON mukimuki_korean_quiz_results
  FOR SELECT
  USING (auth.role() = 'authenticated');
