# 無機化学・ジャンプアップノート小テストアプリ（MVP）

大学受験向けの無機化学知識確認アプリケーションです。

## 🎯 機能概要

### 生徒機能
- 33章分の無機化学クイズに挑戦
- 4択形式の問題
- 結果の自動保存
- 履歴閲覧（モバイル対応）
- 章ごとの正答率表示

### 講師機能
- 問題の追加・編集・削除（CRUD）
- CSV一括インポート
- PDF印刷機能（テスト用・解答付き）
- 生徒一覧と結果閲覧
- 章ごとの定着率マトリックス表示
- **認証キーによる講師アカウント保護**

### セキュリティ機能
- 講師アカウント作成時の認証キー必須
- Row Level Security (RLS) によるデータ保護
- ロールベースのアクセス制御

## 🏛️ 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth, Postgres, RLS)

## 📁 プロジェクト構造

```
/app
  /login              # ログインページ
  /dashboard          # 講師ダッシュボード
  /quiz/[chapterId]   # クイズページ
  /history            # 履歴ページ
  /api
    /questions        # 問題管理API
    /results          # 結果管理API
    /chapters         # 章一覧API
/components
  QuestionEditor.tsx  # 問題編集コンポーネント
  QuizRunner.tsx      # クイズ実行コンポーネント
/lib
  /supabase          # Supabaseクライアント設定
  /auth              # 認証ヘルパー
  /types             # 型定義
/supabase
  schema.sql         # データベーススキーマ
```

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクトURL と Anon Key を取得

### 3. 環境変数の設定

`.env.local` ファイルを作成：

```bash
cp .env.example .env.local
```

`.env.local` を編集：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TEACHER_REGISTRATION_KEY=your-secret-teacher-key
```

**環境変数の説明**:
- `NEXT_PUBLIC_SITE_URL`: メール認証時のリダイレクトURL（ローカル: `http://localhost:3000`、本番: VercelのURL）
- `TEACHER_REGISTRATION_KEY`: 講師アカウント作成時に必要な認証キー（**本番環境では必ず変更してください**）

### 4. データベースのセットアップ

Supabase Dashboard の SQL Editor で以下のSQLファイルを順番に実行：

#### 4-1. スキーマの作成

1. Supabase Dashboard → SQL Editor を開く
2. `supabase/schema.sql` の内容をコピー＆ペースト
3. 実行ボタンをクリック

これにより以下が作成されます：
- テーブル（mukimuki_profiles, mukimuki_chapters, mukimuki_questions, mukimuki_test_results）
- RLS ポリシー
- 33章分の初期データ
- サンプル問題（第1章）

**注**: すべてのテーブル名に `mukimuki_` プレフィックスが付いています。これにより同じSupabaseプロジェクト内で複数のアプリケーションを管理できます。

#### 4-2. ユーザー自動作成トリガーの設定

1. SQL Editor で新しいクエリを開く
2. `supabase/trigger_new_user.sql` の内容をコピー＆ペースト
3. 実行ボタンをクリック

このトリガーにより、新規ユーザー登録時に自動的にプロフィールが作成されます。

### 5. メール確認の無効化（開発用）

開発環境では、メール確認を無効にすることで、すぐにアカウントを使用できます：

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Email** の設定を開く
3. **Confirm email** をオフに設定
4. 保存

### 6. テストユーザーの作成（オプション）

アプリの `/signup` ページから直接ユーザーを作成できますが、テスト用に事前に作成する場合：

#### SQL Editor で作成する場合

```sql
-- 生徒アカウント用のプロフィール作成（auth.users は Dashboard の UI から作成）
INSERT INTO public.mukimuki_profiles (id, name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'student@example.com'),
  '山田太郎',
  'student'
);

-- 講師アカウント用のプロフィール作成
INSERT INTO public.mukimuki_profiles (id, name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'teacher@example.com'),
  '講師先生',
  'teacher'
);
```

**注**: トリガーを設定した後は、新規ユーザーは自動的にプロフィールが作成されるため、この手順は不要です。

### 7. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 を開く

## 🔐 ログイン情報

### 生徒アカウント
- Email: `student@example.com`
- Password: `password`

### 講師アカウント
- Email: `teacher@example.com`
- Password: `password`

