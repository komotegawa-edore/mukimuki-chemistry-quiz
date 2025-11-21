-- ====================================
-- ランキングのデバッグ用クエリ
-- ====================================

-- 1. 全生徒のポイント数を確認
SELECT
  p.id,
  p.name,
  COALESCE((SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = p.id), 0) as chapter_points,
  COALESCE((SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = p.id), 0) as login_points,
  (
    COALESCE((SELECT SUM(points) FROM public.mukimuki_chapter_clears WHERE user_id = p.id), 0) +
    COALESCE((SELECT SUM(points) FROM public.mukimuki_login_bonuses WHERE user_id = p.id), 0)
  ) as total_points
FROM public.mukimuki_profiles p
WHERE p.role = 'student'
ORDER BY total_points DESC;

-- 2. 各生徒のランキングを確認
SELECT
  p.id,
  p.name,
  (SELECT rank FROM public.get_user_rank(p.id)) as rank,
  (SELECT total_points FROM public.get_user_rank(p.id)) as total_points
FROM public.mukimuki_profiles p
WHERE p.role = 'student'
ORDER BY total_points DESC;
