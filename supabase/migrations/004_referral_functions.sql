-- 4. 招待コード生成関数
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. ユーザー作成時に招待コードを自動生成するトリガー
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(8);
  code_exists BOOLEAN;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM public.mukimuki_profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;

  IF NEW.referred_by IS NOT NULL THEN
    NEW.bonus_daily_quests := 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_referral_code ON public.mukimuki_profiles;

CREATE TRIGGER trigger_assign_referral_code
  BEFORE INSERT ON public.mukimuki_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_referral_code();

-- 6. 既存ユーザーに招待コードを付与
UPDATE public.mukimuki_profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;
