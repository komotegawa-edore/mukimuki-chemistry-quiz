# 臨時クエスト機能 要件定義書

## 1. 概要
期間限定で配信する特別なクエスト機能。講師が自由に作成・管理でき、生徒に特別な学習機会を提供する。

## 2. 基本仕様

### 2.1 クエスト形式
- **独立した新しいクエスト**として実装
- 既存の章システムとは別のテーブル・データ構造
- 専用の問題セットを持つ

### 2.2 参加条件
- **誰でも参加可能**
- 条件設定なし（将来的な拡張は考慮）

### 2.3 表示方法
- **両方に表示**
  - ホーム画面：目立つカード形式で表示
  - クエストタブ：専用セクションを追加

## 3. 機能要件

### 3.1 講師側機能（管理画面）

#### 3.1.1 クエスト管理
- クエスト一覧表示
  - タイトル、期間、公開状態、報酬、クリア基準、参加人数
  - ステータス（公開中/下書き/終了）

- クエスト作成
  - タイトル（必須）
  - 説明文（必須）
  - 期間設定（開始日時・終了日時）（必須）
  - **報酬ポイント（必須）**
    - 講師が自由に設定可能
    - 推奨選択肢: 3pt, 5pt, 10pt, 15pt, 20pt
    - カスタム入力も可能（1〜100ptの範囲）
    - デフォルト: 5pt
  - **クリア基準（必須）**
    - 正答率のパーセンテージで設定
    - 推奨選択肢: 60%, 70%, 80%, 90%, 100%
    - カスタム入力も可能（1〜100%の範囲）
    - デフォルト: 80%
  - サムネイル画像URL（任意）
  - 公開/下書き設定

- クエスト編集
  - 全項目の編集可能
  - 公開中のクエストも編集可能（注意喚起あり）

- クエスト削除
  - 確認ダイアログ表示
  - 参加履歴は保持

#### 3.1.2 問題管理
- クエストごとの問題一覧
- 問題の追加・編集・削除
- **問題形式：単一選択式**
  - 選択肢の数：2〜6択（問題ごとに設定可能）
  - 正解は1つのみ
  - 配点：問題ごとに設定可能（1〜10点）
- 問題の並び順変更（ドラッグ&ドロップまたは番号指定）

#### 3.1.3 結果確認
- クエスト別の参加状況
  - 参加人数
  - クリア人数（クリア基準到達者）
  - 平均正答率
  - クリア率（クリア人数/参加人数）
- 生徒ごとの結果閲覧
  - 各生徒のスコア（正答率とクリア判定）
  - 問題ごとの正誤

### 3.2 生徒側機能

#### 3.2.1 クエスト一覧
- **ホーム画面**
  - 開催中のクエストを目立つカードで表示
  - 表示内容：タイトル、残り期間、報酬、クリア基準、クリア状態
  - 最大3件まで表示

- **クエストタブ**
  - 「臨時クエスト」専用セクション
  - 開催中・終了済みを切り替え表示
  - 各クエストのカード表示

#### 3.2.2 クエスト詳細
- クエスト情報の表示
  - タイトル、説明、期間、報酬
  - **クリア基準**（例：80%以上で合格）
  - 問題数
  - 参加人数（任意）
  - 自分のベストスコア

- 開始ボタン
  - 期間内のみ有効
  - 何度でも挑戦可能

#### 3.2.3 クイズ実行
- 既存のクイズ機能と同じUI
- 全問終了後に結果表示
- 初回クリア時に報酬付与

#### 3.2.4 報酬受け取り
- クリア時（設定された正答率以上）に報酬ポイント付与
- クリア基準はクエストごとに異なる（講師が設定）
- 報酬ポイント数もクエストごとに異なる（講師が設定）
- 初回クリアのみ報酬ポイント獲得
- 2回目以降は練習として何度でも挑戦可能
- 結果画面での表示
  - クリア/未クリアの判定（大きく表示）
  - 獲得点数 / 満点（例：8点 / 10点）
  - 正答率とクリア基準の比較（例：80% / 80%必要）
  - 獲得した報酬ポイント（初回クリア時のみ）
  - 問題ごとの正誤と配点

## 4. データベース設計

### 4.1 テーブル構成

#### `mukimuki_temporary_quests`
```sql
id: serial PRIMARY KEY
title: text NOT NULL
description: text NOT NULL
thumbnail_url: text
reward_points: integer NOT NULL DEFAULT 5 CHECK (reward_points >= 1 AND reward_points <= 100)
passing_score: integer NOT NULL DEFAULT 80 CHECK (passing_score >= 1 AND passing_score <= 100)
start_date: timestamptz NOT NULL
end_date: timestamptz NOT NULL
is_published: boolean NOT NULL DEFAULT false
created_by: uuid NOT NULL REFERENCES mukimuki_profiles(id)
created_at: timestamptz NOT NULL DEFAULT NOW()
updated_at: timestamptz NOT NULL DEFAULT NOW()
```

**補足説明**:
- `passing_score`: クリア基準（パーセンテージ、1〜100）
  - 例：80 = 80%以上正解でクリア
  - デフォルト: 80（80%）

