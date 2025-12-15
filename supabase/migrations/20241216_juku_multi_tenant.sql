-- =============================================
-- 塾サイトビルダー マルチテナント対応
-- =============================================

-- 塾オーナー用プロファイルテーブル
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
CREATE POLICY "ユーザーは自分のプロファイルを閲覧可能" ON juku_owner_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "ユーザーは自分のプロファイルを更新可能" ON juku_owner_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "認証済みユーザーはプロファイルを作成可能" ON juku_owner_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- =============================================
-- juku_sites のRLSポリシー
-- =============================================

-- 既存のデモサイト用ポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "デモサイトは誰でも閲覧可能" ON juku_sites;
DROP POLICY IF EXISTS "デモサイトは誰でも編集可能" ON juku_sites;

-- 新しいポリシーを追加
CREATE POLICY "オーナーは自分のサイトを管理可能" ON juku_sites
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "公開サイトは誰でも閲覧可能" ON juku_sites
  FOR SELECT USING (is_published = true);

-- =============================================
-- juku_sections のRLSポリシー
-- =============================================

-- 既存のデモサイト用ポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "デモサイトのセクションは誰でも閲覧可能" ON juku_sections;
DROP POLICY IF EXISTS "デモサイトのセクションは誰でも編集可能" ON juku_sections;

-- 新しいポリシーを追加
CREATE POLICY "オーナーは自分のサイトのセクションを管理可能" ON juku_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_sections.site_id
      AND juku_sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "公開サイトのセクションは誰でも閲覧可能" ON juku_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_sections.site_id
      AND juku_sites.is_published = true
    )
  );

-- =============================================
-- juku_blog_posts のRLSポリシー
-- =============================================

-- 既存のデモサイト用ポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "デモサイトのブログ記事は誰でも閲覧可能" ON juku_blog_posts;
DROP POLICY IF EXISTS "デモサイトのブログ記事は誰でも作成可能" ON juku_blog_posts;
DROP POLICY IF EXISTS "デモサイトのブログ記事は誰でも更新可能" ON juku_blog_posts;
DROP POLICY IF EXISTS "デモサイトのブログ記事は誰でも削除可能" ON juku_blog_posts;
DROP POLICY IF EXISTS "公開中のブログ記事は誰でも閲覧可能" ON juku_blog_posts;

-- 新しいポリシーを追加
CREATE POLICY "オーナーは自分のサイトの記事を管理可能" ON juku_blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_blog_posts.site_id
      AND juku_sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "公開記事は誰でも閲覧可能" ON juku_blog_posts
  FOR SELECT USING (is_published = true);

-- =============================================
-- Storage バケットポリシー（画像アップロード用）
-- =============================================

-- juku-assets バケットのポリシー（存在する場合）
-- オーナーは自分のサイトのフォルダにのみアップロード可能
-- 公開サイトの画像は誰でも閲覧可能
