-- 8. デイリーミッションテーブルの制約変更
ALTER TABLE public.mukimuki_daily_missions
DROP CONSTRAINT IF EXISTS mukimuki_daily_missions_user_id_mission_date_key;

ALTER TABLE public.mukimuki_daily_missions
ADD CONSTRAINT mukimuki_daily_missions_user_date_chapter_key
UNIQUE(user_id, mission_date, chapter_id);

ALTER TABLE public.mukimuki_daily_missions
ADD COLUMN IF NOT EXISTS mission_number INTEGER DEFAULT 1;