#### `mukimuki_temporary_quest_questions`
```sql
id: serial PRIMARY KEY
quest_id: integer NOT NULL REFERENCES mukimuki_temporary_quests(id) ON DELETE CASCADE
question_text: text NOT NULL
choices: jsonb NOT NULL
correct_answer: integer NOT NULL
points: integer NOT NULL DEFAULT 1 CHECK (points >= 1 AND points <= 10)
explanation: text
order_num: integer NOT NULL
created_at: timestamptz NOT NULL DEFAULT NOW()
updated_at: timestamptz NOT NULL DEFAULT NOW()
UNIQUE(quest_id, order_num)
```

**補足説明**:
- `choices`: 選択肢の配列（JSONB形式）
  - 例：`["選択肢1", "選択肢2", "選択肢3", "選択肢4"]`
  - 2〜6個の選択肢を格納
- `correct_answer`: 正解の選択肢インデックス（0始まり）
  - 例：0 = 1番目、1 = 2番目
- `points`: この問題の配点（1〜10点）

#### `mukimuki_temporary_quest_results`
```sql
id: serial PRIMARY KEY
user_id: uuid NOT NULL REFERENCES mukimuki_profiles(id)
quest_id: integer NOT NULL REFERENCES mukimuki_temporary_quests(id)
score: integer NOT NULL
total_points: integer NOT NULL
percentage: integer NOT NULL
is_cleared: boolean NOT NULL
is_first_clear: boolean NOT NULL DEFAULT false
reward_points_awarded: integer NOT NULL DEFAULT 0
answers: jsonb NOT NULL
created_at: timestamptz NOT NULL DEFAULT NOW()
```

**補足説明**:
- `score`: 獲得した点数
- `total_points`: 満点の点数（各問題のpointsの合計）
- `percentage`: 正答率（パーセンテージ、0〜100）= (score / total_points) * 100
- `is_cleared`: クリアしたかどうか（percentage >= passing_score）
- `is_first_clear`: 初回クリアかどうか（報酬ポイント付与判定に使用）
- `reward_points_awarded`: 付与された報酬ポイント（questのreward_points）
- `answers`: 各問題への回答（JSONB形式）
  - 例：`[{"question_id": 1, "answer": 0, "correct": true}, ...]`

### 4.2 RLSポリシー
- 講師：全テーブルのCRUD権限
- 生徒：
  - クエスト：公開済み・期間内のみ閲覧
  - 問題：クエスト閲覧時に参照可能
  - 結果：自分の結果のみ作成・閲覧

## 5. API設計

### 5.1 講師用API
- `GET /api/temporary-quests` - クエスト一覧取得
- `POST /api/temporary-quests` - クエスト作成
- `PUT /api/temporary-quests/[id]` - クエスト更新
- `DELETE /api/temporary-quests/[id]` - クエスト削除
- `GET /api/temporary-quests/[id]/questions` - 問題一覧取得
- `POST /api/temporary-quests/[id]/questions` - 問題追加
- `PUT /api/temporary-quests/[id]/questions/[qid]` - 問題更新
- `DELETE /api/temporary-quests/[id]/questions/[qid]` - 問題削除
- `GET /api/temporary-quests/[id]/results` - クエスト結果取得

### 5.2 生徒用API
- `GET /api/temporary-quests` - 公開中のクエスト一覧
- `GET /api/temporary-quests/[id]` - クエスト詳細取得
- `GET /api/temporary-quests/[id]/questions` - 問題取得
- `POST /api/temporary-quests/[id]/submit` - 回答提出

## 6. UI設計

### 6.1 講師ダッシュボード
- `/dashboard/temporary-quests` - クエスト管理ページ
  - 一覧表示
  - 新規作成ボタン
  - 各クエストの編集・削除アクション

- `/dashboard/temporary-quests/[id]/edit` - クエスト編集ページ
  - クエスト情報編集フォーム
  - 問題管理セクション
  - プレビュー機能

### 6.2 生徒画面
- ホーム画面（`/`）
  - 「開催中の臨時クエスト」カード（お知らせの下）

- クエストタブ（HomeContent内）
  - 「臨時クエスト」セクション追加

- `/temporary-quests/[id]` - クエスト詳細ページ
  - クエスト情報表示
  - 開始ボタン

- `/temporary-quests/[id]/quiz` - クイズ実行ページ
  - 既存のクイズUIを再利用

## 7. 実装フェーズ

### Phase 1: データベース・API
- [ ] データベーステーブル作成
- [ ] RLSポリシー設定
- [ ] 講師用API実装

### Phase 2: 管理画面
- [ ] クエスト一覧ページ
- [ ] クエスト作成・編集UI
- [ ] 問題管理UI

### Phase 3: 生徒画面
- [ ] ホーム画面へのカード追加
- [ ] クエストタブへのセクション追加
- [ ] クエスト詳細ページ
- [ ] クイズ実行ページ

### Phase 4: 結果・統計
- [ ] 結果記録機能
- [ ] ポイント付与ロジック
- [ ] 講師側の結果確認UI

## 8. 備考

### 8.1 将来的な拡張案
- 難易度設定（初級・中級・上級）
- 参加条件設定（特定の章クリア済みなど）
- 特別バッジの付与
- ランキング機能
- チーム対抗戦
- 問題のランダム出題

### 8.2 注意事項
- 期間終了後もクエストは閲覧可能（挑戦は不可）
- 報酬は初回クリアのみ
- クエスト削除時は慎重に（参加履歴は保持するが問題は削除される）
