-- 12. 新規ユーザー作成トリガーを更新（招待者情報対応）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referred_by UUID;
  v_referral_code VARCHAR(8);
  code_exists BOOLEAN;
BEGIN
  v_referred_by := (NEW.raw_user_meta_data->>'referred_by')::UUID;

  LOOP
    v_referral_code := generate_referral_code();
    SELECT EXISTS(SELECT 1 FROM public.mukimuki_profiles WHERE referral_code = v_referral_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;

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

  IF v_referred_by IS NOT NULL THEN
    INSERT INTO public.mukimuki_referrals (referrer_id, referred_id, status)
    VALUES (v_referred_by, NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
