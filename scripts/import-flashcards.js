const fs = require('fs');
const path = require('path');

// CSVをパース（Windows改行対応）
function parseCSV(content) {
  // \r\nを\nに正規化
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.trim().split('\n');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSVの各行をパース（カンマを含む可能性があるので注意）
    const match = line.match(/^(\d+),([^,]+),(.+)$/);
    if (match) {
      data.push({
        number: parseInt(match[1]),
        front: match[2].trim(),
        back: match[3].trim()
      });
    } else {
      console.log('パースエラー行: ' + i + ' -> ' + line.substring(0, 50));
    }
  }
  return data;
}

// シス単のデッキID: 81-101 (100語ずつ、最後は26語)
// ターゲット1900のデッキID: 102-120 (100語ずつ、最後は99語)

const sisTanDeckIds = [];
for (let i = 81; i <= 101; i++) {
  sisTanDeckIds.push(i);
}

const targetDeckIds = [];
for (let i = 102; i <= 120; i++) {
  targetDeckIds.push(i);
}

// シス単の読み込み
const sisTanPath = path.join(__dirname, '../public/教材DB - シス単.csv');
const sisTanContent = fs.readFileSync(sisTanPath, 'utf-8');
const sisTanData = parseCSV(sisTanContent);

console.log('シス単: ' + sisTanData.length + '語読み込み');

// ターゲット1900の読み込み
const targetPath = path.join(__dirname, '../public/教材DB - ターゲット1900.csv');
const targetContent = fs.readFileSync(targetPath, 'utf-8');
const targetData = parseCSV(targetContent);

console.log('ターゲット1900: ' + targetData.length + '語読み込み');

// SQLを生成
let sql = '';

// シス単のSQL
sisTanData.forEach((item, index) => {
  const deckIndex = Math.floor(index / 100);
  const deckId = sisTanDeckIds[deckIndex];
  const orderNum = item.number;
  const frontText = item.front.replace(/'/g, "''");
  const backText = item.back.replace(/'/g, "''");

  sql += 'INSERT INTO mukimuki_flashcards (deck_id, front_text, back_text, order_num, is_published) VALUES (' + deckId + ', \'' + frontText + '\', \'' + backText + '\', ' + orderNum + ', true);\n';
});

// ターゲット1900のSQL
targetData.forEach((item, index) => {
  const deckIndex = Math.floor(index / 100);
  const deckId = targetDeckIds[deckIndex];
  const orderNum = item.number;
  const frontText = item.front.replace(/'/g, "''");
  const backText = item.back.replace(/'/g, "''");

  sql += 'INSERT INTO mukimuki_flashcards (deck_id, front_text, back_text, order_num, is_published) VALUES (' + deckId + ', \'' + frontText + '\', \'' + backText + '\', ' + orderNum + ', true);\n';
});

// SQLファイルとして出力
const outputPath = path.join(__dirname, 'flashcards-import.sql');
fs.writeFileSync(outputPath, sql);

console.log('\nSQL生成完了: ' + outputPath);
console.log('シス単: ' + sisTanData.length + '語 → ' + sisTanDeckIds.length + 'デッキ');
console.log('ターゲット1900: ' + targetData.length + '語 → ' + targetDeckIds.length + 'デッキ');
