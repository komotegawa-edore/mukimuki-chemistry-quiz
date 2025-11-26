-- 1. profilesテーブルに招待関連カラムを追加
ALTER TABLE public.mukimuki_profiles
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE;

ALTER TABLE public.mukimuki_profiles
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.mukimuki_profiles(id);

ALTER TABLE public.mukimuki_profiles
ADD COLUMN IF NOT EXISTS referral_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.mukimuki_profiles
ADD COLUMN IF NOT EXISTS bonus_daily_quests INTEGER DEFAULT 0;
