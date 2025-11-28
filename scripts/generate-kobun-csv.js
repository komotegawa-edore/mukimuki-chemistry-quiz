const fs = require('fs');
const path = require('path');

// CSVをパース（Windows改行対応、カンマを含む解答に対応）
function parseCSV(content) {
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.trim().split('\n');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 番号,問題,解答 の形式（解答にカンマが含まれる可能性あり）
    // "で囲まれている場合も対応
    let match;

    // パターン1: 番号,問題,"解答" （ダブルクォートで囲まれている）
    match = line.match(/^(\d+),([^,]+),"(.+)"$/);
    if (match) {
      data.push({
        number: parseInt(match[1]),
        front: match[2].trim(),
        back: match[3].trim()
      });
      continue;
    }

    // パターン2: 番号,問題,解答 （通常形式）
    match = line.match(/^(\d+),([^,]+),(.+)$/);
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

// 古文単語315のデッキID: 121-124
const kobun315DeckIds = [121, 122, 123, 124];

// ゴロゴプレミアムのデッキID: 125-130
const gorogoDeckIds = [125, 126, 127, 128, 129, 130];

// 古文単語315の読み込み
const kobun315Path = path.join(__dirname, '../public/教材DB - 古文単語315.csv');
const kobun315Content = fs.readFileSync(kobun315Path, 'utf-8');
const kobun315Data = parseCSV(kobun315Content);

// ゴロゴプレミアムの読み込み
const gorogoPath = path.join(__dirname, '../public/教材DB - 古文単語ゴロゴプレミアム.csv');
const gorogoContent = fs.readFileSync(gorogoPath, 'utf-8');
const gorogoData = parseCSV(gorogoContent);

console.log('古文単語315: ' + kobun315Data.length + '語読み込み');
console.log('ゴロゴプレミアム: ' + gorogoData.length + '語読み込み');

// CSV生成
let csv = 'deck_id,front_text,back_text,order_num,is_published\n';

// 古文単語315
kobun315Data.forEach((item, index) => {
  const deckIndex = Math.floor(index / 100);
  const deckId = kobun315DeckIds[deckIndex];
  csv += deckId + ',' + escapeCSV(item.front) + ',' + escapeCSV(item.back) + ',' + item.number + ',true\n';
});

// ゴロゴプレミアム
gorogoData.forEach((item, index) => {
  const deckIndex = Math.floor(index / 100);
  const deckId = gorogoDeckIds[deckIndex];
  csv += deckId + ',' + escapeCSV(item.front) + ',' + escapeCSV(item.back) + ',' + item.number + ',true\n';
});

// CSVファイルとして出力
const outputPath = path.join(__dirname, '../public/kobun-flashcards-import.csv');
fs.writeFileSync(outputPath, csv);

console.log('\nCSV生成完了: ' + outputPath);
console.log('古文単語315: ' + kobun315Data.length + '語 → ' + kobun315DeckIds.length + 'デッキ');
console.log('ゴロゴプレミアム: ' + gorogoData.length + '語 → ' + gorogoDeckIds.length + 'デッキ');
console.log('合計: ' + (kobun315Data.length + gorogoData.length) + '語');
