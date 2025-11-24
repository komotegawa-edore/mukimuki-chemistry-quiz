-- ====================================
-- デイリーミッションシステム
-- ====================================

-- デイリーミッションテーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_daily_missions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES public.mukimuki_chapters(id) ON DELETE CASCADE,
  mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_limit_seconds INTEGER DEFAULT 300, -- 5分 = 300秒
  reward_points INTEGER DEFAULT 3,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
  completed_at TIMESTAMPTZ,
  completion_time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 同じユーザー・同じ日付で1レコードのみ
  UNIQUE(user_id, mission_date)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_mukimuki_daily_missions_user_id ON public.mukimuki_daily_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_daily_missions_date ON public.mukimuki_daily_missions(mission_date);
CREATE INDEX IF NOT EXISTS idx_mukimuki_daily_missions_status ON public.mukimuki_daily_missions(status);

-- ====================================
-- RLS ポリシー
-- ====================================

ALTER TABLE public.mukimuki_daily_missions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のミッションのみ読める
CREATE POLICY "mukimuki_users_can_view_own_missions"
  ON public.mukimuki_daily_missions FOR SELECT
  USING (auth.uid() = user_id);

-- 講師は全ミッションを読める
CREATE POLICY "mukimuki_teachers_can_view_all_missions"
  ON public.mukimuki_daily_missions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- システムがミッションを作成
CREATE POLICY "mukimuki_system_can_create_missions"
  ON public.mukimuki_daily_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- システムがミッションを更新
CREATE POLICY "mukimuki_system_can_update_missions"
  ON public.mukimuki_daily_missions FOR UPDATE
  USING (auth.uid() = user_id);

-- ====================================
-- デイリーミッション生成関数
-- ====================================

CREATE OR REPLACE FUNCTION generate_daily_mission(p_user_id UUID)
RETURNS TABLE(
  mission_id INTEGER,
  chapter_id INTEGER,
  chapter_title TEXT,
  subject_name TEXT,
  time_limit_seconds INTEGER,
  reward_points INTEGER
) AS $$
DECLARE
  v_chapter_id INTEGER;
  v_mission_id INTEGER;
BEGIN
  -- 今日のミッションが既にあるかチェック
  SELECT id, mukimuki_daily_missions.chapter_id INTO v_mission_id, v_chapter_id
  FROM public.mukimuki_daily_missions
  WHERE user_id = p_user_id
    AND mission_date = CURRENT_DATE
    AND status = 'active';

  -- 既にミッションがある場合はそれを返す
  IF v_mission_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      dm.id as mission_id,
      dm.chapter_id,
      c.title as chapter_title,
      s.name as subject_name,
      dm.time_limit_seconds,
      dm.reward_points
    FROM public.mukimuki_daily_missions dm
    JOIN public.mukimuki_chapters c ON dm.chapter_id = c.id
    JOIN public.mukimuki_subjects s ON c.subject_id = s.id
    WHERE dm.id = v_mission_id;
    RETURN;
  END IF;

  -- ランダムに公開中の章を選択
  SELECT c.id INTO v_chapter_id
  FROM public.mukimuki_chapters c
  WHERE c.is_published = TRUE
  ORDER BY RANDOM()
  LIMIT 1;

  IF v_chapter_id IS NULL THEN
    RAISE EXCEPTION '公開中の章が見つかりません';
  END IF;

  -- 新しいミッションを作成
  INSERT INTO public.mukimuki_daily_missions (
    user_id,
    chapter_id,
    mission_date,
    time_limit_seconds,
    reward_points,
    status
  )
  VALUES (
    p_user_id,
    v_chapter_id,
    CURRENT_DATE,
    300, -- 5分
    3,   -- 3ポイント
    'active'
  )
  RETURNING id INTO v_mission_id;

  -- 作成したミッション情報を返す
  RETURN QUERY
  SELECT
    dm.id as mission_id,
    dm.chapter_id,
    c.title as chapter_title,
    s.name as subject_name,
    dm.time_limit_seconds,
    dm.reward_points
  FROM public.mukimuki_daily_missions dm
  JOIN public.mukimuki_chapters c ON dm.chapter_id = c.id
  JOIN public.mukimuki_subjects s ON c.subject_id = s.id
  WHERE dm.id = v_mission_id;

