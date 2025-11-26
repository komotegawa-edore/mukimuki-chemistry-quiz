-- 7. 紹介成立処理関数（1章クリア時に呼び出し）
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

  SELECT name INTO v_referrer_name
  FROM public.mukimuki_profiles
  WHERE id = v_referrer_id;

  UPDATE public.mukimuki_profiles
  SET referral_completed = TRUE
  WHERE id = p_user_id;

  UPDATE public.mukimuki_profiles
  SET bonus_daily_quests = bonus_daily_quests + 1
  WHERE id = v_referrer_id;

  UPDATE public.mukimuki_referrals
  SET status = 'completed', completed_at = NOW()
  WHERE referrer_id = v_referrer_id AND referred_id = p_user_id;

  RETURN QUERY SELECT TRUE, v_referrer_name, '紹介が成立しました！'::TEXT;
END;
$$ LANGUAGE plpgsql;
