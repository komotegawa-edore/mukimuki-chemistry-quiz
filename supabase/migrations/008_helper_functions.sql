-- 10. 紹介コードでユーザーを検索する関数
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

-- 11. ユーザーの紹介統計を取得する関数
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
