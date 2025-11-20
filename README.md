# 無機化学・ジャンプアップノート小テストアプリ（MVP）

大学受験向けの無機化学知識確認アプリケーションです。

## 🎯 機能概要

### 生徒機能
- 33章分の無機化学クイズに挑戦
- 4択形式の問題
- 結果の自動保存
- 履歴閲覧
- 章ごとの正答率表示

### 講師機能
- 問題の追加・編集・削除（CRUD）
- 生徒一覧と結果閲覧
- 章ごとの定着率マトリックス表示

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
```

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

1. 生徒アカウントでログイン
2. 章一覧から挑戦したい章を選択
3. 4択問題に順番に回答
4. 結果を確認
5. 「履歴」から過去の結果を閲覧

### 講師として

1. 講師アカウントでログイン
2. ダッシュボードで生徒の定着率を確認
3. 章カードをクリックして問題管理ページへ
4. 問題の追加・編集・削除が可能

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

### 本番環境へのデプロイ

Vercel などでデプロイする際は、環境変数を設定してください：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📄 ライセンス

MIT

## 🤝 コントリビューション

Issue や Pull Request は歓迎します。

## 📮 サポート

質問や問題があれば、Issue を作成してください。
