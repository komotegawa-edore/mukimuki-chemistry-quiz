-- 紹介上限を3人に設定

-- システム設定に上限を追加
INSERT INTO mukimuki_system_settings (setting_key, setting_value)
VALUES ('referral_max_count', '3')
ON CONFLICT (setting_key) DO NOTHING;

-- 紹介成立処理関数を更新（上限チェック追加）
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
  v_referrer_completed_count INTEGER;
  v_max_referrals INTEGER;
BEGIN
  -- 被紹介者の情報を取得
  SELECT referred_by, referral_completed INTO v_referrer_id, v_already_completed
  FROM public.mukimuki_profiles
  WHERE id = p_user_id;

  IF v_referrer_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, '紹介者がいません'::TEXT;
    RETURN;
  END IF;

  IF v_already_completed THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, '既に紹介が成立しています'::TEXT;
    RETURN;
  END IF;

  -- 紹介者の名前を取得
  SELECT name INTO v_referrer_name
  FROM public.mukimuki_profiles
  WHERE id = v_referrer_id;

  -- 紹介者の成立済み紹介数を取得
  SELECT COUNT(*) INTO v_referrer_completed_count
  FROM public.mukimuki_referrals
  WHERE referrer_id = v_referrer_id AND status = 'completed';

  -- 上限設定を取得（デフォルト3人）
  SELECT COALESCE(setting_value::INTEGER, 3) INTO v_max_referrals
  FROM public.mukimuki_system_settings
  WHERE setting_key = 'referral_max_count';

  IF v_max_referrals IS NULL THEN
    v_max_referrals := 3;
  END IF;

  -- 被紹介者の紹介完了フラグを更新（上限に関係なく）
  UPDATE public.mukimuki_profiles
  SET referral_completed = TRUE
  WHERE id = p_user_id;

  -- 紹介レコードを更新（上限に関係なく）
  UPDATE public.mukimuki_referrals
  SET status = 'completed', completed_at = NOW()
  WHERE referrer_id = v_referrer_id AND referred_id = p_user_id;

  -- 上限チェック：上限未満の場合のみボーナスを付与
  IF v_referrer_completed_count < v_max_referrals THEN
    UPDATE public.mukimuki_profiles
    SET bonus_daily_quests = bonus_daily_quests + 1
    WHERE id = v_referrer_id;

    RETURN QUERY SELECT TRUE, v_referrer_name, '紹介が成立しました！'::TEXT;
  ELSE
    -- 上限に達している場合はボーナスなしで成立
    RETURN QUERY SELECT TRUE, v_referrer_name, '紹介が成立しました（紹介者は上限に達しているためボーナスなし）'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
