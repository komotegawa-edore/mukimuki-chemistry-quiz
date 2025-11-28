// APIを通じてカードをインポートするスクリプト
// 使い方: ブラウザのコンソールで実行

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/flashcards-import.json', 'utf-8'));

// セクションごとにグループ化
const cardsBySection = {};
for (const card of data.cards) {
  if (!cardsBySection[card.section]) {
    cardsBySection[card.section] = [];
  }
  cardsBySection[card.section].push(card);
}

// セクション4以降のSQL生成
let sql = '';
const sections = Object.keys(cardsBySection).sort((a, b) => parseInt(a) - parseInt(b));

for (const section of sections) {
  const sectionNum = parseInt(section);
  if (sectionNum <= 3) continue; // すでにインポート済み

  const cards = cardsBySection[section];

  sql += `-- セクション ${section}\n`;
  sql += `INSERT INTO mukimuki_flashcards (deck_id, front_text, back_text, order_num) VALUES\n`;

  const values = cards.map(card => {
    const frontText = card.front_text.replace(/'/g, "''");
    const backText = card.back_text.replace(/'/g, "''");
    return `(${sectionNum}, '${frontText}', '${backText}', ${card.order_num})`;
  });

  sql += values.join(',\n') + ';\n\n';
}

// SQLファイルに出力
fs.writeFileSync('./scripts/remaining-cards.sql', sql);
console.log(`Generated SQL for sections 4-79`);
