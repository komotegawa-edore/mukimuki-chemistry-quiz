-- ====================================
-- RLSポリシーの修正（無限再帰を回避）
-- ====================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "mukimuki_users_can_view_own_profile" ON public.mukimuki_profiles;
DROP POLICY IF EXISTS "mukimuki_teachers_can_view_all_profiles" ON public.mukimuki_profiles;
DROP POLICY IF EXISTS "mukimuki_users_can_update_own_profile" ON public.mukimuki_profiles;
DROP POLICY IF EXISTS "mukimuki_authenticated_users_can_insert_own_profile" ON public.mukimuki_profiles;

-- ユーザーのロールを取得する関数（SECURITY DEFINERでRLSをバイパス）
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.mukimuki_profiles WHERE id = user_id LIMIT 1;
$$ LANGUAGE sql;

-- 現在のユーザーが講師かどうかを判定する関数
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mukimuki_profiles
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$ LANGUAGE sql;

-- ====================================
-- 新しいポリシー
-- ====================================

-- 自分のプロフィールは読める
CREATE POLICY "mukimuki_users_can_view_own_profile"
  ON public.mukimuki_profiles FOR SELECT
  USING (auth.uid() = id);

-- 講師は全プロフィールを読める（関数を使用して無限再帰を回避）
CREATE POLICY "mukimuki_teachers_can_view_all_profiles"
  ON public.mukimuki_profiles FOR SELECT
  USING (public.is_teacher());

-- 自分のプロフィールは更新できる
CREATE POLICY "mukimuki_users_can_update_own_profile"
  ON public.mukimuki_profiles FOR UPDATE
  USING (auth.uid() = id);

-- プロフィール作成は認証済みユーザー
CREATE POLICY "mukimuki_authenticated_users_can_insert_own_profile"
  ON public.mukimuki_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ====================================
-- chapters テーブルのポリシーも修正
-- ====================================

DROP POLICY IF EXISTS "mukimuki_teachers_can_manage_chapters" ON public.mukimuki_chapters;

CREATE POLICY "mukimuki_teachers_can_manage_chapters"
  ON public.mukimuki_chapters FOR ALL
  USING (public.is_teacher());

-- ====================================
-- questions テーブルのポリシーも修正
-- ====================================

DROP POLICY IF EXISTS "mukimuki_teachers_can_create_questions" ON public.mukimuki_questions;
DROP POLICY IF EXISTS "mukimuki_teachers_can_update_questions" ON public.mukimuki_questions;
DROP POLICY IF EXISTS "mukimuki_teachers_can_delete_questions" ON public.mukimuki_questions;

CREATE POLICY "mukimuki_teachers_can_create_questions"
  ON public.mukimuki_questions FOR INSERT
  WITH CHECK (public.is_teacher());

CREATE POLICY "mukimuki_teachers_can_update_questions"
  ON public.mukimuki_questions FOR UPDATE
  USING (public.is_teacher());

CREATE POLICY "mukimuki_teachers_can_delete_questions"
  ON public.mukimuki_questions FOR DELETE
  USING (public.is_teacher());

-- ====================================
-- test_results テーブルのポリシーも修正
-- ====================================

DROP POLICY IF EXISTS "mukimuki_teachers_can_view_all_results" ON public.mukimuki_test_results;

CREATE POLICY "mukimuki_teachers_can_view_all_results"
  ON public.mukimuki_test_results FOR SELECT
  USING (public.is_teacher());
