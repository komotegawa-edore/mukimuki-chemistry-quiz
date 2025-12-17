-- =============================================
-- 塾サイト お問い合わせテーブル
-- =============================================

-- お問い合わせテーブル
CREATE TABLE IF NOT EXISTS juku_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES juku_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  grade TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, converted, lost
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- statusカラムが存在しない場合は追加（既存テーブル対応）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'juku_contact_submissions'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE juku_contact_submissions ADD COLUMN status TEXT DEFAULT 'new';
  END IF;
END $$;

-- RLSを有効化
ALTER TABLE juku_contact_submissions ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "juku_contact_公開投稿" ON juku_contact_submissions;
DROP POLICY IF EXISTS "juku_contact_オーナー管理" ON juku_contact_submissions;
DROP POLICY IF EXISTS "juku_contact_管理者閲覧" ON juku_contact_submissions;
DROP POLICY IF EXISTS "juku_contact_管理者更新" ON juku_contact_submissions;

-- お問い合わせ投稿は誰でも可能（公開サイトのみ）
CREATE POLICY "juku_contact_公開投稿" ON juku_contact_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_contact_submissions.site_id
      AND juku_sites.is_published = true
    )
  );

-- オーナーは自分のサイトへのお問い合わせを閲覧・更新可能
CREATE POLICY "juku_contact_オーナー管理" ON juku_contact_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_contact_submissions.site_id
      AND juku_sites.owner_id = auth.uid()
    )
  );

-- 管理者（teacherロール）は全てのお問い合わせを閲覧・更新可能
CREATE POLICY "juku_contact_管理者閲覧" ON juku_contact_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "juku_contact_管理者更新" ON juku_contact_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- インデックス
CREATE INDEX IF NOT EXISTS idx_juku_contact_site_id ON juku_contact_submissions(site_id);
CREATE INDEX IF NOT EXISTS idx_juku_contact_status ON juku_contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_juku_contact_created_at ON juku_contact_submissions(created_at);
