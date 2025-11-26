-- ====================================
-- リファラル（招待）システム
-- ====================================

-- ====================================
-- 1. profilesテーブルに招待関連カラムを追加
-- ====================================

-- 招待コード（各ユーザー固有）
ALTER TABLE public.mukimuki_profiles
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE;

-- 誰に招待されたか
ALTER TABLE public.mukimuki_profiles
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.mukimuki_profiles(id);

-- 招待が有効化されたか（被紹介者が1章クリアしたらtrue）
ALTER TABLE public.mukimuki_profiles
ADD COLUMN IF NOT EXISTS referral_completed BOOLEAN DEFAULT FALSE;

-- デイリーミッションの追加枠数（有効な紹介数）
ALTER TABLE public.mukimuki_profiles
ADD COLUMN IF NOT EXISTS bonus_daily_quests INTEGER DEFAULT 0;

-- ====================================
-- 2. リファラル記録テーブル
-- ====================================

CREATE TABLE IF NOT EXISTS public.mukimuki_referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,  -- 紹介者
  referred_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,  -- 被紹介者
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- 同じペアは1回のみ
  UNIQUE(referrer_id, referred_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_mukimuki_referrals_referrer ON public.mukimuki_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_referrals_referred ON public.mukimuki_referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_referrals_status ON public.mukimuki_referrals(status);

-- ====================================
-- 3. RLS ポリシー
-- ====================================

ALTER TABLE public.mukimuki_referrals ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分が紹介者または被紹介者のレコードを読める
CREATE POLICY "mukimuki_users_can_view_own_referrals"
  ON public.mukimuki_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- 講師は全レコードを読める
CREATE POLICY "mukimuki_teachers_can_view_all_referrals"
  ON public.mukimuki_referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- システムがレコードを作成・更新
CREATE POLICY "mukimuki_system_can_insert_referrals"
  ON public.mukimuki_referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "mukimuki_system_can_update_referrals"
  ON public.mukimuki_referrals FOR UPDATE
  USING (true);

-- ====================================
-- 4. 招待コード生成関数
-- ====================================

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- 紛らわしい文字を除外
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 5. ユーザー作成時に招待コードを自動生成するトリガー
-- ====================================

CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(8);
  code_exists BOOLEAN;
BEGIN
  -- 招待コードがまだない場合のみ生成
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM public.mukimuki_profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;

  -- 被紹介者の場合、デイリーミッション+1でスタート
  IF NEW.referred_by IS NOT NULL THEN
    NEW.bonus_daily_quests := 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 既存のトリガーがあれば削除
DROP TRIGGER IF EXISTS trigger_assign_referral_code ON public.mukimuki_profiles;

-- 新規ユーザー作成時のトリガー
CREATE TRIGGER trigger_assign_referral_code
  BEFORE INSERT ON public.mukimuki_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_referral_code();

-- ====================================
-- 6. 既存ユーザーに招待コードを付与
-- ====================================

UPDATE public.mukimuki_profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- ====================================
-- 7. 紹介成立処理関数（1章クリア時に呼び出し）
-- ====================================

CREATE OR REPLACE FUNCTION complete_referral(p_user_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  referrer_name TEXT,
  message TEXT
) AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_name TEXT;
  v_already_completed BOOLEAN;
BEGIN
  -- ユーザーの紹介者と完了状態を取得
  SELECT referred_by, referral_completed INTO v_referrer_id, v_already_completed
  FROM public.mukimuki_profiles
  WHERE id = p_user_id;

  -- 紹介者がいない場合
  IF v_referrer_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, '紹介者がいません'::TEXT;
    RETURN;
  END IF;

  -- 既に紹介が成立している場合
  IF v_already_completed THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, '既に紹介が成立しています'::TEXT;
    RETURN;
  END IF;

  -- 紹介者の名前を取得
  SELECT name INTO v_referrer_name
  FROM public.mukimuki_profiles
  WHERE id = v_referrer_id;

  -- 被紹介者の紹介完了フラグを立てる
  UPDATE public.mukimuki_profiles
  SET referral_completed = TRUE
  WHERE id = p_user_id;

  -- 紹介者のボーナスデイリーミッションを+1
  UPDATE public.mukimuki_profiles
  SET bonus_daily_quests = bonus_daily_quests + 1
  WHERE id = v_referrer_id;

  -- リファラルレコードを更新
  UPDATE public.mukimuki_referrals
  SET status = 'completed', completed_at = NOW()
  WHERE referrer_id = v_referrer_id AND referred_id = p_user_id;

  RETURN QUERY SELECT TRUE, v_referrer_name, '紹介が成立しました！'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 8. デイリーミッションテーブルの制約変更
-- ====================================

-- 既存のUNIQUE制約を削除
ALTER TABLE public.mukimuki_daily_missions
DROP CONSTRAINT IF EXISTS mukimuki_daily_missions_user_id_mission_date_key;

-- 新しいUNIQUE制約（user_id, mission_date, chapter_id）
ALTER TABLE public.mukimuki_daily_missions
ADD CONSTRAINT mukimuki_daily_missions_user_date_chapter_key
UNIQUE(user_id, mission_date, chapter_id);

-- ミッション番号カラムを追加（1日目の1番目、2番目...）
ALTER TABLE public.mukimuki_daily_missions
ADD COLUMN IF NOT EXISTS mission_number INTEGER DEFAULT 1;

-- ====================================
-- 9. デイリーミッション生成関数を更新（複数ミッション対応）
-- ====================================

CREATE OR REPLACE FUNCTION generate_daily_missions(p_user_id UUID)
RETURNS TABLE(
  mission_id INTEGER,
  mission_number INTEGER,
  chapter_id INTEGER,
  chapter_title TEXT,
  subject_name TEXT,
  time_limit_seconds INTEGER,
  reward_points INTEGER,
  status VARCHAR(20)
) AS $$
DECLARE
  v_total_quests INTEGER;
  v_existing_count INTEGER;
  v_chapter_id INTEGER;
  v_mission_id INTEGER;
  i INTEGER;
BEGIN
  -- ユーザーの総デイリーミッション数を計算（基本1 + ボーナス）
  SELECT 1 + COALESCE(bonus_daily_quests, 0) INTO v_total_quests
  FROM public.mukimuki_profiles
  WHERE id = p_user_id;

  IF v_total_quests IS NULL THEN
    v_total_quests := 1;
  END IF;

  -- 今日の既存ミッション数を取得
  SELECT COUNT(*) INTO v_existing_count
  FROM public.mukimuki_daily_missions
  WHERE user_id = p_user_id
    AND mission_date = CURRENT_DATE;

  -- 不足分のミッションを生成
  FOR i IN (v_existing_count + 1)..v_total_quests LOOP
    -- ランダムに公開中の章を選択（今日まだ選ばれていない章から）
    SELECT c.id INTO v_chapter_id
    FROM public.mukimuki_chapters c
    WHERE c.is_published = TRUE
      AND c.id NOT IN (
        SELECT dm.chapter_id
        FROM public.mukimuki_daily_missions dm
        WHERE dm.user_id = p_user_id
          AND dm.mission_date = CURRENT_DATE
      )
    ORDER BY RANDOM()
    LIMIT 1;

    -- 選べる章がなくなった場合はスキップ
    IF v_chapter_id IS NULL THEN
      EXIT;
    END IF;

    -- 新しいミッションを作成
    INSERT INTO public.mukimuki_daily_missions (
      user_id,
      chapter_id,
      mission_date,
      mission_number,
      time_limit_seconds,
      reward_points,
      status
    )
    VALUES (
      p_user_id,
      v_chapter_id,
      CURRENT_DATE,
      i,
      300,  -- 5分
      3,    -- 3ポイント
      'active'
    );
  END LOOP;

  -- 全ミッションを返す
  RETURN QUERY
  SELECT
    dm.id as mission_id,
    dm.mission_number,
    dm.chapter_id,
    c.title as chapter_title,
    s.name as subject_name,
    dm.time_limit_seconds,
    dm.reward_points,
    dm.status
  FROM public.mukimuki_daily_missions dm
  JOIN public.mukimuki_chapters c ON dm.chapter_id = c.id
  JOIN public.mukimuki_subjects s ON c.subject_id = s.id
  WHERE dm.user_id = p_user_id
    AND dm.mission_date = CURRENT_DATE
  ORDER BY dm.mission_number;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 10. 紹介コードでユーザーを検索する関数
-- ====================================

CREATE OR REPLACE FUNCTION get_referrer_by_code(p_code VARCHAR(8))
RETURNS TABLE(
  user_id UUID,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, name
  FROM public.mukimuki_profiles
  WHERE referral_code = UPPER(p_code);
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 11. ユーザーの紹介統計を取得する関数
-- ====================================

CREATE OR REPLACE FUNCTION get_referral_stats(p_user_id UUID)
RETURNS TABLE(
  total_referrals INTEGER,
  completed_referrals INTEGER,
  pending_referrals INTEGER,
  bonus_quests INTEGER,
  referral_code VARCHAR(8)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.mukimuki_referrals WHERE referrer_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.mukimuki_referrals WHERE referrer_id = p_user_id AND status = 'completed'),
    (SELECT COUNT(*)::INTEGER FROM public.mukimuki_referrals WHERE referrer_id = p_user_id AND status = 'pending'),
    COALESCE(p.bonus_daily_quests, 0),
    p.referral_code
  FROM public.mukimuki_profiles p
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 12. 新規ユーザー作成トリガーを更新（招待者情報対応）
-- ====================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referred_by UUID;
  v_referral_code VARCHAR(8);
  code_exists BOOLEAN;
BEGIN
  -- メタデータから招待者IDを取得
  v_referred_by := (NEW.raw_user_meta_data->>'referred_by')::UUID;

  -- 招待コードを生成
  LOOP
    v_referral_code := generate_referral_code();
    SELECT EXISTS(SELECT 1 FROM public.mukimuki_profiles WHERE referral_code = v_referral_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;

  -- プロフィールを作成
  INSERT INTO public.mukimuki_profiles (
    id,
    name,
    role,
    referral_code,
    referred_by,
    bonus_daily_quests
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'ユーザー'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    v_referral_code,
    v_referred_by,
    CASE WHEN v_referred_by IS NOT NULL THEN 1 ELSE 0 END
  );

  -- 招待者がいる場合、リファラルレコードを作成
  IF v_referred_by IS NOT NULL THEN
    INSERT INTO public.mukimuki_referrals (referrer_id, referred_id, status)
    VALUES (v_referred_by, NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- コメント
-- ====================================

COMMENT ON TABLE public.mukimuki_referrals IS '紹介（リファラル）記録テーブル';
COMMENT ON FUNCTION generate_referral_code IS 'ランダムな8文字の招待コードを生成';
COMMENT ON FUNCTION complete_referral IS '紹介成立処理（1章クリア時に呼び出し）';
COMMENT ON FUNCTION generate_daily_missions IS '複数のデイリーミッションを生成';
COMMENT ON FUNCTION get_referrer_by_code IS '招待コードから紹介者を取得';
COMMENT ON FUNCTION get_referral_stats IS 'ユーザーの紹介統計を取得';
