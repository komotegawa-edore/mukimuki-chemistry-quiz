// 日本の主要大学リスト
export const UNIVERSITIES = [
  // 旧帝国大学
  { id: 'tokyo', name: '東京大学', category: '国立' },
  { id: 'kyoto', name: '京都大学', category: '国立' },
  { id: 'osaka', name: '大阪大学', category: '国立' },
  { id: 'tohoku', name: '東北大学', category: '国立' },
  { id: 'nagoya', name: '名古屋大学', category: '国立' },
  { id: 'kyushu', name: '九州大学', category: '国立' },
  { id: 'hokkaido', name: '北海道大学', category: '国立' },

  // 難関国公立
  { id: 'hitotsubashi', name: '一橋大学', category: '国立' },
  { id: 'tokyo-tech', name: '東京工業大学', category: '国立' },
  { id: 'tokyo-medical', name: '東京医科歯科大学', category: '国立' },
  { id: 'kobe', name: '神戸大学', category: '国立' },
  { id: 'tsukuba', name: '筑波大学', category: '国立' },
  { id: 'chiba', name: '千葉大学', category: '国立' },
  { id: 'yokohama-national', name: '横浜国立大学', category: '国立' },
  { id: 'ochanomizu', name: 'お茶の水女子大学', category: '国立' },
  { id: 'tokyo-gaidai', name: '東京外国語大学', category: '国立' },
  { id: 'tokyo-noko', name: '東京農工大学', category: '国立' },
  { id: 'electro-comm', name: '電気通信大学', category: '国立' },

  // 地方国立（主要）
  { id: 'hiroshima', name: '広島大学', category: '国立' },
  { id: 'okayama', name: '岡山大学', category: '国立' },
  { id: 'kanazawa', name: '金沢大学', category: '国立' },
  { id: 'niigata', name: '新潟大学', category: '国立' },
  { id: 'kumamoto', name: '熊本大学', category: '国立' },
  { id: 'nagasaki', name: '長崎大学', category: '国立' },
  { id: 'kagoshima', name: '鹿児島大学', category: '国立' },
  { id: 'shinshu', name: '信州大学', category: '国立' },
  { id: 'shizuoka', name: '静岡大学', category: '国立' },
  { id: 'gifu', name: '岐阜大学', category: '国立' },
  { id: 'mie', name: '三重大学', category: '国立' },
  { id: 'yamaguchi', name: '山口大学', category: '国立' },
  { id: 'ehime', name: '愛媛大学', category: '国立' },
  { id: 'tokushima', name: '徳島大学', category: '国立' },
  { id: 'kagawa', name: '香川大学', category: '国立' },
  { id: 'kochi', name: '高知大学', category: '国立' },
  { id: 'saga', name: '佐賀大学', category: '国立' },
  { id: 'oita', name: '大分大学', category: '国立' },
  { id: 'miyazaki', name: '宮崎大学', category: '国立' },
  { id: 'ryukyu', name: '琉球大学', category: '国立' },
  { id: 'iwate', name: '岩手大学', category: '国立' },
  { id: 'akita', name: '秋田大学', category: '国立' },
  { id: 'yamagata', name: '山形大学', category: '国立' },
  { id: 'fukushima', name: '福島大学', category: '国立' },
  { id: 'ibaraki', name: '茨城大学', category: '国立' },
  { id: 'utsunomiya', name: '宇都宮大学', category: '国立' },
  { id: 'gunma', name: '群馬大学', category: '国立' },
  { id: 'saitama', name: '埼玉大学', category: '国立' },
  { id: 'toyama', name: '富山大学', category: '国立' },
  { id: 'fukui', name: '福井大学', category: '国立' },
  { id: 'yamanashi', name: '山梨大学', category: '国立' },
  { id: 'nagano', name: '長野大学', category: '国立' },
  { id: 'wakayama', name: '和歌山大学', category: '国立' },
  { id: 'tottori', name: '鳥取大学', category: '国立' },
  { id: 'shimane', name: '島根大学', category: '国立' },

  // 公立大学（主要）
  { id: 'tokyo-metropolitan', name: '東京都立大学', category: '公立' },
  { id: 'osaka-metropolitan', name: '大阪公立大学', category: '公立' },
  { id: 'yokohama-city', name: '横浜市立大学', category: '公立' },
  { id: 'nagoya-city', name: '名古屋市立大学', category: '公立' },
  { id: 'kyoto-prefectural', name: '京都府立大学', category: '公立' },
  { id: 'osaka-prefectural', name: '大阪府立大学', category: '公立' },
  { id: 'hyogo-prefectural', name: '兵庫県立大学', category: '公立' },

  // 早慶上理
  { id: 'waseda', name: '早稲田大学', category: '私立' },
  { id: 'keio', name: '慶應義塾大学', category: '私立' },
  { id: 'sophia', name: '上智大学', category: '私立' },
  { id: 'tokyo-science', name: '東京理科大学', category: '私立' },

  // MARCH
  { id: 'meiji', name: '明治大学', category: '私立' },
  { id: 'aoyama', name: '青山学院大学', category: '私立' },
  { id: 'rikkyo', name: '立教大学', category: '私立' },
  { id: 'chuo', name: '中央大学', category: '私立' },
  { id: 'hosei', name: '法政大学', category: '私立' },

  // 関関同立
  { id: 'kwansei', name: '関西学院大学', category: '私立' },
  { id: 'kansai', name: '関西大学', category: '私立' },
  { id: 'doshisha', name: '同志社大学', category: '私立' },
  { id: 'ritsumeikan', name: '立命館大学', category: '私立' },

  // 日東駒専
  { id: 'nihon', name: '日本大学', category: '私立' },
  { id: 'toyo', name: '東洋大学', category: '私立' },
  { id: 'komazawa', name: '駒澤大学', category: '私立' },
  { id: 'senshu', name: '専修大学', category: '私立' },

  // 産近甲龍
  { id: 'kyoto-sangyo', name: '京都産業大学', category: '私立' },
  { id: 'kindai', name: '近畿大学', category: '私立' },
  { id: 'konan', name: '甲南大学', category: '私立' },
  { id: 'ryukoku', name: '龍谷大学', category: '私立' },

  // その他私立（主要）
  { id: 'gakushuin', name: '学習院大学', category: '私立' },
  { id: 'seikei', name: '成蹊大学', category: '私立' },
  { id: 'seijo', name: '成城大学', category: '私立' },
  { id: 'musashino', name: '武蔵野大学', category: '私立' },
  { id: 'meiji-gakuin', name: '明治学院大学', category: '私立' },
  { id: 'kokugakuin', name: '國學院大學', category: '私立' },
  { id: 'tokai', name: '東海大学', category: '私立' },
  { id: 'teikyo', name: '帝京大学', category: '私立' },
  { id: 'asia', name: '亜細亜大学', category: '私立' },
  { id: 'tokyo-keizai', name: '東京経済大学', category: '私立' },

  // 女子大
  { id: 'tsuda', name: '津田塾大学', category: '私立' },
  { id: 'tokyo-womens', name: '東京女子大学', category: '私立' },
  { id: 'nihon-womens', name: '日本女子大学', category: '私立' },

  // 医学部系（私立）
  { id: 'jikei', name: '東京慈恵会医科大学', category: '私立' },
  { id: 'juntendo', name: '順天堂大学', category: '私立' },
  { id: 'nippon-medical', name: '日本医科大学', category: '私立' },
  { id: 'showa', name: '昭和大学', category: '私立' },

  // 芸術系
  { id: 'tokyo-geidai', name: '東京藝術大学', category: '国立' },
  { id: 'musashino-art', name: '武蔵野美術大学', category: '私立' },
  { id: 'tama-art', name: '多摩美術大学', category: '私立' },

  // その他
  { id: 'icu', name: '国際基督教大学(ICU)', category: '私立' },
  { id: 'other', name: 'その他', category: 'その他' },
] as const

export type UniversityId = typeof UNIVERSITIES[number]['id']

// カテゴリでグループ化
export const UNIVERSITY_GROUPS = [
  { label: '国立大学', universities: UNIVERSITIES.filter(u => u.category === '国立') },
  { label: '公立大学', universities: UNIVERSITIES.filter(u => u.category === '公立') },
  { label: '私立大学', universities: UNIVERSITIES.filter(u => u.category === '私立') },
  { label: 'その他', universities: UNIVERSITIES.filter(u => u.category === 'その他') },
]

// 大学名からIDを取得
export function getUniversityId(name: string): string | undefined {
  const found = UNIVERSITIES.find(u => u.name === name)
  return found?.id
}

// IDから大学名を取得
export function getUniversityName(id: string): string | undefined {
  const found = UNIVERSITIES.find(u => u.id === id)
  return found?.name
}
