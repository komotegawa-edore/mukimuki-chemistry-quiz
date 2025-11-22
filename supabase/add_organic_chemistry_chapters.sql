-- ====================================
-- 有機化学の章とサンプル問題を追加
-- ====================================

-- 前提: migration_multi_subject.sql が実行済みであること

-- ====================================
-- 1. 有機化学の章を追加
-- ====================================

INSERT INTO public.mukimuki_chapters (subject_id, title, order_num) VALUES
  -- subject_id = 2 は「有機化学」
  (2, '第1章 アルカン', 1),
  (2, '第2章 アルケン・アルキン', 2),
  (2, '第3章 芳香族化合物', 3),
  (2, '第4章 アルコール・エーテル', 4),
  (2, '第5章 アルデヒド・ケトン', 5),
  (2, '第6章 カルボン酸・エステル', 6),
  (2, '第7章 芳香族化合物の反応', 7),
  (2, '第8章 異性体', 8),
  (2, '第9章 油脂・セッケン', 9),
  (2, '第10章 糖類', 10),
  (2, '第11章 アミノ酸・タンパク質', 11),
  (2, '第12章 合成高分子化合物', 12)
ON CONFLICT DO NOTHING;

-- ====================================
-- 2. サンプル問題を追加（第1章 アルカン）
-- ====================================

-- 第1章のchapter_idを取得
DO $$
DECLARE
  chapter_id_alkane INTEGER;
BEGIN
  SELECT id INTO chapter_id_alkane
  FROM public.mukimuki_chapters
  WHERE subject_id = 2 AND order_num = 1;

  -- サンプル問題を挿入
  INSERT INTO public.mukimuki_questions (
    chapter_id,
    question_text,
    choice_a,
    choice_b,
    choice_c,
    choice_d,
    correct_answer,
    explanation,
    media_type
  ) VALUES
  (
    chapter_id_alkane,
    'メタンの分子式として正しいものはどれか？',
    'CH4',
    'C2H6',
    'C3H8',
    'C4H10',
    'A',
    'メタンは最も単純なアルカンで、炭素原子1つと水素原子4つからなる分子です。',
    'text'
  ),
  (
    chapter_id_alkane,
    'エタンの構造式に含まれる炭素原子の数は？',
    '1個',
    '2個',
    '3個',
    '4個',
    'B',
    'エタンはC2H6で、炭素原子が2個結合した構造です。',
    'text'
  ),
  (
    chapter_id_alkane,
    'プロパンの一般名として正しいものはどれか？',
    'LPG（液化石油ガス）の主成分',
    '天然ガスの主成分',
    '灯油の主成分',
    'ガソリンの主成分',
    'A',
    'プロパンはLPG（液化石油ガス）の主成分として知られています。',
    'text'
  );
END $$;

-- ====================================
-- 3. サンプル問題を追加（第3章 芳香族化合物）
-- ====================================

DO $$
DECLARE
  chapter_id_aromatic INTEGER;
BEGIN
  SELECT id INTO chapter_id_aromatic
  FROM public.mukimuki_chapters
  WHERE subject_id = 2 AND order_num = 3;

  INSERT INTO public.mukimuki_questions (
    chapter_id,
    question_text,
    choice_a,
    choice_b,
    choice_c,
    choice_d,
    correct_answer,
    explanation,
    media_type
  ) VALUES
  (
    chapter_id_aromatic,
    'ベンゼンの分子式として正しいものはどれか？',
    'C6H6',
    'C6H12',
    'C6H14',
    'C5H6',
    'A',
    'ベンゼンはC6H6で、6個の炭素原子が環状に結合した芳香族化合物の基本構造です。',
    'text'
  ),
  (
    chapter_id_aromatic,
    'ベンゼン環に-OHが結合した化合物の名称は？',
    'フェノール',
    'ベンゼンアルコール',
    'ベンゾール',
    'トルエン',
    'A',
    'ベンゼン環にヒドロキシ基(-OH)が結合した化合物はフェノールと呼ばれます。',
    'text'
  ),
  (
    chapter_id_aromatic,
    'トルエンの構造として正しいものはどれか？',
    'ベンゼン環にメチル基(-CH3)が結合',
    'ベンゼン環にエチル基(-C2H5)が結合',
    'ベンゼン環にヒドロキシ基(-OH)が結合',
    'ベンゼン環にアミノ基(-NH2)が結合',
    'A',
    'トルエンはベンゼン環にメチル基(-CH3)が1つ結合した構造です。',
    'text'
  );
END $$;

-- ====================================
-- 確認クエリ
-- ====================================

-- 有機化学の章と問題数を確認
SELECT
  c.id,
  c.order_num,
  c.title,
  COUNT(q.id) as question_count
FROM mukimuki_chapters c
LEFT JOIN mukimuki_questions q ON c.id = q.chapter_id
WHERE c.subject_id = 2
GROUP BY c.id, c.order_num, c.title
ORDER BY c.order_num;
