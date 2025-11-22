-- ====================================
-- Supabase Storage設定
-- メディアファイル（画像・音声）用バケット
-- ====================================

-- 1. バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-media', 'question-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLSポリシー設定

-- 全員が読み取り可能
CREATE POLICY "question_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-media');

-- 講師のみアップロード可能
CREATE POLICY "question_media_teacher_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'question-media' AND
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 講師のみ更新可能
CREATE POLICY "question_media_teacher_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'question-media' AND
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 講師のみ削除可能
CREATE POLICY "question_media_teacher_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'question-media' AND
    EXISTS (
      SELECT 1 FROM public.mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- ====================================
-- ファイルサイズ制限（オプション）
-- Supabase Dashboardで設定推奨:
-- - 画像: 最大10MB
-- - 音声: 最大20MB
-- ====================================
