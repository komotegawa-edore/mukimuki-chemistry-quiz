// Supabaseに直接カードデータをインポート
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 環境変数から取得（.env.localから読み込み）
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importCards() {
  const data = JSON.parse(fs.readFileSync('./public/flashcards-import.json', 'utf-8'));

  // バッチサイズ
  const batchSize = 100;
  let totalImported = 0;

  for (let i = 0; i < data.cards.length; i += batchSize) {
    const batch = data.cards.slice(i, i + batchSize);

    const cardsToInsert = batch.map(card => ({
      deck_id: parseInt(card.section),
      front_text: card.front_text,
      back_text: card.back_text,
      order_num: card.order_num,
    }));

    const { data: inserted, error } = await supabase
      .from('mukimuki_flashcards')
      .insert(cardsToInsert);

    if (error) {
      console.error(`Error at batch ${Math.floor(i / batchSize)}:`, error.message);
    } else {
      totalImported += batch.length;
      console.log(`Imported batch ${Math.floor(i / batchSize) + 1}, total: ${totalImported}`);
    }
  }

  console.log(`Done! Total imported: ${totalImported}`);
}

importCards().catch(console.error);
