あなたはフルスタックエンジニア兼アーキテクトとして行動してください。
以下の要件を満たす **「無機化学・ジャンプアップノート小テストアプリ」（MVP）」** を Next.js + Supabase で構築してください。

---

# 🎯 ■ アプリの目的

* 大学受験向け「無機化学」知識確認アプリ
* 33章分のクイズを生徒が日々解答
* **問題は講師が自由に追加・編集・削除できる**
* **基本は選択式（4択）**
* **生徒の結果（正答率/履歴）を講師側で閲覧可能**

---

# 🏛️ ■ 技術スタック

* **Next.js 14（App Router）**
* **TypeScript**
* **Tailwind CSS**
* **Supabase**（Auth, Postgres, API, Storage）
* UI コンポーネント：ShadCN UI（必要に応じて）

---

# 📁 ■ フォルダ構成（MVP）

```
/app
  /login
  /dashboard (講師)
  /quiz/[chapterId] (生徒)
  /api
    /questions
    /results
/components
  QuestionEditor.tsx
  QuizRunner.tsx
/lib/supabase.ts
```

---

# 📘 ■ 機能要件（MVP）

## ▼ 1. ログイン（Supabase Auth）

* メール＋パスワード
* ロール：`student` / `teacher`
* 生徒はクイズページのみ
* 講師は問題管理＆結果閲覧ページへ

---

## ▼ 2. クイズ関連

### ● 生徒側

* 章一覧（33章）
* 章をクリック → クイズ開始
* 4択問題（ランダム or 全問出題）
* 結果表示（正答率・誤答一覧）
* Supabase に結果を保存

---

## ▼ 3. 講師側機能（重要）

### ● 問題管理

* 章ごとに問題一覧表示
* 問題の「追加 / 編集 / 削除」
* 選択肢（A〜D）と正解の管理

### ● 結果管理

* 生徒一覧
* 各生徒の章別正答率
* 履歴（過去の受験結果）

---

# 🧱 ■ Supabase DB スキーマ

### `profiles`

```
id: uuid (PK, auth.users と連動)
name: text
role: text  -- 'student' or 'teacher'
```

### `chapters`

```
id: serial PK
title: text  -- 第1章 水素 など
order_num: int
```

### `questions`

```
id: serial PK
chapter_id: int FK
question_text: text
choice_a: text
choice_b: text
choice_c: text
choice_d: text
correct_answer: text  -- 'A' | 'B' | 'C' | 'D'
updated_by: uuid FK (講師ID)
```

### `test_results`

```
id: serial PK
user_id: uuid FK
chapter_id: int FK
score: int
total: int
created_at: timestamp
```

### RLS ポリシー

* 生徒 → 自分の結果のみ読める
* 講師 → 全データ閲覧可能
* 問題は講師のみ CRUD 可
* 生徒は問題を閲覧のみ可

---

# 🖼️ ■ 必要コンポーネント

### ● `QuizRunner.tsx`

* 問題を 1 問ずつ表示
* 回答後に次へ
* 最後に結果をサーバーへ POST

### ● `QuestionEditor.tsx`

* 問題の CRUD UI
* 章の選択
* テキスト & 選択肢入力
* 正答の選択（ラジオボタン）

---

# 🔌 ■ API エンドポイント

### POST `/api/results`

* 解答結果を Supabase に保存

### GET `/api/results?user=xxx`

* 生徒別の履歴取得

### CRUD `/api/questions`

* Add / Update / Delete 問題

---

# 🎨 ■ 画面として必要な UI

### 生徒:

* `/`：章一覧
* `/quiz/[chapterId]`：クイズ画面
* `/history`：履歴

### 講師:

* `/dashboard`

  * 生徒一覧
  * 章ごと定着率の表（マトリックス）

* `/dashboard/questions/[chapterId]`

  * 問題一覧
  * 編集画面（モーダル or ページ）

---

# 📦 ■ 最終的に生成してほしいもの

1. **Next.js プロジェクト一式（ファイル構成も生成）**
2. **Supabase スキーマ SQL**
3. **RLS ポリシー**
4. **主要コンポーネントのコード（QuizRunner, QuestionEditor）**
5. **API ルートコード**
6. **Auth（role 管理）付きミドルウェア**
7. **章一覧ページ + クイズページ**
8. **講師ダッシュボード UI（シンプルでOK）**

---

# ⚠️ 設計方針（Claudeに徹底してほしい）

* MVP なので **最小構成で良い**
* コードは **実行可能な形で完全に出力**
* 型エラーがないように TypeScript 厳格に
* ShadCN UI を使用する場合は `npx` 用のコマンド提示
* Supabase への接続は `/lib/supabase.ts` にまとめる
* できれば **フォルダごと生成** してほしい（Claude Code File 操作用）

---

# ▶️ 出力形式

以下を順番に生成して下さい：

1. **ファイルツリー**
2. **Supabase スキーマ SQL**
3. **各ページ・コンポーネントの TypeScript コード**
4. **API ルート**
5. **Auth ミドルウェア**
6. **セットアップ手順**
7. **最後に実行方法**

---

# 💬 補足

問題データは後から CSV で投入する前提なので、今はダミーデータで OK。
講師が自由に問題を編集できるよう、CRUD を必ず実装してください。

---

以上の内容を満たす形で、Next.js + Supabase の **完全 MVP アプリコードを生成してください。**
