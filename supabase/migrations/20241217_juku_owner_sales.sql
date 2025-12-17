-- =============================================
-- 塾オーナー 営業管理カラム追加
-- =============================================

-- 営業ステータス
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS sales_status TEXT DEFAULT 'new';
-- new: 新規登録, contacted: 連絡済み, negotiating: 商談中, converted: 成約, lost: 失注

-- 営業メモ
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS sales_notes TEXT;

-- 最終連絡日
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- 次回アクション日
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMPTZ;

-- 塾の規模情報
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS student_count TEXT; -- 生徒数（~30, 30-100, 100-300, 300+）
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS revenue_scale TEXT; -- 売上規模
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS classroom_count INTEGER; -- 教室数

-- 競合・その他情報
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS competitors TEXT; -- 競合情報
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS source TEXT; -- 流入経路（広告、紹介、検索など）
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS prefecture TEXT; -- 都道府県
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS city TEXT; -- 市区町村

-- 担当者
ALTER TABLE juku_owner_profiles ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES mukimuki_profiles(id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_juku_owner_sales_status ON juku_owner_profiles(sales_status);
CREATE INDEX IF NOT EXISTS idx_juku_owner_next_action ON juku_owner_profiles(next_action_at);
CREATE INDEX IF NOT EXISTS idx_juku_owner_prefecture ON juku_owner_profiles(prefecture);

-- 管理者（teacherロール）は全オーナー情報を閲覧・更新可能なポリシーを追加
DROP POLICY IF EXISTS "juku_owner_管理者閲覧" ON juku_owner_profiles;
DROP POLICY IF EXISTS "juku_owner_管理者更新" ON juku_owner_profiles;

CREATE POLICY "juku_owner_管理者閲覧" ON juku_owner_profiles
  FOR SELECT USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "juku_owner_管理者更新" ON juku_owner_profiles
  FOR UPDATE USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM mukimuki_profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );
