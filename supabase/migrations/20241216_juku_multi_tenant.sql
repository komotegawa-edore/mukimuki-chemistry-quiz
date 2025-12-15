-- =============================================
-- 塾サイトビルダー マルチテナント対応
-- mukimukiとは完全に分離したテーブル構成
-- =============================================

-- 塾オーナー用プロファイルテーブル（mukimuki_profilesとは別）
CREATE TABLE IF NOT EXISTS juku_owner_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE juku_owner_profiles ENABLE ROW LEVEL SECURITY;

-- juku_owner_profiles のRLSポリシー
CREATE POLICY "juku_owner_自分のプロファイル閲覧" ON juku_owner_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "juku_owner_自分のプロファイル更新" ON juku_owner_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "juku_owner_プロファイル作成" ON juku_owner_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- =============================================
-- juku_sites のRLSポリシー（既存ポリシーは保持）
-- =============================================

-- オーナーは自分のサイトを管理可能
CREATE POLICY "juku_sites_オーナー管理" ON juku_sites
  FOR ALL USING (owner_id = auth.uid());

-- 公開サイトは誰でも閲覧可能
CREATE POLICY "juku_sites_公開閲覧" ON juku_sites
  FOR SELECT USING (is_published = true);

-- =============================================
-- juku_sections のRLSポリシー
-- =============================================

-- オーナーは自分のサイトのセクションを管理可能
CREATE POLICY "juku_sections_オーナー管理" ON juku_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_sections.site_id
      AND juku_sites.owner_id = auth.uid()
    )
  );

-- 公開サイトのセクションは誰でも閲覧可能
CREATE POLICY "juku_sections_公開閲覧" ON juku_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_sections.site_id
      AND juku_sites.is_published = true
    )
  );

-- =============================================
-- juku_blog_posts のRLSポリシー（既存のデモ用ポリシーは保持）
-- =============================================

-- オーナーは自分のサイトの記事を管理可能
CREATE POLICY "juku_blog_posts_オーナー管理" ON juku_blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_blog_posts.site_id
      AND juku_sites.owner_id = auth.uid()
    )
  );

-- 注意: 既存のデモサイト用ポリシー（owner_id IS NULL）は保持
-- 本番運用時にデモサイトを削除する場合は、別途ポリシーを削除すること
