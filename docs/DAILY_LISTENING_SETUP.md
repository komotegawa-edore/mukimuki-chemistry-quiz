# 1分リスニングチェック セットアップガイド

毎日3問のリスニング問題に挑戦できる機能です。

## 機能概要

- 毎日同じ3問が出題される（日付シードベース）
- 英語アナウンスを聞いて4択で回答
- 正解/不正解のフィードバック + 日本語訳
- 結果画面でランク（S/A/B/C）表示

## ファイル構成

```
data/
  └── new_listening_questions.json  # 問題追加用テンプレート

lib/types/
  └── database.ts                   # ListeningQuestion型

app/
  ├── api/listening/daily/
  │   └── route.ts                  # 今日の3問を返すAPI
  └── listening/
      └── page.tsx                  # リスニングページ

components/listening/
  └── DailyListening.tsx            # UIコンポーネント

scripts/
  ├── addListeningQuestions.ts      # 問題追加スクリプト
  └── generateListeningAudio.ts     # 音声生成スクリプト

public/audio/listening/             # 生成された音声ファイル
```

## 環境変数の設定

`.env.local` に以下を追加:

```env
# Supabase（必須）
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ElevenLabs TTS（音声生成する場合）
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

---

## 問題の追加方法

### STEP 1: JSONファイルを編集

`data/new_listening_questions.json` を編集して問題を追加:

```json
{
  "questions": [
    {
      "id": "L011",
      "english_script": "Attention passengers. The train to Osaka will depart from platform 5 at 10:30.",
      "jp_question": "電車は何番ホームから出発しますか？",
      "choices": ["3番", "4番", "5番", "6番"],
      "answer_index": 2,
      "tags": ["train", "announcement"],
      "level": 1,
      "translation": "乗客の皆様にお知らせします。大阪行きの電車は10時30分に5番ホームから出発します。"
    },
    {
      "id": "L012",
      "english_script": "...",
      "jp_question": "...",
      "choices": ["...", "...", "...", "..."],
      "answer_index": 0,
      "tags": ["..."],
      "level": 1,
      "translation": "..."
    }
  ]
}
```

### フィールド説明

| フィールド | 説明 | 例 |
|-----------|------|-----|
| `id` | 問題ID（ユニーク） | `"L011"`, `"L012"` |
| `english_script` | 英語スクリプト（TTS生成・表示用） | `"Attention passengers..."` |
| `jp_question` | 日本語の質問文 | `"電車は何時に出発しますか？"` |
| `choices` | 4つの選択肢（配列） | `["9:00", "9:30", "10:00", "10:30"]` |
| `answer_index` | 正解のインデックス（0-3） | `3`（4番目が正解） |
| `tags` | タグ（任意） | `["time", "train"]` |
| `level` | 難易度（1-3） | `1` |
| `translation` | 日本語訳 | `"乗客の皆様..."` |

### STEP 2: 問題をSupabaseに追加

```bash
npx tsx scripts/addListeningQuestions.ts
```

**出力例:**
```
📝 リスニング問題の追加を開始します...

📝 5 件の問題を追加します...

🔄 追加中: L011
✅ 追加完了: L011
🔄 追加中: L012
✅ 追加完了: L012
...

========================================
📊 処理結果
========================================
✅ 成功: 5 件
❌ エラー: 0 件
========================================
```

### STEP 3: 音声ファイルを生成（オプション）

```bash
npx tsx scripts/generateListeningAudio.ts
```

**注意:**
- ElevenLabsの無料枠は月10,000文字程度
- 音声がなくても英文スクリプトがテキスト表示されます
- `audio_url`が空の問題のみ処理されます

**出力例:**
```
🎙️ リスニング問題の音声生成を開始します...

📝 5 件の問題の音声を生成します...

🔄 処理中: L011
✅ 音声を保存しました: public/audio/listening/L011.mp3
✅ DB更新完了: L011 -> /audio/listening/L011.mp3
...

========================================
📊 処理結果サマリー
========================================
✅ 成功: 5 件
❌ エラー: 0 件
📁 保存先: public/audio/listening/
========================================
```

---

## 問題作成のヒント

### 推奨する問題のタイプ

- 駅・空港のアナウンス（時刻、ホーム番号）
- バスの案内（運賃、行き先）
- 学校の連絡（集合時間、期限）
- 店舗のアナウンス（セール、営業時間）
- 会話（料金、予約）

### レベルの目安

| レベル | 難易度 | 特徴 |
|--------|--------|------|
| 1 | 易 | 数字1つ、短い文 |
| 2 | 中 | 複数の情報、少し長い文 |
| 3 | 難 | 複雑な内容、早い発話 |

### 良い問題の例

```json
{
  "id": "L015",
  "english_script": "The swimming pool will be closed from 2 PM to 4 PM for cleaning. We apologize for any inconvenience.",
  "jp_question": "プールは何時から何時まで閉まりますか？",
  "choices": ["1時から3時", "2時から4時", "3時から5時", "4時から6時"],
  "answer_index": 1,
  "tags": ["time", "facility"],
  "level": 1,
  "translation": "プールは清掃のため午後2時から4時まで閉鎖します。ご不便をおかけして申し訳ございません。"
}
```

---

## API仕様

### GET /api/listening/daily

今日の3問を取得します。

**レスポンス例:**
```json
{
  "questions": [
    {
      "id": "L001",
      "audioUrl": "/audio/listening/L001.mp3",
      "englishScript": "...",
      "jpQuestion": "...",
      "choices": ["...", "...", "...", "..."],
      "answerIndex": 1,
      "tags": ["time", "train"],
      "level": 1,
      "translation": "..."
    }
  ],
  "date": "2025-12-10",
  "totalQuestions": 30,
  "seed": 20251210
}
```

---

## カスタマイズ

### 出題数を変更する

`app/api/listening/daily/route.ts`:

```typescript
// 3問 → 5問に変更
const selectedQuestions = shuffledQuestions.slice(0, Math.min(5, shuffledQuestions.length));
```

### ElevenLabsのボイスを変更する

`scripts/generateListeningAudio.ts`:

```typescript
// Rachel (女性) → 別のボイスに変更
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
```

---

## トラブルシューティング

### 問題追加スクリプトが動かない

```
❌ 環境変数が設定されていません
```
→ `.env.local` に `SUPABASE_SERVICE_ROLE_KEY` を設定

### 音声生成でエラー

```
ElevenLabs API エラー: 401 - quota_exceeded
```
→ ElevenLabsの無料枠を使い切った。翌月まで待つか有料プランへ

### 音声が再生されない

- `public/audio/listening/` にファイルが存在するか確認
- ブラウザキャッシュをクリア
- 音声がない場合は英文スクリプトが表示されます
