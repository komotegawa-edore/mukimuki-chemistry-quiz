-- juku_blog_posts テーブルの RLS ポリシー追加

-- デモサイト（owner_id IS NULL）のブログ記事は誰でも閲覧可能
CREATE POLICY "デモサイトのブログ記事は誰でも閲覧可能" ON juku_blog_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_blog_posts.site_id
      AND juku_sites.owner_id IS NULL
    )
  );

-- デモサイトのブログ記事は誰でも作成可能
CREATE POLICY "デモサイトのブログ記事は誰でも作成可能" ON juku_blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_blog_posts.site_id
      AND juku_sites.owner_id IS NULL
    )
  );

-- デモサイトのブログ記事は誰でも更新可能
CREATE POLICY "デモサイトのブログ記事は誰でも更新可能" ON juku_blog_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_blog_posts.site_id
      AND juku_sites.owner_id IS NULL
    )
  );

-- デモサイトのブログ記事は誰でも削除可能
CREATE POLICY "デモサイトのブログ記事は誰でも削除可能" ON juku_blog_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM juku_sites
      WHERE juku_sites.id = juku_blog_posts.site_id
      AND juku_sites.owner_id IS NULL
    )
  );

-- 公開中の記事は誰でも閲覧可能
CREATE POLICY "公開中のブログ記事は誰でも閲覧可能" ON juku_blog_posts
  FOR SELECT USING (is_published = true);
