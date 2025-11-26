-- 9. デイリーミッション生成関数を更新（複数ミッション対応）
CREATE OR REPLACE FUNCTION generate_daily_missions(p_user_id UUID)
RETURNS TABLE(
  mission_id INTEGER,
  mission_number INTEGER,
  chapter_id INTEGER,
  chapter_title TEXT,
  subject_name TEXT,
  time_limit_seconds INTEGER,
  reward_points INTEGER,
  status VARCHAR(20)
) AS $$
DECLARE
  v_total_quests INTEGER;
  v_existing_count INTEGER;
  v_chapter_id INTEGER;
  v_mission_id INTEGER;
  i INTEGER;
BEGIN
  SELECT 1 + COALESCE(bonus_daily_quests, 0) INTO v_total_quests
  FROM public.mukimuki_profiles
  WHERE id = p_user_id;

  IF v_total_quests IS NULL THEN
    v_total_quests := 1;
  END IF;

  SELECT COUNT(*) INTO v_existing_count
  FROM public.mukimuki_daily_missions
  WHERE user_id = p_user_id
    AND mission_date = CURRENT_DATE;

  FOR i IN (v_existing_count + 1)..v_total_quests LOOP
    SELECT c.id INTO v_chapter_id
    FROM public.mukimuki_chapters c
    WHERE c.is_published = TRUE
      AND c.id NOT IN (
        SELECT dm.chapter_id
        FROM public.mukimuki_daily_missions dm
        WHERE dm.user_id = p_user_id
          AND dm.mission_date = CURRENT_DATE
      )
    ORDER BY RANDOM()
    LIMIT 1;

    IF v_chapter_id IS NULL THEN
      EXIT;
    END IF;

    INSERT INTO public.mukimuki_daily_missions (
      user_id,
      chapter_id,
      mission_date,
      mission_number,
      time_limit_seconds,
      reward_points,
      status
    )
    VALUES (
      p_user_id,
      v_chapter_id,
      CURRENT_DATE,
      i,
      300,
      3,
      'active'
    );
  END LOOP;

  RETURN QUERY
  SELECT
    dm.id as mission_id,
    dm.mission_number,
    dm.chapter_id,
    c.title as chapter_title,
    s.name as subject_name,
    dm.time_limit_seconds,
    dm.reward_points,
    dm.status
  FROM public.mukimuki_daily_missions dm
  JOIN public.mukimuki_chapters c ON dm.chapter_id = c.id
  JOIN public.mukimuki_subjects s ON c.subject_id = s.id
  WHERE dm.user_id = p_user_id
    AND dm.mission_date = CURRENT_DATE
  ORDER BY dm.mission_number;
END;
$$ LANGUAGE plpgsql;
