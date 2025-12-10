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
  └── listening_questions.json    # 問題データ（JSON）

lib/types/
  └── database.ts                 # ListeningQuestion型など追加

app/
  ├── api/listening/daily/
  │   └── route.ts                # 今日の3問を返すAPI
  └── listening/
      └── page.tsx                # リスニングページ

components/listening/
  └── DailyListening.tsx          # UIコンポーネント

scripts/
  └── generateListeningAudio.ts   # 音声生成スクリプト

public/audio/listening/           # 生成された音声ファイル
```

## セットアップ手順

### 1. 依存パッケージの確認

特別な追加パッケージは不要です。

### 2. 環境変数の設定（音声生成する場合）

`.env.local` に ElevenLabs API キーを追加:

```env
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

APIキーは https://elevenlabs.io/ で取得できます。

### 3. 問題データの確認

`data/listening_questions.json` にサンプル問題が10問入っています。
問題を追加・編集する場合は、以下の形式で追加してください:

```json
{
  "id": "L011",
  "audioUrl": "",
  "englishScript": "英語のスクリプト",
  "jpQuestion": "日本語の設問文",
  "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "answerIndex": 0,
  "tags": ["time", "announcement"],
  "level": 1,
  "translation": "日本語訳（任意）"
}
```

### 4. 音声ファイルの生成（オプション）

ElevenLabs APIを使って音声を生成する場合:

```bash
# ts-node をグローバルインストール（未インストールの場合）
npm install -g ts-node

# 音声生成を実行
npx ts-node scripts/generateListeningAudio.ts
```

生成された音声は `public/audio/listening/` に保存されます。

**注意:**
- ElevenLabs の無料枠は月10,000文字程度です
- 音声がなくても、英文スクリプトがテキスト表示されるので動作します

### 5. 動作確認

```bash
npm run dev
```

http://localhost:3000/listening にアクセスして動作確認。

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
  "totalQuestions": 10,
  "seed": 20251210
}
```

## 問題の追加方法

1. `data/listening_questions.json` を編集
2. 新しい問題を追加（`audioUrl` は空文字でOK）
3. 音声が必要な場合は `npx ts-node scripts/generateListeningAudio.ts` を実行

## カスタマイズ

### 出題数を変更する

`app/api/listening/daily/route.ts` の以下の部分を変更:

```typescript
// 3問 → 5問に変更する場合
const selectedQuestions = shuffledQuestions.slice(0, Math.min(5, shuffledQuestions.length));
```

### ElevenLabsのボイスを変更する

`scripts/generateListeningAudio.ts` の `DEFAULT_VOICE_ID` を変更:

```typescript
// Rachel (女性) → Adam (男性) など
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
```

利用可能なボイスIDは ElevenLabs のダッシュボードで確認できます。

## トラブルシューティング

### 音声が再生されない

- `public/audio/listening/` にファイルが存在するか確認
- ブラウザの開発者ツールでネットワークエラーを確認
- 音声がない場合は英文スクリプトが表示されます

### APIエラーが発生する

- `data/listening_questions.json` のJSON形式が正しいか確認
- サーバーを再起動（`npm run dev`）

### ElevenLabs API エラー

- APIキーが正しいか確認
- 無料枠の上限に達していないか確認
- ネットワーク接続を確認
