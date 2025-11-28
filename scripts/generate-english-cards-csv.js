const fs = require('fs');
const path = require('path');

// CSVをパース
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // カンマで分割（ただし引用符内のカンマは無視）
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length >= 3) {
      rows.push({
        number: parseInt(values[0]),
        question: values[1],
        answer: values[2]
      });
    }
  }

  return rows;
}

// デッキIDの開始番号（Supabaseで作成後に確認して変更）
// シス単: deckId 880-900
// ターゲット: deckId 901-919

console.log('=== 英単語インポート用CSV生成 ===\n');

// シス単を読み込み
const sisutanPath = path.join(__dirname, '../public/教材DB - シス単.csv');
const sisutanContent = fs.readFileSync(sisutanPath, 'utf-8');
const sisutanRows = parseCSV(sisutanContent);
console.log(`シス単: ${sisutanRows.length}語`);

// ターゲット1900を読み込み
const targetPath = path.join(__dirname, '../public/教材DB - ターゲット1900.csv');
const targetContent = fs.readFileSync(targetPath, 'utf-8');
const targetRows = parseCSV(targetContent);
console.log(`ターゲット1900: ${targetRows.length}語`);

// デッキ情報を出力
console.log('\n=== デッキ（セクション）情報 ===');
console.log('\nシス単 (21セクション):');
for (let i = 0; i < 21; i++) {
  const start = i * 100 + 1;
  const end = Math.min((i + 1) * 100, sisutanRows.length);
  console.log(`  セクション${i + 1}: ${start}-${end}`);
}

console.log('\nターゲット1900 (19セクション):');
for (let i = 0; i < 19; i++) {
  const start = i * 100 + 1;
  const end = Math.min((i + 1) * 100, targetRows.length);
  console.log(`  セクション${i + 1}: ${start}-${end}`);
}

console.log('\n=== CSVファイルを生成 ===');
console.log('デッキIDは手動でSupabaseで作成後、確認してください。');
console.log('その後、下記のスクリプトで deck_id を設定して実行してください。\n');

// サンプルCSV出力（deck_id は後で設定）
const sampleOutput = [];
sampleOutput.push('deck_id,order_num,front_text,back_text,is_published');

// シス単の最初の10語をサンプル出力
for (let i = 0; i < 10; i++) {
  const row = sisutanRows[i];
  const front = row.question.replace(/"/g, '""');
  const back = row.answer.replace(/"/g, '""');
  sampleOutput.push(`DECK_ID,${row.number},"${front}","${back}",true`);
}

console.log('サンプル出力:');
console.log(sampleOutput.join('\n'));

console.log('\n\n実際のCSVファイルを生成するには、デッキIDを設定して実行してください。');
