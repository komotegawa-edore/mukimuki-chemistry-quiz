-- ====================================
-- ユーザーとプロフィールの確認・修正
-- ====================================

-- 1. 既存のユーザーを確認
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data,
  p.id as profile_id,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.mukimuki_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. プロフィールが存在しないユーザーを確認
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data
FROM auth.users u
LEFT JOIN public.mukimuki_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. プロフィールが存在しないユーザーにプロフィールを作成
INSERT INTO public.mukimuki_profiles (id, name, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'student')
FROM auth.users u
LEFT JOIN public.mukimuki_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. 結果確認
SELECT
  u.id,
  u.email,
  p.name,
  p.role
FROM auth.users u
JOIN public.mukimuki_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
