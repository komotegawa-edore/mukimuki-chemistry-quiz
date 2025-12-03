const fs = require('fs');
const path = require('path');

// CSVファイルを読み込む
const csvPath = path.join(__dirname, '../public/Roopy - Roopy (1).csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// CSVをパース
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');
const rows = lines.slice(1);

// 既存データとの重複チェック用にmaterial_nameでグループ化
const materials = rows.map((line, index) => {
    // カンマを考慮してパース（ダブルクォートで囲まれた値を処理）
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
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

    // CSVの列: ステージID,ステージ名,教材名,教材カテゴリ,章番号,章名,推奨日数,標準時間（分/章）,総章数,入門レベル,推奨周回数,備考,画像のアドレス
    const [stageId, stageName, materialName, category, chapterRange, chapterName, recommendedDays, standardMinutes, totalChapters, difficultyLevel, recommendedCycles, notes, imageUrl] = values;

    // 推奨日数の処理（「常時」は-1として保存、数値の場合はそのまま）
    let recDays = null;
    if (recommendedDays === '常時') {
        recDays = -1; // 常時は-1
    } else if (recommendedDays && !isNaN(parseInt(recommendedDays))) {
        recDays = parseInt(recommendedDays);
    }

    // 推奨周回数の処理（'N'は1として処理）
    let recCycles = 1;
    if (recommendedCycles && recommendedCycles !== 'N' && !isNaN(parseInt(recommendedCycles))) {
        recCycles = parseInt(recommendedCycles);
    }

    // 総章数の処理（数値以外の値を処理）
    let totalCh = null;
    if (totalChapters) {
        // 「1500語」「約3000語」「全編」「網羅」などから数値を抽出
        const match = totalChapters.match(/\d+/);
        if (match) {
            totalCh = parseInt(match[0]);
        }
    }

    return {
        stageId: stageId || '',
        stageName: stageName || '',
        materialName: materialName || '',
        category: category || '',
        chapterRange: chapterRange === '*' ? null : chapterRange,
        chapterName: chapterName === '各章' || chapterName === '*' ? null : chapterName,
        recommendedDays: recDays,
        standardMinutes: standardMinutes && !isNaN(parseInt(standardMinutes)) ? parseInt(standardMinutes) : null,
        totalChapters: totalCh,
        difficultyLevel: difficultyLevel || null,
        recommendedCycles: recCycles,
        notes: notes || null,
        imageUrl: imageUrl || null,
        displayOrder: index + 1
    };
});

// SQLを生成
console.log('-- 英語教材データのインポート');
console.log('-- 既存データを一度削除してから挿入');
console.log('TRUNCATE TABLE mukimuki_english_materials RESTART IDENTITY CASCADE;');
console.log('');
console.log('INSERT INTO mukimuki_english_materials (');
console.log('  stage_id, stage_name, material_name, material_category,');
console.log('  chapter_range, chapter_name, recommended_days, standard_minutes_per_chapter,');
console.log('  total_chapters, difficulty_level, recommended_cycles, notes, image_url, display_order, is_published');
console.log(') VALUES');

const sqlValues = materials.map((m, i) => {
    const escape = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
    const num = (n) => n !== null && n !== undefined ? n : 'NULL';

    return `(
  ${escape(m.stageId)}, ${escape(m.stageName)}, ${escape(m.materialName)}, ${escape(m.category)},
  ${escape(m.chapterRange)}, ${escape(m.chapterName)}, ${num(m.recommendedDays)}, ${num(m.standardMinutes)},
  ${num(m.totalChapters)}, ${escape(m.difficultyLevel)}, ${num(m.recommendedCycles)}, ${escape(m.notes)}, ${escape(m.imageUrl)}, ${m.displayOrder}, true
)`;
});

console.log(sqlValues.join(',\n') + ';');

console.log('');
console.log('-- 教材数:', materials.length);
