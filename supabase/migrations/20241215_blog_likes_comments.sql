-- いいねテーブル
CREATE TABLE IF NOT EXISTS blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blog_slug, user_id)
);

-- コメントテーブル
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_blog_likes_slug ON blog_likes(blog_slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_slug ON blog_comments(blog_slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created ON blog_comments(created_at DESC);

-- RLSを有効化
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- いいねのポリシー
CREATE POLICY "誰でもいいね数を閲覧可能" ON blog_likes
  FOR SELECT USING (true);

CREATE POLICY "ログインユーザーはいいね可能" ON blog_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "自分のいいねは削除可能" ON blog_likes
  FOR DELETE USING (auth.uid() = user_id);

-- コメントのポリシー
CREATE POLICY "誰でもコメントを閲覧可能" ON blog_comments
  FOR SELECT USING (true);

CREATE POLICY "ログインユーザーはコメント可能" ON blog_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "自分のコメントは編集可能" ON blog_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "自分のコメントは削除可能" ON blog_comments
  FOR DELETE USING (auth.uid() = user_id);
