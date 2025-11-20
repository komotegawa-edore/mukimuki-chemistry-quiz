-- ====================================
-- トリガー関数の修正（より堅牢に）
-- ====================================

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- トリガー関数を再作成（エラーハンドリング追加）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- プロフィールを作成（既に存在する場合はスキップ）
  INSERT INTO public.mukimuki_profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'ユーザー'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::text
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- エラーが発生してもユーザー作成は続行
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- トリガーを再作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================
-- 既存のユーザーにプロフィールを作成
-- ====================================

-- プロフィールが存在しないユーザーにプロフィールを作成
INSERT INTO public.mukimuki_profiles (id, name, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'student')::text
FROM auth.users u
LEFT JOIN public.mukimuki_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 確認：すべてのユーザーにプロフィールがあるか
SELECT
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users u
LEFT JOIN public.mukimuki_profiles p ON u.id = p.id;
