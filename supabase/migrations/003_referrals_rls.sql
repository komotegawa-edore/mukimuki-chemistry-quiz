-- 3. RLS ポリシー
ALTER TABLE public.mukimuki_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mukimuki_users_can_view_own_referrals"
  ON public.mukimuki_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "mukimuki_teachers_can_view_all_referrals"
  ON public.mukimuki_referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "mukimuki_system_can_insert_referrals"
  ON public.mukimuki_referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "mukimuki_system_can_update_referrals"
  ON public.mukimuki_referrals FOR UPDATE
  USING (true);
