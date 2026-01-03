# 韓国語フレーズ生成スクリプト

## セットアップ

### 1. 環境変数を設定
`.env.local` に以下を追加:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# ElevenLabs
ELEVENLABS_API_KEY=...

# Supabase (Service Role Key - 管理者権限)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 2. Supabase Storage バケット作成
スクリプトが自動で `korean-audio` バケットを作成します。
手動で作成する場合は Supabase Dashboard → Storage → New Bucket

## 使い方

### フレーズ生成（GPT-4 + ElevenLabs + DB登録）
```bash
npx tsx scripts/korean/generate-phrases.ts
```

このスクリプトは以下を実行:
1. GPT-4で韓国語フレーズを生成（5カテゴリ × 5問 = 25問）
2. ElevenLabsで音声を生成
3. Supabase Storageにアップロード
4. データベースに登録

### 設定変更
`generate-phrases.ts` の `CONFIG` を編集:

```typescript
const CONFIG = {
  phrasesPerCategory: 5,  // カテゴリごとの問題数
  categories: ['love', 'breakup', 'friendship', 'hope', 'daily'],
  elevenLabsVoiceId: 'XB0fDUnXU5powFXDhCwa',  // 音声ID
}
```

## ElevenLabsの音声ID

推奨音声（韓国語対応）:
- `XB0fDUnXU5powFXDhCwa` - Charlotte (multilingual)
- `EXAVITQu4vr4xnSDxMaL` - Bella (multilingual)

音声一覧: https://elevenlabs.io/app/voice-library

## トラブルシューティング

### 音声生成エラー
- ElevenLabsのクレジット残高を確認
- APIキーが正しいか確認

### DB登録エラー
- Service Role Keyが正しいか確認
- テーブルが存在するか確認