END;
$$ LANGUAGE plpgsql;

-- ====================================
-- デイリーミッション達成関数
-- ====================================

CREATE OR REPLACE FUNCTION complete_daily_mission(
  p_user_id UUID,
  p_chapter_id INTEGER,
  p_completion_time_seconds INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  reward_given BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_mission_id INTEGER;
  v_time_limit INTEGER;
  v_reward_points INTEGER;
  v_status TEXT;
BEGIN
  -- 今日のミッションを取得
  SELECT id, time_limit_seconds, reward_points, mukimuki_daily_missions.status
  INTO v_mission_id, v_time_limit, v_reward_points, v_status
  FROM public.mukimuki_daily_missions
  WHERE user_id = p_user_id
    AND mission_date = CURRENT_DATE
    AND chapter_id = p_chapter_id;

  -- ミッションが見つからない
  IF v_mission_id IS NULL THEN
    RETURN QUERY SELECT FALSE, FALSE, 'ミッションが見つかりません'::TEXT;
    RETURN;
  END IF;

  -- 既に達成済み
  IF v_status = 'completed' THEN
    RETURN QUERY SELECT FALSE, FALSE, '既に達成済みです'::TEXT;
    RETURN;
  END IF;

  -- 時間制限オーバー
  IF p_completion_time_seconds > v_time_limit THEN
    -- ミッションを失敗として更新
    UPDATE public.mukimuki_daily_missions
    SET
      status = 'expired',
      completion_time_seconds = p_completion_time_seconds
    WHERE id = v_mission_id;

    RETURN QUERY SELECT FALSE, FALSE, '時間制限を超えました'::TEXT;
    RETURN;
  END IF;

  -- ミッション達成！
  UPDATE public.mukimuki_daily_missions
  SET
    status = 'completed',
    completed_at = NOW(),
    completion_time_seconds = p_completion_time_seconds
  WHERE id = v_mission_id;

  -- ポイント付与
  INSERT INTO public.mukimuki_chapter_clears (user_id, chapter_id, cleared_date, points)
  VALUES (p_user_id, p_chapter_id, CURRENT_DATE, v_reward_points)
  ON CONFLICT (user_id, chapter_id, cleared_date)
  DO UPDATE SET points = mukimuki_chapter_clears.points + v_reward_points;

  RETURN QUERY SELECT TRUE, TRUE, format('ミッション達成！ +%spt', v_reward_points)::TEXT;

END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 過去のミッションを期限切れにする関数（日次バッチ）
-- ====================================

CREATE OR REPLACE FUNCTION expire_old_missions()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.mukimuki_daily_missions
  SET status = 'expired'
  WHERE mission_date < CURRENT_DATE
    AND status = 'active';

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- デイリーミッション統計ビュー
-- ====================================

CREATE OR REPLACE VIEW public.mukimuki_mission_stats AS
SELECT
  p.id AS user_id,
  p.name AS user_name,
  COUNT(dm.id) AS total_missions,
  COUNT(CASE WHEN dm.status = 'completed' THEN 1 END) AS completed_missions,
  COUNT(CASE WHEN dm.status = 'expired' THEN 1 END) AS expired_missions,
  ROUND(
    COUNT(CASE WHEN dm.status = 'completed' THEN 1 END)::NUMERIC * 100.0 /
    NULLIF(COUNT(dm.id), 0),
    1
  ) AS completion_rate
FROM public.mukimuki_profiles p
LEFT JOIN public.mukimuki_daily_missions dm ON p.id = dm.user_id
GROUP BY p.id, p.name;

-- ====================================
-- コメント
-- ====================================

COMMENT ON TABLE public.mukimuki_daily_missions IS 'デイリーミッション記録テーブル';
COMMENT ON FUNCTION generate_daily_mission IS 'ユーザーの今日のデイリーミッションを生成または取得';
COMMENT ON FUNCTION complete_daily_mission IS 'デイリーミッションを達成してポイントを付与';
COMMENT ON FUNCTION expire_old_missions IS '古いミッションを期限切れにする（日次バッチ用）';
COMMENT ON VIEW public.mukimuki_mission_stats IS 'ユーザー別ミッション達成統計';
