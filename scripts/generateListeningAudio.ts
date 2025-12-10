/**
 * ElevenLabs TTS を使ってリスニング問題の音声を一括生成するスクリプト
 *
 * 使用方法:
 *   npx ts-node scripts/generateListeningAudio.ts
 *
 * 必要な環境変数:
 *   ELEVENLABS_API_KEY - ElevenLabs API キー
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase Service Role Key
 *
 * 処理内容:
 *   1. Supabaseからリスニング問題を取得
 *   2. audio_url が空の問題だけを対象にする
 *   3. ElevenLabs TTS API に english_script を渡して音声を生成
 *   4. public/audio/listening/L001.mp3 のような形で保存
 *   5. 保存先のURLを audio_url として Supabase を更新
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local を読み込む（最初に実行）
const envPath = path.join(process.cwd(), '.env.local');
config({ path: envPath });

interface ListeningQuestion {
  id: string;
  audio_url: string;
  english_script: string;
  jp_question: string;
  choices: string[];
  answer_index: number;
  tags: string[];
  level: number;
  translation: string | null;
  is_published: boolean;
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
      model_id: 'eleven_multilingual_v2',
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

  // Supabase クライアント初期化
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ エラー: NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていません');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 音声保存ディレクトリ
  const audioDir = path.join(__dirname, '..', 'public', 'audio', 'listening');

  // 音声保存ディレクトリが存在しなければ作成
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Supabaseからリスニング問題を取得
  const { data: questions, error } = await supabase
    .from('mukimuki_listening_questions')
    .select('*')
    .order('id');

  if (error) {
    console.error('❌ Supabaseエラー:', error.message);
    process.exit(1);
  }

  if (!questions || questions.length === 0) {
    console.log('✅ 問題が見つかりません。');
    return;
  }

  // audio_url が空の問題をフィルタリング
  const questionsToProcess = (questions as ListeningQuestion[]).filter(
    q => !q.audio_url || q.audio_url === ''
  );

  if (questionsToProcess.length === 0) {
    console.log('✅ すべての問題に音声URLが設定されています。処理する問題はありません。');
    return;
  }

  console.log(`📝 ${questionsToProcess.length} 件の問題の音声を生成します...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const question of questionsToProcess) {
    console.log(`🔄 処理中: ${question.id}`);
    console.log(`   スクリプト: ${question.english_script.substring(0, 50)}...`);

    const outputFileName = `${question.id}.mp3`;
    const outputPath = path.join(audioDir, outputFileName);
    const audioUrl = `/audio/listening/${outputFileName}`;

    try {
      await generateAudio(question.english_script, outputPath);

      // Supabaseを更新
      const { error: updateError } = await supabase
        .from('mukimuki_listening_questions')
        .update({ audio_url: audioUrl })
        .eq('id', question.id);

      if (updateError) {
        console.error(`❌ DB更新エラー (${question.id}):`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ DB更新完了: ${question.id} -> ${audioUrl}`);
        successCount++;
      }

      // レート制限対策: 1秒待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ エラー (${question.id}):`, error instanceof Error ? error.message : error);
      errorCount++;
    }

    console.log('');
  }

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
