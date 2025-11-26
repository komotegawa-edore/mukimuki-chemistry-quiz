-- 2. リファラル記録テーブル
CREATE TABLE IF NOT EXISTS public.mukimuki_referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.mukimuki_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_mukimuki_referrals_referrer ON public.mukimuki_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_referrals_referred ON public.mukimuki_referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_mukimuki_referrals_status ON public.mukimuki_referrals(status);