## 📝 使い方

### 生徒として

1. 新規登録またはログイン
   - 役割で「生徒」を選択
   - メールアドレスとパスワードで登録
2. 章一覧から挑戦したい章を選択
3. 4択問題に順番に回答
4. 結果を確認
5. 「履歴」から過去の結果を閲覧

### 講師として

1. 新規登録（**講師用認証キーが必要**）
   - 役割で「講師」を選択
   - 講師用認証キーを入力
   - メールアドレスとパスワードで登録
2. ダッシュボードで生徒の定着率を確認
3. CSV一括インポートで問題を追加
4. 章カードをクリックして問題管理ページへ
5. 問題の追加・編集・削除が可能
6. PDF印刷機能でテスト問題を出力

**講師用認証キーの取得**: 管理者にお問い合わせください

## 🗄️ データベーススキーマ

**注**: 複数アプリケーション管理のため、すべてのテーブルに `mukimuki_` プレフィックスが付いています。

### mukimuki_profiles
- ユーザー情報（名前、ロール）

### mukimuki_chapters
- 33章の情報

### mukimuki_questions
- 各章の問題（4択形式）

### mukimuki_test_results
- テスト結果の履歴

## 🔒 RLS（Row Level Security）

- 生徒：自分の結果のみ閲覧可能
- 講師：全データ閲覧・問題のCRUD可能
- 問題は全員閲覧可能（生徒は読み取りのみ）

## 📦 主要コンポーネント

### QuizRunner
クイズの実行を管理するコンポーネント
- 問題の表示
- 回答の選択
- 結果の計算と保存

### QuestionEditor
問題の編集を行うコンポーネント
- 問題文の編集
- 選択肢の編集
- 正解の選択

## 🛠️ 開発時のTips

### 型生成（オプション）

Supabaseの型を自動生成する場合：

```bash
npx supabase gen types typescript --project-id your-project-id > lib/types/database.ts
```

### ビルド確認

```bash
npm run build
```

### 本番環境へのデプロイ（Vercel）

#### 1. Vercelへのデプロイ

1. Vercelにプロジェクトをインポート
2. 環境変数を設定（Settings → Environment Variables）：

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
TEACHER_REGISTRATION_KEY=your-production-secret-key
```

**重要**:
- `NEXT_PUBLIC_SITE_URL` には実際のVercel URLを設定してください
- `TEACHER_REGISTRATION_KEY` には強力で推測困難なキーを設定してください（講師アカウント作成時の認証に使用）

#### 2. Supabaseでのリダイレクト許可設定

メール認証が正しく動作するように、Supabaseで本番URLを許可する必要があります：

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL** に本番URL（例: `https://your-app.vercel.app`）を設定
3. **Redirect URLs** に以下を追加：
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` （開発用）
4. 保存

これにより、メール認証リンクをクリックした際に本番環境の正しいURLにリダイレクトされます。

#### 3. デプロイ後の確認

- サインアップページでアカウント作成
- メール認証リンクが本番URLを指していることを確認
- ログイン後、正しくリダイレクトされることを確認

## 🔐 セキュリティ設定

### 講師アカウント保護

講師アカウントは認証キーで保護されています。

#### キーの変更方法

1. `.env.local`（ローカル）または Vercel の環境変数（本番）で `TEACHER_REGISTRATION_KEY` を変更
2. 強力なキーを使用してください（例: 16文字以上のランダムな文字列）
3. キーを安全に管理し、関係者にのみ共有してください

#### 推奨されるキーの生成方法

```bash
# ランダムなキーを生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📱 ソーシャルログイン（オプション）

現在、メールアドレスとパスワードによるログインをサポートしています。

LINEログインやその他のソーシャルログインを追加したい場合は、`docs/LINE_LOGIN_SETUP.md` を参照してください。

SupabaseがネイティブにサポートしているOAuthプロバイダー：
- Google
- GitHub
- Facebook
- Twitter/X
- Discord
- Azure

詳細な実装手順は `docs/LINE_LOGIN_SETUP.md` をご覧ください。

## 📄 ライセンス

MIT

## 🤝 コントリビューション

Issue や Pull Request は歓迎します。

## 📮 サポート

質問や問題があれば、Issue を作成してください。
