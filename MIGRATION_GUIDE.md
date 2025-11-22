# マルチ教科対応マイグレーションガイド

このガイドでは、無機化学専用アプリを**マルチ教科対応**にするためのマイグレーション手順を説明します。

## 📋 変更内容の概要

### 1. 新機能
- ✅ 教科管理機能（無機化学、有機化学、リスニングなど）
- ✅ 画像・音声ファイル対応（構造式、リスニング問題）
- ✅ 問題タイプの分類（text / image / audio / mixed）

### 2. データベース変更
- **新規テーブル**: `mukimuki_subjects`（教科管理）
- **既存テーブル変更**:
  - `mukimuki_chapters`: `subject_id` カラム追加
  - `mukimuki_questions`: メディア対応カラム追加
  - `mukimuki_test_results`: `subject_id` カラム追加

### 3. 既存データの扱い
- **既存の33章はすべて「無機化学」教科に自動的に紐付け**
- データの損失なし
- 後方互換性あり

---

## 🚀 マイグレーション手順

### Step 1: バックアップ（推奨）

Supabase Dashboardから、念のためデータベースのバックアップを取得してください。

```
Dashboard → Project Settings → Backups
```

---

### Step 2: マイグレーションSQL実行

#### 2-1. データベーススキーマの更新

Supabase SQL Editorで以下のファイルを順番に実行：

```bash
# 1. マルチ教科対応マイグレーション
supabase/migration_multi_subject.sql
```

**重要な処理内容:**
1. `mukimuki_subjects` テーブル作成
2. 初期教科データ投入（無機化学、有機化学、リスニング）
3. `mukimuki_chapters` に `subject_id` 追加
4. **既存33章すべてに `subject_id = 1`（無機化学）を設定**
5. `mukimuki_questions` にメディア関連カラム追加
6. `mukimuki_test_results` に `subject_id` 追加

#### 2-2. Storageバケットの作成

```bash
# 2. メディアファイル用Storageバケット設定
supabase/storage_setup.sql
```

**作成されるもの:**
- バケット名: `question-media`
- 公開設定: 読み取り公開、アップロードは講師のみ

---

### Step 3: 動作確認

#### 3-1. 教科データの確認

```sql
SELECT * FROM mukimuki_subjects ORDER BY display_order;
```

**期待される結果:**
| id | name | media_type | display_order |
|----|------|------------|---------------|
| 1  | 無機化学 | text | 1 |
| 2  | 有機化学 | image | 2 |
| 3  | リスニング | audio | 3 |

#### 3-2. 既存章の確認

```sql
SELECT
  c.id,
  c.title,
  c.subject_id,
  s.name AS subject_name
FROM mukimuki_chapters c
JOIN mukimuki_subjects s ON c.subject_id = s.id
LIMIT 5;
```

**期待される結果:**
- すべての既存章が `subject_id = 1`（無機化学）になっている

#### 3-3. 統計確認

```sql
SELECT
  s.name AS subject,
  COUNT(DISTINCT c.id) AS chapter_count,
  COUNT(q.id) AS question_count
FROM mukimuki_subjects s
LEFT JOIN mukimuki_chapters c ON s.id = c.subject_id
LEFT JOIN mukimuki_questions q ON c.id = q.chapter_id
GROUP BY s.id, s.name
ORDER BY s.display_order;
```

**期待される結果:**
- 無機化学: 33章 + 既存の問題数

---

### Step 4: アプリケーションの再起動

```bash
# ローカル環境
npm run dev

# 本番環境（Vercel）
# Vercel Dashboardから再デプロイ、または自動デプロイ待機
```

---

## 🆕 新機能の使い方

### 1. 新しい教科の追加（講師）

```sql
INSERT INTO mukimuki_subjects (name, description, media_type, display_order)
VALUES ('英語リスニング', '共通テストリスニング対策', 'audio', 4);
```

### 2. 新しい章の追加（講師）

```sql
-- 有機化学（subject_id=2）の章を追加
INSERT INTO mukimuki_chapters (subject_id, title, order_num)
VALUES (2, '第1章 アルカン', 1);
```

### 3. 画像付き問題の追加（講師）

講師ダッシュボードから：
1. 問題編集画面で「有機化学」を選択
2. 「画像をアップロード」ボタンから構造式画像を追加
3. 問題文・選択肢・解説に画像を設定可能

---

## 🔄 ロールバック手順（問題発生時）

万が一問題が発生した場合：

### 方法1: バックアップから復元

Supabase Dashboardからバックアップを復元

### 方法2: マイグレーションの手動ロールバック

```sql
-- subjects テーブル削除
DROP TABLE IF EXISTS mukimuki_subjects CASCADE;

-- chapters から subject_id 削除
ALTER TABLE mukimuki_chapters DROP COLUMN IF EXISTS subject_id;

-- questions からメディアカラム削除
ALTER TABLE mukimuki_questions
  DROP COLUMN IF EXISTS question_image_url,
  DROP COLUMN IF EXISTS question_audio_url,
  DROP COLUMN IF EXISTS choice_a_image_url,
  DROP COLUMN IF EXISTS choice_b_image_url,
  DROP COLUMN IF EXISTS choice_c_image_url,
  DROP COLUMN IF EXISTS choice_d_image_url,
  DROP COLUMN IF EXISTS explanation_image_url,
  DROP COLUMN IF EXISTS media_type;

-- test_results から subject_id 削除
ALTER TABLE mukimuki_test_results DROP COLUMN IF EXISTS subject_id;

-- UNIQUE制約を元に戻す
ALTER TABLE mukimuki_chapters
  DROP CONSTRAINT IF EXISTS mukimuki_chapters_subject_order_unique,
  ADD CONSTRAINT mukimuki_chapters_order_num_key UNIQUE (order_num);
```

---

## 📝 注意事項

### 実行前に確認すること
- [ ] Supabaseのバックアップを取得済み
- [ ] 本番環境で実行する場合、ユーザーに事前通知済み
- [ ] SQL実行権限があることを確認

### マイグレーション後の確認事項
- [ ] 既存の無機化学問題が正常に表示される
- [ ] 生徒の過去の解答履歴が保持されている
- [ ] 講師が新しい教科・章を追加できる
- [ ] 画像アップロード機能が動作する

---

## 🛠️ トラブルシューティング

### エラー: `column "subject_id" does not exist`

**原因:** マイグレーションが正しく実行されていない

**解決策:**
```sql
-- subject_id カラムを手動追加
ALTER TABLE mukimuki_chapters ADD COLUMN subject_id INTEGER;
UPDATE mukimuki_chapters SET subject_id = 1;
ALTER TABLE mukimuki_chapters ALTER COLUMN subject_id SET NOT NULL;
```

### エラー: Storage bucket not found

**原因:** Storageバケットが作成されていない

**解決策:**
- Supabase Dashboard → Storage → Create new bucket
- バケット名: `question-media`
- Public: Yes

---

## 📞 サポート

問題が発生した場合は、以下の情報を添えて報告してください：

1. エラーメッセージの全文
2. 実行したSQL
3. `SELECT version()` の結果
4. Supabase Dashboard → Logs → Database Logs のスクリーンショット

---

**マイグレーション実施日:** 2025-11-22
**対象バージョン:** MVP → マルチ教科対応
**推定実行時間:** 5〜10分
