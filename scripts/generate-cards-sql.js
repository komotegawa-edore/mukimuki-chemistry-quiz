// カードインポート用SQLを生成
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/flashcards-import.json', 'utf-8'));

// deck_idはcategory番号と一致する
// SQLを分割して出力（大きすぎるため）
const batchSize = 200;
let batch = 0;
let currentBatch = [];

function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

for (const card of data.cards) {
  const deckId = parseInt(card.section);
  const frontText = escapeSQL(card.front_text);
  const backText = escapeSQL(card.back_text);
  const orderNum = card.order_num;

  currentBatch.push(`(${deckId}, '${frontText}', '${backText}', ${orderNum})`);

  if (currentBatch.length >= batchSize) {
    const sql = `INSERT INTO mukimuki_flashcards (deck_id, front_text, back_text, order_num) VALUES\n${currentBatch.join(',\n')};\n`;
    fs.writeFileSync(`./scripts/cards-batch-${batch}.sql`, sql);
    console.log(`Generated batch ${batch} with ${currentBatch.length} cards`);
    batch++;
    currentBatch = [];
  }
}

// 残りを出力
if (currentBatch.length > 0) {
  const sql = `INSERT INTO mukimuki_flashcards (deck_id, front_text, back_text, order_num) VALUES\n${currentBatch.join(',\n')};\n`;
  fs.writeFileSync(`./scripts/cards-batch-${batch}.sql`, sql);
  console.log(`Generated batch ${batch} with ${currentBatch.length} cards`);
}

console.log('Done! Total batches:', batch + 1);
