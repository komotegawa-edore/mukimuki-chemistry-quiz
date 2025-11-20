# セットアップ詳細ガイド

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

## ステップバイステップ手順

### Step 1: リポジトリのクローン

```bash
git clone <repository-url>
cd mukimuki
```

### Step 2: 依存関係のインストール

```bash
npm install
```

### Step 3: Supabaseプロジェクトの作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. 組織を選択または作成
4. 「New Project」をクリック
5. プロジェクト名を入力（例：mukimuki-quiz）
6. データベースパスワードを設定（必ず保存！）
7. リージョンを選択（日本の場合は Northeast Asia (Tokyo)）
8. 「Create new project」をクリック
9. プロジェクトの準備ができるまで1-2分待つ

### Step 4: Supabase認証情報の取得

1. Supabase Dashboard の左サイドバーから「Settings」→「API」を開く
2. 「Project URL」をコピー
3. 「Project API keys」セクションの「anon public」キーをコピー

### Step 5: 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```bash
cp .env.example .env.local
```

`.env.local` ファイルを編集し、取得した認証情報を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 6: データベーススキーマの実行

1. Supabase Dashboard の左サイドバーから「SQL Editor」を開く
2. 「New query」をクリック
3. `supabase/schema.sql` ファイルの内容を全てコピー
4. SQL Editorにペースト
5. 「Run」ボタンをクリック

実行後、以下が作成されます：
- 4つのテーブル（mukimuki_profiles, mukimuki_chapters, mukimuki_questions, mukimuki_test_results）
- RLSポリシー
- インデックス
- トリガー関数
- 33章分の初期データ
- サンプル問題（第1章に3問）

**注**: すべてのテーブル名に `mukimuki_` プレフィックスが付いています。これにより同じSupabaseプロジェクト内で複数のアプリケーションを安全に管理できます。

### Step 7: 認証の設定

Supabase Dashboard → Authentication → Providers で以下を確認：

- Email provider が有効になっていることを確認
- 「Confirm email」がオフになっていることを確認（開発用）

### Step 8: テストユーザーの作成

#### 方法A: Supabase Dashboard から作成

1. Authentication → Users → 「Add user」をクリック
2. Email: `student@example.com`、Password: `password` で作成
3. もう一度「Add user」をクリック
4. Email: `teacher@example.com`、Password: `password` で作成

#### 方法B: SQLで一括作成

SQL Editor で以下を実行（パスワードは `password`）：

```sql
-- 注意: 本番環境では絶対に使用しないでください

-- まず auth.users を作成（Supabase の仕組み上、直接は作成できないので、
-- Supabase Dashboard から手動で作成する必要があります）
```

**重要**: Supabase では、ユーザーは必ず Dashboard の UI から作成する必要があります。

### Step 9: プロフィールの作成

ユーザー作成後、SQL Editor で以下を実行：

```sql
-- 生徒プロフィール
INSERT INTO public.mukimuki_profiles (id, name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'student@example.com'),
  '山田太郎',
  'student'
);

-- 講師プロフィール
INSERT INTO public.mukimuki_profiles (id, name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'teacher@example.com'),
  '講師先生',
  'teacher'
);
```

### Step 10: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

### Step 11: 動作確認

#### 生徒としてログイン
1. `student@example.com` / `password` でログイン
2. 章一覧が表示されることを確認
3. 「第1章 水素」をクリック
4. クイズが表示されることを確認
5. 問題に回答して結果が保存されることを確認

#### 講師としてログイン
1. ログアウト
2. `teacher@example.com` / `password` でログイン
3. ダッシュボードが表示されることを確認
4. 生徒の結果が表示されることを確認
5. 章カードをクリックして問題管理ページへ
6. 問題の追加・編集・削除ができることを確認

## トラブルシューティング

### 問題: ログインできない

**解決策**:
- `.env.local` ファイルの内容が正しいか確認
- Supabase Dashboard で User が作成されているか確認
- ブラウザのコンソールでエラーを確認

### 問題: データが表示されない

**解決策**:
- `supabase/schema.sql` が正しく実行されたか確認
- Supabase Dashboard → Table Editor でデータを確認
- RLSポリシーが正しく設定されているか確認

### 問題: 型エラーが発生する

**解決策**:
```bash
npm run build
```
でビルドエラーがないか確認

### 問題: 環境変数が読み込まれない

**解決策**:
- ファイル名が `.env.local` であることを確認（`.env` ではない）
- 開発サーバーを再起動
- `NEXT_PUBLIC_` プレフィックスがついているか確認

## 次のステップ

1. 他の章にも問題を追加
2. 生徒アカウントを追加
3. 実際の無機化学問題を CSV などから一括投入
4. デプロイ（Vercel など）

## 追加の設定（オプション）

### メール確認を有効にする

本番環境では、以下を推奨：

1. Supabase Dashboard → Authentication → Email Templates
2. メールテンプレートをカスタマイズ
3. Authentication → Providers → Email → 「Confirm email」を有効化

### カスタムドメインの設定

Vercel にデプロイする場合：

1. Vercel にプロジェクトをインポート
2. 環境変数を設定
3. カスタムドメインを追加

## サポート

問題が解決しない場合は、Issue を作成してください。
