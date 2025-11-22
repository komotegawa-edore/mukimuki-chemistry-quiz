-- 連続ログイン日数機能の追加

-- mukimuki_profiles テーブルに連続ログイン関連カラムを追加
ALTER TABLE mukimuki_profiles
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- 連続ログイン日数を更新する関数
CREATE OR REPLACE FUNCTION update_login_streak(target_user_id UUID)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER,
  is_new_record BOOLEAN
)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_last_login_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_is_new_record BOOLEAN := FALSE;
BEGIN
  -- 現在のユーザー情報を取得
  SELECT p.last_login_date, p.current_streak, p.longest_streak
  INTO v_last_login_date, v_current_streak, v_longest_streak
  FROM mukimuki_profiles p
  WHERE p.id = target_user_id;

  -- 初回ログインの場合
  IF v_last_login_date IS NULL THEN
    v_current_streak := 1;
    v_longest_streak := 1;

  -- 前回ログインが昨日の場合（連続）
  ELSIF v_last_login_date = v_today - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;

    -- 最長記録を更新
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
      v_is_new_record := TRUE;
    END IF;

  -- 前回ログインが今日の場合（既にログイン済み）
  ELSIF v_last_login_date = v_today THEN
    -- 何もしない（現在の値を維持）
    NULL;

  -- 連続が途切れた場合
  ELSE
    v_current_streak := 1;
  END IF;

  -- プロフィールを更新
  UPDATE mukimuki_profiles
  SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_login_date = v_today
  WHERE id = target_user_id;

  -- 結果を返す
  RETURN QUERY
  SELECT v_current_streak, v_longest_streak, v_is_new_record;
END;
$$;

-- バッジチェック関数を更新（ストリーク対応）
CREATE OR REPLACE FUNCTION check_and_award_badges(target_user_id UUID)
RETURNS TABLE(
  newly_earned_badge_id INT,
  badge_name TEXT,
  badge_icon TEXT,
  badge_description TEXT
)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_total_points INTEGER;
  v_current_streak INTEGER;
  v_badge RECORD;
BEGIN
  -- ユーザーの累計ポイントを取得
  SELECT COALESCE(SUM(points), 0)
  INTO v_total_points
  FROM (
    SELECT points FROM mukimuki_chapter_clears WHERE user_id = target_user_id
    UNION ALL
    SELECT points FROM mukimuki_login_bonuses WHERE user_id = target_user_id
  ) AS all_points;

  -- ユーザーの現在の連続ログイン日数を取得
  SELECT current_streak
  INTO v_current_streak
  FROM mukimuki_profiles
  WHERE id = target_user_id;

  -- まだ獲得していないバッジをチェック
  FOR v_badge IN
    SELECT b.*
    FROM mukimuki_badges b
    WHERE b.id NOT IN (
      SELECT badge_id
      FROM mukimuki_user_badges
      WHERE user_id = target_user_id
    )
    ORDER BY b.order_num
  LOOP
    -- ポイント系バッジのチェック
    IF v_badge.category = 'points' AND v_badge.requirement_type = 'total_points' THEN
      IF v_total_points >= v_badge.requirement_value THEN
        -- バッジを付与
        INSERT INTO mukimuki_user_badges (user_id, badge_id)
        VALUES (target_user_id, v_badge.id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;

        -- 新規獲得バッジを返す
        RETURN QUERY
        SELECT v_badge.id, v_badge.name, v_badge.icon, v_badge.description;
      END IF;

    -- ストリーク系バッジのチェック
    ELSIF v_badge.category = 'streak' AND v_badge.requirement_type = 'consecutive_days' THEN
      IF v_current_streak >= v_badge.requirement_value THEN
        -- バッジを付与
        INSERT INTO mukimuki_user_badges (user_id, badge_id)
        VALUES (target_user_id, v_badge.id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;

        -- 新規獲得バッジを返す
        RETURN QUERY
        SELECT v_badge.id, v_badge.name, v_badge.icon, v_badge.description;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- ユーザーの連続ログイン情報を取得する関数
CREATE OR REPLACE FUNCTION get_user_streak(target_user_id UUID)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT current_streak, longest_streak
  FROM mukimuki_profiles
  WHERE id = target_user_id;
$$;
