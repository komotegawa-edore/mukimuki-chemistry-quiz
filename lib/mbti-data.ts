// 16タイプの結果データ
export const typeResults: Record<
  string,
  {
    title: string
    emoji: string
    description: string
    strengths: string[]
    weaknesses: string[]
    studyTips: string[]
    compatibleTypes: string[]
    color: string
  }
> = {
  ISTJ: {
    title: '堅実な計画者',
    emoji: '📚',
    description:
      'コツコツ型の努力家。計画通りに進めることで安心感を得られるタイプ。過去問分析や暗記系科目で力を発揮する。',
    strengths: ['計画を守り抜く力', '暗記力', '継続力'],
    weaknesses: ['想定外の変化への対応', '創造的な問題への苦手意識'],
    studyTips: [
      '毎日同じ時間に勉強する習慣をつける',
      '進捗表を作って可視化する',
      '過去問を徹底的に分析する',
    ],
    compatibleTypes: ['ESTJ', 'ISFJ'],
    color: '#3B82F6',
  },
  ISFJ: {
    title: '献身的なサポーター',
    emoji: '🌸',
    description:
      '周囲を支えながら自分も頑張るタイプ。友達に教えることで自分の理解も深まる。グループ学習が向いている。',
    strengths: ['丁寧な復習力', '人に教える力', '協調性'],
    weaknesses: ['自分の意見を言うのが苦手', '過度な気遣いで疲れやすい'],
    studyTips: [
      '友達と教え合いながら学ぶ',
      '自分へのご褒美を設定する',
      '無理のないペースを維持する',
    ],
    compatibleTypes: ['ISTJ', 'ESFJ'],
    color: '#EC4899',
  },
  INFJ: {
    title: '理想を追う探求者',
    emoji: '🔮',
    description:
      '深い理解を求めるタイプ。表面的な暗記より「なぜそうなるか」を追求する。記述問題や小論文で力を発揮。',
    strengths: ['深い洞察力', '記述力', '長期的な視点'],
    weaknesses: ['完璧主義になりがち', '細かい暗記が苦手'],
    studyTips: [
      '「なぜ」を意識して学ぶ',
      '志望校への想いを言語化する',
      '一人で集中できる環境を作る',
    ],
    compatibleTypes: ['INTJ', 'ENFJ'],
    color: '#8B5CF6',
  },
  INTJ: {
    title: '戦略的な建築家',
    emoji: '🎯',
    description:
      '効率重視の戦略家。無駄を省いた勉強計画を立てるのが得意。志望校に向けた逆算思考が武器。',
    strengths: ['戦略的思考', '効率化能力', '目標達成力'],
    weaknesses: ['他人のアドバイスを聞きにくい', '孤立しがち'],
    studyTips: [
      '志望校から逆算した計画を立てる',
      '非効率な勉強法は思い切って捨てる',
      '定期的に計画を見直す',
    ],
    compatibleTypes: ['INFJ', 'ENTJ'],
    color: '#6366F1',
  },
  ISTP: {
    title: '冷静な分析者',
    emoji: '🔧',
    description:
      '問題を分解して解くのが得意。数学や物理など、論理的に考える科目で力を発揮。効率よく短時間で成果を出す。',
    strengths: ['問題分析力', '効率的な学習', '冷静な判断力'],
    weaknesses: ['長期計画が苦手', '暗記科目への興味薄'],
    studyTips: [
      '短時間集中で効率よく進める',
      '問題を解く過程を楽しむ',
      '実践的な演習を増やす',
    ],
    compatibleTypes: ['ESTP', 'INTP'],
    color: '#64748B',
  },
  ISFP: {
    title: '感性豊かな芸術家',
    emoji: '🎨',
    description:
      '自分のペースで学ぶことを大切にするタイプ。好きな科目はとことん伸びる。モチベーション管理が鍵。',
    strengths: ['創造的な発想', '好きなことへの集中力', '柔軟性'],
    weaknesses: ['苦手科目の克服', '計画的な学習'],
    studyTips: [
      '好きな科目から始めてエンジンをかける',
      '視覚的な教材を活用する',
      '自分だけの勉強スペースを作る',
    ],
    compatibleTypes: ['ESFP', 'INFP'],
    color: '#F472B6',
  },
  INFP: {
    title: '理想主義の夢追い人',
    emoji: '🌙',
    description:
      '志望校への強い想いが原動力。国語や英語など、言葉を扱う科目が得意。自分の世界観を大切にする。',
    strengths: ['文章力', '創造性', '志望校への情熱'],
    weaknesses: ['現実的な計画立て', '苦手科目への取り組み'],
    studyTips: [
      '志望校に行きたい理由を常に思い出す',
      '好きな音楽を聴きながら勉強する',
      '日記形式で学びを記録する',
    ],
    compatibleTypes: ['ENFP', 'ISFP'],
    color: '#A78BFA',
  },
  INTP: {
    title: '論理的な思索家',
    emoji: '🧠',
    description:
      '知的好奇心が強く、深く考えることが好き。数学や物理の難問に挑むのが楽しいタイプ。',
    strengths: ['論理的思考', '知的好奇心', '独創的な解法'],
    weaknesses: ['暗記科目', '締め切り管理'],
    studyTips: [
      '「なぜそうなるか」を徹底的に考える',
      '難問にチャレンジする時間を設ける',
      '締め切りを意識的に設定する',
    ],
    compatibleTypes: ['ENTP', 'ISTP'],
    color: '#0EA5E9',
  },
  ESTP: {
    title: '行動派のチャレンジャー',
    emoji: '⚡',
    description:
      '即行動タイプ。とりあえずやってみる精神で、実践的な学習が得意。本番に強いメンタルの持ち主。',
    strengths: ['実践力', '本番に強い', 'スピード感'],
    weaknesses: ['計画的な準備', 'じっくり考える問題'],
    studyTips: [
      '実際に問題を解きながら学ぶ',
      '模試を多めに受ける',
      '短期目標を設定して達成感を得る',
    ],
    compatibleTypes: ['ISTP', 'ESFP'],
    color: '#EF4444',
  },
  ESFP: {
    title: 'エンターテイナー',
    emoji: '🎉',
    description:
      '楽しみながら学ぶのが得意。友達と一緒に勉強するとパワーアップ。雰囲気づくりが上手。',
    strengths: ['ムードメーカー', '暗記のコツを掴む力', '楽しむ力'],
    weaknesses: ['一人での長時間学習', '計画立て'],
    studyTips: [
      '友達と勉強会を開く',
      '暗記はリズムや歌にして覚える',
      'ご褒美システムを作る',
    ],
    compatibleTypes: ['ISFP', 'ESTP'],
    color: '#F97316',
  },
  ENFP: {
    title: '情熱的な冒険家',
    emoji: '🚀',
    description:
      'アイデア豊富で、新しい勉強法を試すのが好き。モチベーションの波が激しいが、乗っている時の集中力は抜群。',
    strengths: ['発想力', '熱中力', 'コミュニケーション力'],
    weaknesses: ['継続性', '細かい作業'],
    studyTips: [
      '新しい勉強法を定期的に取り入れる',
      '仲間と目標を共有する',
      'やる気がない時の最低限ルールを決める',
    ],
    compatibleTypes: ['INFP', 'ENTP'],
    color: '#FBBF24',
  },
  ENTP: {
    title: '議論好きの発明家',
    emoji: '💡',
    description:
      '知的な議論が大好き。問題の別解を考えるのが楽しいタイプ。記述問題で独自の視点を発揮。',
    strengths: ['批判的思考', '別解発見力', '議論力'],
    weaknesses: ['単純作業', '一つのことを極める'],
    studyTips: [
      '友達と問題について議論する',
      '複数の解法を考える習慣をつける',
      '退屈しないよう科目をローテーションする',
    ],
    compatibleTypes: ['INTP', 'ENFP'],
    color: '#84CC16',
  },
  ESTJ: {
    title: '頼れるリーダー',
    emoji: '👔',
    description:
      '目標達成に向けて周囲を引っ張るタイプ。計画的かつ効率的に勉強を進める。模試の目標設定が得意。',
    strengths: ['リーダーシップ', '計画実行力', '目標管理'],
    weaknesses: ['柔軟な対応', '他人のペースに合わせる'],
    studyTips: [
      '具体的な数値目標を設定する',
      'スケジュール管理アプリを活用する',
      '勉強仲間を作ってお互い高め合う',
    ],
    compatibleTypes: ['ISTJ', 'ENTJ'],
    color: '#14B8A6',
  },
  ESFJ: {
    title: 'みんなの調整役',
    emoji: '🤝',
    description:
      '周囲と協力しながら目標に向かうタイプ。勉強会の企画や友達のサポートが得意。人間関係を大切にする。',
    strengths: ['協調性', 'モチベーション維持', '教え合い'],
    weaknesses: ['一人での学習', '批判への耐性'],
    studyTips: [
      'グループ学習を積極的に取り入れる',
      '教えることで自分の理解を深める',
      '周囲の評価を気にしすぎない',
    ],
    compatibleTypes: ['ISFJ', 'ENFJ'],
    color: '#22C55E',
  },
  ENFJ: {
    title: 'カリスマ指導者',
    emoji: '✨',
    description:
      '周囲を巻き込んで一緒に成長するタイプ。後輩への指導やグループ学習で力を発揮。志望校への情熱が周囲にも伝染する。',
    strengths: ['影響力', 'モチベーション管理', '共感力'],
    weaknesses: ['自分の時間確保', '完璧主義'],
    studyTips: [
      '人に教える時間と自分の学習時間を分ける',
      '志望校への想いを周囲と共有する',
      '自分のケアも忘れずに',
    ],
    compatibleTypes: ['INFJ', 'ESFJ'],
    color: '#5DDFC3',
  },
  ENTJ: {
    title: '野心的な司令官',
    emoji: '👑',
    description:
      '大きな目標に向かって突き進むタイプ。志望校合格への強い意志と、それを実現する計画力を持つ。',
    strengths: ['目標達成力', '戦略立案', 'リーダーシップ'],
    weaknesses: ['周囲への配慮', '休息を取ること'],
    studyTips: [
      '志望校合格を最終目標に逆算計画を立てる',
      '進捗を数値で管理する',
      '適度な休息も計画に入れる',
    ],
    compatibleTypes: ['INTJ', 'ESTJ'],
    color: '#DC2626',
  },
}

// 有効なMBTIタイプの一覧
export const validMBTITypes = Object.keys(typeResults)

// MBTIタイプかどうかを検証
export function isValidMBTIType(type: string): boolean {
  return validMBTITypes.includes(type.toUpperCase())
}
