/**
 * ElevenLabs TTS を使ってリスニング問題の音声を一括生成するスクリプト
 *
 * 使用方法:
 *   npx ts-node scripts/generateListeningAudio.ts
 *
 * 必要な環境変数:
 *   ELEVENLABS_API_KEY - ElevenLabs API キー
 *
 * 処理内容:
 *   1. data/listening_questions.json を読み込む
 *   2. audioUrl が空の問題だけを対象にする
 *   3. ElevenLabs TTS API に englishScript を渡して音声を生成
 *   4. public/audio/listening/L001.mp3 のような形で保存
 *   5. 保存先のURLを audioUrl として JSON に書き戻す
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local を読み込む
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

interface ListeningQuestion {
  id: string;
  audioUrl: string;
  englishScript: string;
  jpQuestion: string;
  choices: string[];
  answerIndex: number;
  tags: string[];
  level: number;
  translation?: string;
}

interface ListeningData {
  questions: ListeningQuestion[];
}

// ElevenLabs API設定
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
// Rachel (アメリカ英語の女性ボイス) - クリアで聞き取りやすい
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

async function generateAudio(text: string, outputPath: string): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY が設定されていません。.env.local に追加してください。');
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/${DEFAULT_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API エラー: ${response.status} - ${errorText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
  console.log(`✅ 音声を保存しました: ${outputPath}`);
}

async function main(): Promise<void> {
  console.log('🎙️ リスニング問題の音声生成を開始します...\n');

  // JSONファイルのパス
  const dataPath = path.join(__dirname, '..', 'data', 'listening_questions.json');
  const audioDir = path.join(__dirname, '..', 'public', 'audio', 'listening');

  // 音声保存ディレクトリが存在しなければ作成
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // JSONファイルを読み込む
  if (!fs.existsSync(dataPath)) {
    console.error('❌ エラー: data/listening_questions.json が見つかりません');
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data: ListeningData = JSON.parse(rawData);

  // audioUrl が空の問題をフィルタリング
  const questionsToProcess = data.questions.filter(q => !q.audioUrl || q.audioUrl === '');

  if (questionsToProcess.length === 0) {
    console.log('✅ すべての問題に音声URLが設定されています。処理する問題はありません。');
    return;
  }

  console.log(`📝 ${questionsToProcess.length} 件の問題の音声を生成します...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const question of questionsToProcess) {
    console.log(`🔄 処理中: ${question.id}`);
    console.log(`   スクリプト: ${question.englishScript.substring(0, 50)}...`);

    const outputFileName = `${question.id}.mp3`;
    const outputPath = path.join(audioDir, outputFileName);
    const audioUrl = `/audio/listening/${outputFileName}`;

    try {
      await generateAudio(question.englishScript, outputPath);

      // JSONデータを更新
      const index = data.questions.findIndex(q => q.id === question.id);
      if (index !== -1) {
        data.questions[index].audioUrl = audioUrl;
      }

      successCount++;

      // レート制限対策: 1秒待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ エラー (${question.id}):`, error instanceof Error ? error.message : error);
      errorCount++;
    }

    console.log('');
  }

  // 更新したJSONを保存
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('💾 listening_questions.json を更新しました\n');

  // 結果サマリー
  console.log('========================================');
  console.log('📊 処理結果サマリー');
  console.log('========================================');
  console.log(`✅ 成功: ${successCount} 件`);
  console.log(`❌ エラー: ${errorCount} 件`);
  console.log(`📁 保存先: public/audio/listening/`);
  console.log('========================================');
}

main().catch(console.error);
