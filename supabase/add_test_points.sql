-- k.omotegawa@edore-edu.com にテスト用ポイントを追加
-- ログインボーナスとして500pt追加（過去の日付で追加してユニーク制約を回避）

INSERT INTO mukimuki_login_bonuses (user_id, login_date, points)
SELECT
  id,
  CURRENT_DATE - INTERVAL '100 days',  -- 過去の日付
  500  -- 追加ポイント
FROM auth.users
WHERE email = 'k.omotegawa@edore-edu.com';

-- 確認用：現在のポイントを表示
SELECT
  u.email,
  public.get_user_total_points(u.id) as total_points,
  public.get_user_available_points(u.id) as available_points
FROM auth.users u
WHERE u.email = 'k.omotegawa@edore-edu.com';
