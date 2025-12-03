-- 英語教材データのインポート
-- 既存データを一度削除してから挿入
TRUNCATE TABLE mukimuki_english_materials RESTART IDENTITY CASCADE;

INSERT INTO mukimuki_english_materials (
  stage_id, stage_name, material_name, material_category,
  chapter_range, chapter_name, recommended_days, standard_minutes_per_chapter,
  total_chapters, difficulty_level, recommended_cycles, notes, image_url, display_order, is_published
) VALUES
(
  'E1', '英単語基礎', 'システム英単語Basic', '英単語',
  NULL, NULL, -1, 20,
  1500, '初級', 1, '中学版やTarget1200でも可。基礎単語の徹底。', 'https://m.media-amazon.com/images/I/91AI7DIgNnL._SY445_SX342_ML2_.jpg', 1, true
),
(
  'E1', '英単語基礎', 'Stock3000', '英単語',
  NULL, NULL, -1, 20,
  3000, '初級', 1, '基礎から学び直す人向け。', 'https://m.media-amazon.com/images/I/51Nsf2KxTuL._SY522_.jpg', 2, true
),
(
  'E1', '英単語基礎', '英単語ターゲット1400', '英単語',
  NULL, NULL, -1, 20,
  1400, '初級', 1, '基礎固め用。', 'https://m.media-amazon.com/images/I/41ZzIhAQtfL._SY445_SX342_ML2_.jpg', 3, true
),
(
  'E2', '英単語標準', 'システム英単語', '英単語',
  '1-1200', NULL, -1, 20,
  1200, '初級', 1, '1200番までが基礎。1日100個ペース推奨。', 'https://m.media-amazon.com/images/I/41Y71rpDQPL._SY445_SX342_ML2_.jpg', 4, true
),
(
  'E2', '英単語標準', '英単語ターゲット1900', '英単語',
  '1-800', NULL, -1, 20,
  800, '初級', 1, '800番までが基礎。', 'https://m.media-amazon.com/images/I/417gMKTA1pL._SY445_SX342_ML2_.jpg', 5, true
),
(
  'E2', '英単語標準', 'Stock4500', '英単語',
  NULL, NULL, -1, 20,
  4500, '中級', 1, '標準レベルの単語。', 'https://m.media-amazon.com/images/I/51FF+0KmmzL._SY522_.jpg', 6, true
),
(
  'E2', '英単語標準', '鉄緑会東大英単語熟語 鉄壁', '英単語',
  NULL, '各Section', -1, 30,
  3000, '上級', 1, '語源や派生語に強い。自信がある人向け。', 'https://m.media-amazon.com/images/I/51VcmFf+4YL._SY445_SX342_ML2_.jpg', 7, true
),
(
  'E3', '英熟語', '速読英熟語', '英熟語',
  NULL, NULL, -1, 20,
  850, '中級', 1, '文章は最初は読まなくても良い。熟語を覚えること優先。', 'https://m.media-amazon.com/images/I/31nq+q0GKyL._SY445_SX342_ML2_.jpg', 8, true
),
(
  'E3', '英熟語', '英熟語ターゲット1000', '英熟語',
  NULL, NULL, -1, 20,
  1000, '中級', 1, 'シンプルに覚えたい人向け。', 'https://m.media-amazon.com/images/I/51-BbmgVqnS._SY445_SX342_ML2_.jpg', 9, true
),
(
  'E3', '英熟語', '英熟語図鑑', '英熟語',
  NULL, NULL, -1, 20,
  NULL, '中級', 1, 'イメージで覚える。', 'https://m.media-amazon.com/images/I/81L4yreFRKL._SY522_.jpg', 10, true
),
(
  'E4', '中学復習', '中学英語をもう一度ひとつひとつわかりやすく。', '文法',
  NULL, NULL, 14, 30,
  NULL, '初級', 1, '中学英語に不安がある場合はここから。', 'https://m.media-amazon.com/images/I/61HhuFBIYhL._SY522_.jpg', 11, true
),
(
  'E4', '基礎文法', '大岩のいちばんはじめの英文法【超基礎文法編】', '文法',
  '1-25', '各講', 14, 30,
  25, '初級', 2, '読んで閉じて説明できるか確認。「わかったつもり」を防ぐ。', 'https://m.media-amazon.com/images/I/71aVXsROpTL._SY522_.jpg', 12, true
),
(
  'E4', '基礎文法', '肘井学のゼロから英文法が面白いほどわかる本', '文法',
  NULL, '各テーマ', 14, 30,
  NULL, '初級', 2, '基礎文法の導入に最適。', 'https://m.media-amazon.com/images/I/81xTyiEGiaL._SY522_.jpg', 13, true
),
(
  'E5', '文法ドリル', '英文法パターンドリル', '文法演習',
  NULL, NULL, 21, 20,
  NULL, '初級', 2, '文を作ることで理解を深める。', 'https://m.media-amazon.com/images/I/71FvwMljLsL._SY522_.jpg', 14, true
),
(
  'E5', '解釈ドリル', '高校英文読解をひとつひとつわかりやすく。', '解釈',
  NULL, NULL, 21, 20,
  NULL, '初級', 1, '訳すことに特化したドリル。', 'https://m.media-amazon.com/images/I/61vlpF2DypL._SY522_.jpg', 15, true
),
(
  'E6', '標準文法', '関正生の英文法ポラリス1', '文法',
  '1-30', '各Unit', 21, 30,
  370, '中級', 2, '理由付きで正解を選べるようにする。', 'https://m.media-amazon.com/images/I/517Pw66+z-L._SY445_SX342_ML2_.jpg', 16, true
),
(
  'E6', '標準文法', '関正生の英文法ポラリス1 ファイナル演習編', '文法',
  NULL, '各回', 14, 30,
  300, '中級', 1, '通称「黒ポラリス」。ランダム演習で実力確認。', 'https://m.media-amazon.com/images/I/71d2qWoBDPL._SY522_.jpg', 17, true
),
(
  'E6', '網羅文法', 'Vintage', '文法',
  NULL, NULL, -1, 30,
  NULL, '中級', 1, '日大レベル後半から開始。知識の穴埋め。', 'https://m.media-amazon.com/images/I/718q30+sdnL._SY522_.jpg', 18, true
),
(
  'E7', '英文解釈', '動画でわかる英文法 [読解入門編]', '解釈',
  NULL, '各テーマ', 21, 40,
  NULL, '中級', 2, '「見抜く」プロセスを大事にする。QRコードの動画も活用。', 'https://m.media-amazon.com/images/I/51bvR6vr8PL._SY445_SX342_ML2_.jpg', 19, true
),
(
  'E7', '解釈演習', '大学入試 はじめの英文読解ドリル', '解釈',
  NULL, NULL, 14, 30,
  NULL, '中級', 2, 'ドリル形式でSVOC振りと和訳を徹底練習。', 'https://m.media-amazon.com/images/I/51rfrVNGMgL._SY445_SX342_ML2_.jpg', 20, true
),
(
  'E7', '英文解釈入門', '肘井の読解のための英文法', '文法',
  '1-15', NULL, 60, 30,
  15, '中級〜上級', 2, 'S,V,O,Cの役割を理解して読解力の基礎をつける。全てはここから始まる。', 'https://m.media-amazon.com/images/I/51MDoM6feWL._SY445_SX342_ML2_.jpg', 21, true
),
(
  'E7', '英文解釈', '入門英文解釈の技術70', '英文解釈',
  '1-70', '各技術', 60, 30,
  70, '中級', 1, '構文把握の核', 'https://m.media-amazon.com/images/I/91GZSeQSToL._SY522_.jpg', 22, true
),
(
  'E7', '英文解釈', '入門英文問題精講', '解釈',
  NULL, '各問', 14, 40,
  NULL, '中級', 2, '竹岡先生の著書。解釈の標準。', 'https://m.media-amazon.com/images/I/51mhbZyMK8L._SY522_.jpg', 23, true
),
(
  'E7', '英文解釈', '英文読解の基礎・必修編（クラシック）', '解釈',
  NULL, '各講', 20, 45,
  NULL, '上級', 2, '本質的な理解を深める。難易度高め。', 'https://m.media-amazon.com/images/I/41FjaZR+T9L._SY445_SX342_ML2_.jpg', 24, true
),
(
  'E8', '基礎長文', '東進レベル別英語長文1・2', '長文',
  '1-20', '各レベル', 60, 20,
  20, '中級', 1, '高校入試プラスアルファくらいの優しめの長文に慣れる', 'https://m.media-amazon.com/images/I/41MceiL-h7L._SY445_SX342_ML2_.jpg', 25, true
),
(
  'E8', '基礎長文', '関正生のThe Rules 英語長文問題集1', '長文',
  '1-12', '各問', 12, 40,
  12, '中級', 1, '解説の「ルール」を意識して読む。音読必須。', 'https://m.media-amazon.com/images/I/41YG4WLnRfL._SY445_SX342_ML2_.jpg', 26, true
),
(
  'E8', '標準長文', 'ソリューション1', '英文解釈',
  '1-30', NULL, 60, 30,
  30, '中級〜上級', 2, '読解の基礎固め', 'https://m.media-amazon.com/images/I/71HWNx2SLYL._SY522_.jpg', 27, true
),
(
  'E8', '標準長文', '関正生のThe Rules 英語長文問題集2', '長文',
  '1-12', '各問', 12, 40,
  12, '中級', 1, '入試標準レベル。復習・音読を徹底。', 'https://m.media-amazon.com/images/I/71AeMUR10KL._SY522_.jpg', 28, true
),
(
  'E8', '標準長文', '東進レベル別英語長文3', '長文',
  '1-20', '各レベル', 60, 20,
  20, '中級', 1, '短めの長文で安定化', 'https://m.media-amazon.com/images/I/41pn2alIS1L._SY445_SX342_ML2_.jpg', 29, true
),
(
  'E8', '標準長文', '関正生の英語長文ポラリス1', '長文',
  '1-12', '各問', 12, 40,
  12, '中級', 1, '日大レベルの総仕上げ。', 'https://m.media-amazon.com/images/I/71ba2fFyvpL._SY522_.jpg', 30, true
),
(
  'E8', '基礎長文', '関正生の英語長文ポラリス0', '長文',
  '1-12', '各問', 12, 35,
  12, '初級', 1, '英語長文の導入。', 'https://m.media-amazon.com/images/I/7150QJvuNPL._SY522_.jpg', 31, true
),
(
  'E9', '応用解釈', '関正生の英文解釈ポラリス1', '解釈',
  '1-11', '各テーマ', 14, 40,
  11, '上級', 2, 'MARCHレベルの複雑な構文をビジュアルで理解。', 'https://m.media-amazon.com/images/I/51MPxQsJnsL._SY445_SX342_ML2_.jpg', 32, true
),
(
  'E10', '応用長文', '関正生のThe Rules 英語長文問題集3', '長文',
  '1-12', '各問', 12, 45,
  12, '上級', 1, 'MARCHレベル。', 'https://m.media-amazon.com/images/I/41W6kfmXxML._SY445_SX342_ML2_.jpg', 33, true
),
(
  'E10', '応用長文', '関正生の英語長文ポラリス2', '長文',
  '1-12', '各問', 12, 45,
  12, '上級', 1, 'MARCH・関関同立レベル演習。', 'https://m.media-amazon.com/images/I/71ddCslr2YL._SY522_.jpg', 34, true
),
(
  'E10', '速読演習', '大学入試英語長文プラス 速読トレーニング問題集', '長文',
  '1-10', '各問', 10, 45,
  10, '上級', 1, '22の速読ルールを学ぶ。予測読みの習得。', 'https://m.media-amazon.com/images/I/51yEDfDgPcL._SY445_SX342_ML2_.jpg', 35, true
),
(
  'E10', '応用長文', '英語長文Supremacy', '長文',
  NULL, '各問', 15, 45,
  NULL, '上級', 1, 'MARCH・難関大レベルのテーマ別演習。', 'https://m.media-amazon.com/images/I/51d+rO9kJAL._SY445_SX342_ML2_.jpg', 36, true
),
(
  'E12', '難関解釈', '関正生の英文解釈ポラリス2', '解釈',
  NULL, '各テーマ', 14, 45,
  NULL, '最上級', 2, '早慶レベルの複雑な英文解釈。', 'https://m.media-amazon.com/images/I/511LX0-yTnL._SY445_SX342_ML2_.jpg', 37, true
),
(
  'E13', '難関長文', '関正生のThe Rules 英語長文問題集4', '長文',
  '1-12', '各問', 12, 50,
  12, '最上級', 1, '早慶・旧帝大レベル。', 'https://m.media-amazon.com/images/I/41CI7qejbuL._SY445_SX342_ML2_.jpg', 38, true
),
(
  'E13', '難関長文', '関正生の英語長文ポラリス3', '長文',
  '1-12', '各問', 12, 50,
  12, '最上級', 1, '最難関大演習。', 'https://m.media-amazon.com/images/I/71SAN5jiDUL._SY522_.jpg', 39, true
),
(
  'E13', '大学別', '世界一わかりやすい早稲田の英語 合格講座', '長文',
  NULL, '各学部', 14, 60,
  NULL, '最上級', 1, '学部ごとの傾向と対策。', 'https://m.media-amazon.com/images/I/510LP8QAIRL._SY445_SX342_ML2_.jpg', 40, true
),
(
  'E13', '大学別', '世界一わかりやすい慶應の英語 合格講座', '長文',
  NULL, '各学部', 14, 60,
  NULL, '最上級', 1, '学部ごとの傾向と対策。', 'https://m.media-amazon.com/images/I/81Ro50FH47L._SY522_.jpg', 41, true
),
(
  'E14', '英作文', '英作文ハイパートレーニング 和文英訳編', '英作文',
  NULL, '各Lesson', 30, 30,
  NULL, '上級', 2, '英作文の基礎から。ミスを減らす書き方を学ぶ。', 'https://m.media-amazon.com/images/I/81+2kg4nUgL._SY522_.jpg', 42, true
),
(
  'E15', '英作文', '竹岡広信の 英作文が面白いほど書ける本', '英作文',
  '60', '各Lesson', 60, 20,
  NULL, '上級', 2, '英作文はこれでOK。', 'https://m.media-amazon.com/images/I/819J1BP0FZL._SY522_.jpg', 43, true
),
(
  'E14', '英作文', '頻出英作文完全対策', '英作文',
  NULL, NULL, 30, 40,
  NULL, '上級', 1, '和文英訳から自由英作文まで網羅。', 'https://m.media-amazon.com/images/I/610wyvL2AwS._SY522_.jpg', 44, true
),
(
  'E14', '英文和訳', '英文熟考 上', '解釈',
  NULL, '各問', 14, 45,
  NULL, '上級', 2, '和訳演習に特化。', 'https://m.media-amazon.com/images/I/51NFvTo82+L._SY445_SX342_ML2_.jpg', 45, true
),
(
  'E14', '英文和訳', '英文熟考 下', '解釈',
  NULL, '各問', 14, 45,
  NULL, '上級', 2, '和訳演習に特化。', 'https://m.media-amazon.com/images/I/51e-r6wmNhL._SY445_SX342_ML2_.jpg', 46, true
),
(
  'E14', '英文和訳', 'ポレポレ', '英文解釈',
  '1-60', NULL, 180, 20,
  60, '最難関', 2, '阪大解釈の完成', 'https://m.media-amazon.com/images/I/91oFSF+bt7L._SY522_.jpg', 47, true
),
(
  'E14', '記述長文', '国公立標準問題集 CanPass 英語', '長文',
  NULL, '各問', 20, 50,
  NULL, '上級', 1, '国公立の記述・和訳対策。', 'https://m.media-amazon.com/images/I/51XygguGqIL._SY445_SX342_ML2_.jpg', 48, true
),
(
  'E15', 'リスニング', '1ヶ月で洋書が読める・聴けるようになる本', 'リスニング',
  NULL, '各日', 30, 30,
  NULL, '初級', 1, 'リスニング入門。', 'https://m.media-amazon.com/images/I/81dvfOHU-pL._SY522_.jpg', 49, true
),
(
  'E15', 'リスニング', '大学入試 関正生の英語リスニング プラチナルール', 'リスニング',
  NULL, '各Unit', 30, 30,
  NULL, '中級', 1, 'リスニングの解法ルール。', 'https://m.media-amazon.com/images/I/71qcF7Kra6L._SY522_.jpg', 50, true
);

-- 教材数: 50
