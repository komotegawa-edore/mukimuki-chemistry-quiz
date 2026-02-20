-- ブログ流入分析用：profilesテーブルにreferral情報カラムを追加
-- NOTE: 実際のテーブル名を確認して適宜変更してください（profiles or mukimuki_profiles）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS referral_slug TEXT;

-- インデックス追加（分析クエリ高速化）
CREATE INDEX IF NOT EXISTS idx_profiles_referral_source ON profiles (referral_source);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_slug ON profiles (referral_slug);

COMMENT ON COLUMN profiles.referral_source IS '流入元（blog, lp, direct等）';
COMMENT ON COLUMN profiles.referral_slug IS '流入元の記事slug（ブログ記事のslug）';

-- トリガー関数を更新：referral情報もメタデータから取得
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, referral_source, referral_slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'ユーザー'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::text,
    NEW.raw_user_meta_data->>'referral_source',
    NEW.raw_user_meta_data->>'referral_slug'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
