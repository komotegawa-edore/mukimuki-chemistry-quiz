const fs = require('fs');
const path = require('path');

// CSVをパース（Windows改行対応）
function parseCSV(content) {
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.trim().split('\n');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(/^(\d+),([^,]+),(.+)$/);
    if (match) {
      data.push({
        number: parseInt(match[1]),
        front: match[2].trim(),
        back: match[3].trim()
      });
    }
  }
  return data;
}

// CSVエスケープ
function escapeCSV(str) {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// シス単のデッキID: 81-101
const sisTanDeckIds = [];
for (let i = 81; i <= 101; i++) {
  sisTanDeckIds.push(i);
}

// ターゲット1900のデッキID: 102-120
const targetDeckIds = [];
for (let i = 102; i <= 120; i++) {
  targetDeckIds.push(i);
}

// シス単の読み込み
const sisTanPath = path.join(__dirname, '../public/教材DB - シス単.csv');
const sisTanContent = fs.readFileSync(sisTanPath, 'utf-8');
const sisTanData = parseCSV(sisTanContent);

// ターゲット1900の読み込み
const targetPath = path.join(__dirname, '../public/教材DB - ターゲット1900.csv');
const targetContent = fs.readFileSync(targetPath, 'utf-8');
const targetData = parseCSV(targetContent);

// CSV生成
let csv = 'deck_id,front_text,back_text,order_num,is_published\n';

// シス単
sisTanData.forEach((item, index) => {
  const deckIndex = Math.floor(index / 100);
  const deckId = sisTanDeckIds[deckIndex];
  csv += `${deckId},${escapeCSV(item.front)},${escapeCSV(item.back)},${item.number},true\n`;
});

// ターゲット1900
targetData.forEach((item, index) => {
  const deckIndex = Math.floor(index / 100);
  const deckId = targetDeckIds[deckIndex];
  csv += `${deckId},${escapeCSV(item.front)},${escapeCSV(item.back)},${item.number},true\n`;
});

// CSVファイルとして出力
const outputPath = path.join(__dirname, '../public/flashcards-import.csv');
fs.writeFileSync(outputPath, csv);

console.log('CSV生成完了: ' + outputPath);
console.log('シス単: ' + sisTanData.length + '語');
console.log('ターゲット1900: ' + targetData.length + '語');
console.log('合計: ' + (sisTanData.length + targetData.length) + '語');
