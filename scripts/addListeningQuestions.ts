/**
 * リスニング問題をSupabaseに追加するスクリプト
 *
 * 使用方法:
 *   npx tsx scripts/addListeningQuestions.ts
 *
 * 事前準備:
 *   1. data/new_listening_questions.json に追加したい問題を記載
 *   2. .env.local に SUPABASE_SERVICE_ROLE_KEY を設定
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local') });

interface ListeningQuestion {
  id: string;
  english_script: string;
  jp_question: string;
  choices: string[];
  answer_index: number;
  tags: string[];
  level: number;
  translation: string;
}

interface InputData {
  questions: ListeningQuestion[];
}

async function main(): Promise<void> {
  console.log('📝 リスニング問題の追加を開始します...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 環境変数が設定されていません');
    console.error('   NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // JSONファイルを読み込む
  const inputPath = path.join(process.cwd(), 'data', 'new_listening_questions.json');

  if (!fs.existsSync(inputPath)) {
    console.error('❌ data/new_listening_questions.json が見つかりません');
    console.error('   テンプレートを作成しますか？ (data/new_listening_questions.json)');

    // テンプレートを作成
    const template: InputData = {
      questions: [
        {
          id: 'L031',
          english_script: 'Your English script here.',
          jp_question: '日本語の質問文',
          choices: ['選択肢A', '選択肢B', '選択肢C', '選択肢D'],
          answer_index: 0,
          tags: ['time', 'announcement'],
          level: 1,
          translation: '英文の日本語訳'
        }
      ]
    };

    fs.writeFileSync(inputPath, JSON.stringify(template, null, 2), 'utf-8');
    console.log('✅ テンプレートを作成しました: data/new_listening_questions.json');
    console.log('   このファイルを編集してから再度実行してください');
    process.exit(0);
  }

  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const data: InputData = JSON.parse(rawData);

  if (!data.questions || data.questions.length === 0) {
    console.log('✅ 追加する問題がありません');
    return;
  }

  console.log(`📝 ${data.questions.length} 件の問題を追加します...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const q of data.questions) {
    console.log(`🔄 追加中: ${q.id}`);

    const { error } = await supabase
      .from('mukimuki_listening_questions')
      .upsert({
        id: q.id,
        audio_url: '',
        english_script: q.english_script,
        jp_question: q.jp_question,
        choices: q.choices,
        answer_index: q.answer_index,
        tags: q.tags,
        level: q.level,
        translation: q.translation,
        is_published: true
      });

    if (error) {
      console.error(`❌ エラー (${q.id}):`, error.message);
      errorCount++;
    } else {
      console.log(`✅ 追加完了: ${q.id}`);
      successCount++;
    }
  }

  console.log('\n========================================');
  console.log('📊 処理結果');
  console.log('========================================');
  console.log(`✅ 成功: ${successCount} 件`);
  console.log(`❌ エラー: ${errorCount} 件`);
  console.log('========================================');

  if (successCount > 0) {
    console.log('\n💡 次のステップ:');
    console.log('   音声を生成する場合は以下を実行:');
    console.log('   npx tsx scripts/generateListeningAudio.ts');
  }
}

main().catch(console.error);
