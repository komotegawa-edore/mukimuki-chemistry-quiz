/**
 * 韓国語クイズ結果テーブル作成スクリプト
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createTable() {
  console.log('🔧 Creating mukimuki_korean_quiz_results table...')

  const sql = `
    CREATE TABLE IF NOT EXISTS public.mukimuki_korean_quiz_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      category TEXT,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      phrase_ids TEXT[] NOT NULL,
      answers JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_korean_quiz_results_session
      ON mukimuki_korean_quiz_results(session_id);
    CREATE INDEX IF NOT EXISTS idx_korean_quiz_results_created
      ON mukimuki_korean_quiz_results(created_at DESC);

    ALTER TABLE mukimuki_korean_quiz_results ENABLE ROW LEVEL SECURITY;

    -- RLSポリシー（存在しない場合のみ作成）
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'mukimuki_korean_quiz_results'
        AND policyname = 'Anyone can insert korean quiz results'
      ) THEN
        CREATE POLICY "Anyone can insert korean quiz results"
          ON mukimuki_korean_quiz_results
          FOR INSERT
          WITH CHECK (true);
      END IF;
    END $$;
  `

  // Supabase REST APIではDDLは実行できないため、
  // 既存のテーブルがあるかチェック
  const { data, error } = await supabase
    .from('mukimuki_korean_quiz_results')
    .select('id')
    .limit(1)

  if (error && error.code === '42P01') {
    console.log('Table does not exist. Please run the SQL manually in Supabase Dashboard.')
    console.log('\n--- SQL to run ---')
    console.log(sql)
    console.log('------------------\n')
  } else if (error) {
    console.error('Error checking table:', error)
  } else {
    console.log('✅ Table already exists!')
  }
}

createTable().catch(console.error)
