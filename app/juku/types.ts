// 塾サイトビルダーの型定義

export interface JukuSite {
  id: string
  slug: string
  name: string
  owner_id: string | null

  // テーマ
  theme: string
  primary_color: string
  secondary_color: string
  font_family: string
  logo_url: string | null
  favicon_url: string | null

  // 基本情報
  tagline: string | null
  phone: string | null
  email: string | null
  address: string | null
  business_hours: string | null
  google_map_embed: string | null

  // SNS
  line_url: string | null
  instagram_url: string | null
  twitter_url: string | null

  // カスタムドメイン
  custom_domain: string | null

  is_published: boolean
  created_at: string
  updated_at: string
}

export type SectionType =
  | 'hero'
  | 'features'
  | 'pricing'
  | 'teachers'
  | 'results'
  | 'access'
  | 'contact'
  | 'blog'
  | 'schedule'
  | 'faq'
  | 'gallery'

export interface JukuSection {
  id: string
  site_id: string
  type: SectionType
  order_num: number
  is_visible: boolean
  content: SectionContent
  created_at: string
  updated_at: string
}

// セクションごとのコンテンツ型
export interface HeroContent {
  title: string
  subtitle: string
  backgroundImage?: string
  ctaText?: string
  ctaLink?: string
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface FeaturesContent {
  title: string
  subtitle?: string
  items: FeatureItem[]
}

export interface PricingPlan {
  name: string
  target: string // 対象学年
  price: string
  period: string // 月額、週1回など
  features: string[]
  isPopular?: boolean
}

export interface PricingContent {
  title: string
  subtitle?: string
  plans: PricingPlan[]
  note?: string
}

export interface Teacher {
  name: string
  role: string
  photo?: string
  subjects: string[]
  message: string
}

export interface TeachersContent {
  title: string
  subtitle?: string
  teachers: Teacher[]
  layout?: 'grid' | 'carousel'
}

export interface ResultItem {
  year: string
  school: string
  count: number
}

export interface ResultsContent {
  title: string
  subtitle?: string
  items: ResultItem[]
  testimonials?: { name: string; text: string; school: string }[]
}

export interface AccessContent {
  title: string
  address: string
  phone: string
  email?: string
  businessHours: string
  mapEmbed?: string
  nearestStation?: string
  parkingInfo?: string
}

export interface ContactContent {
  title: string
  subtitle?: string
  formFields: ('name' | 'email' | 'phone' | 'grade' | 'message')[]
  submitText: string
}

export interface ScheduleItem {
  day: string
  time: string
  subject: string
  target: string
}

export interface ScheduleContent {
  title: string
  subtitle?: string
  items: ScheduleItem[]
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQContent {
  title: string
  items: FAQItem[]
}

export interface BlogContent {
  title: string
  showCount: number
}

export interface GalleryImage {
  url: string
  caption?: string
}

export interface GalleryContent {
  title: string
  subtitle?: string
  images: GalleryImage[]
  layout: 'grid' | 'masonry' | 'slider'
}

export type SectionContent =
  | HeroContent
  | FeaturesContent
  | PricingContent
  | TeachersContent
  | ResultsContent
  | AccessContent
  | ContactContent
  | ScheduleContent
  | FAQContent
  | BlogContent
  | GalleryContent

// セクションタイプのラベル
export const sectionTypeLabels: Record<SectionType, string> = {
  hero: 'ヒーロー',
  features: '塾の特徴',
  pricing: '料金・コース',
  teachers: '講師紹介',
  results: '合格実績',
  access: 'アクセス',
  contact: 'お問い合わせ',
  blog: 'ブログ',
  schedule: '時間割',
  faq: 'よくある質問',
  gallery: '塾内ギャラリー',
}

// デフォルトコンテンツ
export const defaultSectionContent: Record<SectionType, SectionContent> = {
  hero: {
    title: '地域で一番、生徒に寄り添う塾',
    subtitle: 'お子様の「わかった！」を大切にする個別指導',
    ctaText: '無料体験を申し込む',
    ctaLink: '#contact',
  },
  features: {
    title: '選ばれる3つの理由',
    items: [
      { icon: 'teacher', title: '完全個別指導', description: '一人ひとりの理解度に合わせた丁寧な指導' },
      { icon: 'book', title: '定期テスト対策', description: '学校の進度に合わせた予習・復習で成績アップ' },
      { icon: 'home', title: '地域密着20年', description: '地元の学校を熟知した講師陣がサポート' },
    ],
  },
  pricing: {
    title: '料金・コース',
    plans: [
      { name: '小学生コース', target: '小1〜小6', price: '8,000', period: '月4回', features: ['算数・国語', '宿題サポート', '中学準備'] },
      { name: '中学生コース', target: '中1〜中3', price: '15,000', period: '月8回', features: ['5教科対応', '定期テスト対策', '高校受験対策'], isPopular: true },
      { name: '高校生コース', target: '高1〜高3', price: '20,000', period: '月8回', features: ['大学受験対策', '推薦対策', '共通テスト対策'] },
    ],
    note: '※料金は税込です。教材費は別途かかります。',
  },
  teachers: {
    title: '講師紹介',
    teachers: [
      { name: '山田 太郎', role: '塾長', subjects: ['数学', '理科'], message: '「わかる」から「できる」まで、一緒に頑張りましょう！' },
    ],
  },
  results: {
    title: '合格実績',
    subtitle: '2024年度',
    items: [
      { year: '2024', school: '〇〇高校', count: 5 },
      { year: '2024', school: '△△高校', count: 3 },
    ],
  },
  access: {
    title: 'アクセス',
    address: '〒000-0000 東京都〇〇区〇〇1-2-3',
    phone: '03-0000-0000',
    businessHours: '平日 15:00〜22:00 / 土曜 10:00〜18:00',
    nearestStation: '〇〇駅より徒歩5分',
  },
  contact: {
    title: 'お問い合わせ・無料体験',
    subtitle: 'まずはお気軽にご相談ください',
    formFields: ['name', 'email', 'phone', 'grade', 'message'],
    submitText: '送信する',
  },
  schedule: {
    title: '時間割',
    items: [
      { day: '月曜', time: '17:00-18:30', subject: '数学', target: '中学生' },
    ],
  },
  faq: {
    title: 'よくある質問',
    items: [
      { question: '体験授業はありますか？', answer: 'はい、無料体験授業を実施しています。お気軽にお問い合わせください。' },
    ],
  },
  blog: {
    title: 'お知らせ・ブログ',
    showCount: 3,
  },
  gallery: {
    title: '塾内の様子',
    subtitle: '明るく清潔な学習環境をご覧ください',
    images: [],
    layout: 'grid',
  },
}

// ブログ記事
export interface JukuBlogPost {
  id: string
  site_id: string
  title: string
  slug: string
  content: string | any[] // HTML文字列 or Editor.js blocks (後方互換)
  featured_image: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// ========================================
// LP（ランディングページ）専用の型定義
// ========================================

export type LPType = 'winter' | 'summer' | 'spring' | 'test_prep' | 'enrollment' | 'custom'

export const lpTypeLabels: Record<LPType, string> = {
  winter: '冬期講習',
  summer: '夏期講習',
  spring: '春期講習',
  test_prep: 'テスト対策講座',
  enrollment: '入塾キャンペーン',
  custom: 'カスタムLP',
}

export interface JukuLP {
  id: string
  slug: string
  owner_id: string | null

  // LP情報
  lp_type: LPType
  name: string
  juku_name: string // 塾名

  // テーマ
  theme: string
  primary_color: string
  secondary_color: string
  accent_color: string

  // ロゴ
  logo_url: string | null

  // 期間設定
  start_date: string | null    // 講習開始日
  end_date: string | null      // 講習終了日
  deadline_date: string | null // 申込締切日

  // 連絡先
  phone: string | null
  email: string | null
  line_url: string | null

  // 公開設定
  is_published: boolean
  publish_start: string | null // LP公開開始日時
  publish_end: string | null   // LP公開終了日時

  created_at: string
  updated_at: string
}

// LP専用セクションタイプ
export type LPSectionType =
  | 'lp_hero'        // LP用ヒーロー（緊急感あり）
  | 'countdown'      // カウントダウンタイマー
  | 'campaign'       // キャンペーン・特典
  | 'curriculum'     // カリキュラム・日程
  | 'testimonials'   // 受講生の声
  | 'before_after'   // ビフォーアフター
  | 'lp_pricing'     // LP用料金（限定価格）
  | 'lp_faq'         // LP用FAQ
  | 'lp_cta'         // CTA（申込ボタン）
  | 'lp_contact'     // LP用申込フォーム
  | 'lp_gallery'     // 塾の様子ギャラリー

export interface JukuLPSection {
  id: string
  lp_id: string
  type: LPSectionType
  order_num: number
  is_visible: boolean
  content: LPSectionContent
  created_at: string
  updated_at: string
}

// LP用ヒーローコンテンツ
export interface LPHeroContent {
  title: string           // "冬期講習 受付開始！"
  subtitle: string        // "この冬、ライバルに差をつける"
  badge?: string          // "残り10名" "早期割引中"
  backgroundImage?: string
  ctaText: string
  ctaLink: string
}

// カウントダウンコンテンツ
export interface CountdownContent {
  title: string           // "申込締切まで"
  targetDate: string      // ISO日付
  expiredMessage: string  // "受付終了しました"
  style: 'simple' | 'flip' | 'urgent'
}

// キャンペーン・特典コンテンツ
export interface CampaignContent {
  title: string
  subtitle?: string
  items: {
    icon: string
    title: string
    description: string
    originalPrice?: string  // 通常価格（打消し線用）
    campaignPrice?: string  // キャンペーン価格
  }[]
  deadline?: string       // "12/20(金)まで"
  note?: string
}

// カリキュラム・日程コンテンツ
export interface CurriculumContent {
  title: string
  subtitle?: string
  days: {
    date: string          // "12/26(木)"
    time: string          // "13:00-17:00"
    content: string       // "英語総復習・文法マスター"
    target?: string       // "中3生"
  }[]
  note?: string
}

// 受講生の声コンテンツ
export interface TestimonialsContent {
  title: string
  subtitle?: string
  items: {
    name: string          // "Aさん（中3）"
    photo?: string
    text: string
    result?: string       // "偏差値15UP！"
    school?: string       // "〇〇高校合格"
  }[]
}

// ビフォーアフターコンテンツ
export interface BeforeAfterContent {
  title: string
  subtitle?: string
  items: {
    label: string         // "数学の点数"
    before: string        // "42点"
    after: string         // "78点"
    period?: string       // "3ヶ月で"
  }[]
}

// LP用料金コンテンツ
export interface LPPricingContent {
  title: string
  subtitle?: string
  plans: {
    name: string          // "5日間集中コース"
    target: string        // "中学3年生"
    originalPrice: string // "35,000円"
    price: string         // "29,800円"
    features: string[]
    isRecommended?: boolean
    remainingSeats?: number // 残席数
  }[]
  note?: string
  deadline?: string       // "早期割引: 12/15まで"
}

// LP用FAQコンテンツ
export interface LPFAQContent {
  title: string
  items: {
    question: string
    answer: string
  }[]
}

// LP用CTAコンテンツ
export interface LPCTAContent {
  title: string           // "今すぐお申し込み"
  subtitle?: string       // "定員になり次第締め切り"
  buttonText: string      // "無料体験を申し込む"
  buttonLink: string
  phone?: string          // 電話番号も表示
  style: 'simple' | 'urgent' | 'floating'
}

// LP用申込フォームコンテンツ
export interface LPContactContent {
  title: string
  subtitle?: string
  formFields: ('name' | 'email' | 'phone' | 'grade' | 'course' | 'message')[]
  courseOptions?: string[] // コース選択肢
  submitText: string
  successMessage: string
  notifyEmail?: string    // 通知先メール
  notifyLine?: boolean    // LINE通知するか
}

// LP用ギャラリーコンテンツ
export interface LPGalleryContent {
  title: string
  subtitle?: string
  images: {
    url: string
    caption?: string
    category?: string  // "授業風景" "自習室" "イベント" など
  }[]
  layout: 'grid' | 'masonry' | 'slider'
  showCaptions: boolean
}

export type LPSectionContent =
  | LPHeroContent
  | CountdownContent
  | CampaignContent
  | CurriculumContent
  | TestimonialsContent
  | BeforeAfterContent
  | LPPricingContent
  | LPFAQContent
  | LPCTAContent
  | LPContactContent
  | LPGalleryContent

// LP用セクションタイプのラベル
export const lpSectionTypeLabels: Record<LPSectionType, string> = {
  lp_hero: 'ヒーロー',
  countdown: 'カウントダウン',
  campaign: 'キャンペーン特典',
  curriculum: 'カリキュラム・日程',
  testimonials: '受講生の声',
  before_after: 'ビフォーアフター',
  lp_pricing: '料金プラン',
  lp_faq: 'よくある質問',
  lp_cta: 'CTAボタン',
  lp_contact: '申込フォーム',
  lp_gallery: '塾の様子',
}

// LP用デフォルトコンテンツ
export const defaultLPSectionContent: Record<LPSectionType, LPSectionContent> = {
  lp_hero: {
    title: '冬期講習 受付開始！',
    subtitle: 'この冬、ライバルに差をつける5日間',
    badge: '残り10名',
    backgroundImage: '/juku-hero.png',
    ctaText: '今すぐ申し込む',
    ctaLink: '#contact',
  },
  countdown: {
    title: '申込締切まで',
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiredMessage: '受付終了しました',
    style: 'urgent',
  },
  campaign: {
    title: '冬期講習限定特典',
    items: [
      { icon: 'gift', title: '早期申込割引', description: '12/15までのお申込みで20%OFF', originalPrice: '35,000円', campaignPrice: '28,000円' },
      { icon: 'book', title: 'テキスト無料', description: '講習用オリジナルテキストプレゼント' },
      { icon: 'users', title: '兄弟割引', description: '2人目以降は受講料10%OFF' },
    ],
    deadline: '12/15(日)まで',
  },
  curriculum: {
    title: '5日間集中カリキュラム',
    subtitle: '短期間で効率よく実力アップ',
    days: [
      { date: '12/26(木)', time: '13:00-17:00', content: '英語総復習・文法マスター', target: '中3生' },
      { date: '12/27(金)', time: '13:00-17:00', content: '数学 関数・図形攻略', target: '中3生' },
      { date: '12/28(土)', time: '13:00-17:00', content: '理社 重要単元総まとめ', target: '中3生' },
      { date: '1/4(土)', time: '13:00-17:00', content: '過去問演習①', target: '中3生' },
      { date: '1/5(日)', time: '13:00-17:00', content: '過去問演習② + 総仕上げ', target: '中3生' },
    ],
    note: '※日程は変更になる場合があります',
  },
  testimonials: {
    title: '受講生の声',
    subtitle: '昨年の冬期講習参加者より',
    items: [
      { name: 'Aさん（中3）', photo: '/juku-confident.png', text: '苦手だった数学が、5日間で解けるようになりました！先生の教え方がわかりやすかったです。', result: '偏差値12UP', school: '〇〇高校合格' },
      { name: 'Bさん（中2）', photo: '/juku-students.png', text: '集中して勉強できる環境で、冬休みを有効に使えました。', result: '学年末テスト+35点' },
    ],
  },
  before_after: {
    title: '講習受講生の成績変化',
    subtitle: '短期間でも結果が出ています',
    items: [
      { label: '5教科合計', before: '280点', after: '352点', period: '冬期講習後' },
      { label: '数学', before: '42点', after: '78点', period: '5日間で' },
      { label: '英語偏差値', before: '48', after: '58', period: '1ヶ月で' },
    ],
  },
  lp_pricing: {
    title: '冬期講習 料金',
    subtitle: '早期申込で最大20%OFF',
    plans: [
      {
        name: '5日間集中コース',
        target: '中学3年生',
        originalPrice: '35,000円',
        price: '28,000円',
        features: ['全20時間の授業', 'オリジナルテキスト付き', '過去問演習', '個別質問対応'],
        isRecommended: true,
        remainingSeats: 5,
      },
      {
        name: '3日間基礎コース',
        target: '中学1・2年生',
        originalPrice: '22,000円',
        price: '17,600円',
        features: ['全12時間の授業', 'オリジナルテキスト付き', '弱点克服'],
        remainingSeats: 8,
      },
    ],
    deadline: '早期割引: 12/15(日)まで',
    note: '※料金は税込です',
  },
  lp_faq: {
    title: 'よくある質問',
    items: [
      { question: '途中参加はできますか？', answer: 'はい、可能です。ただし定員に達し次第締め切りとなります。' },
      { question: '欠席した場合の振替はありますか？', answer: '別日程での振替授業をご用意しております。' },
      { question: '塾生でなくても参加できますか？', answer: 'はい、講習のみの参加も歓迎です。' },
    ],
  },
  lp_cta: {
    title: '今すぐお申し込み',
    subtitle: '定員になり次第締め切り',
    buttonText: '無料体験を申し込む',
    buttonLink: '#contact',
    phone: '03-0000-0000',
    style: 'urgent',
  },
  lp_contact: {
    title: 'お申し込み・お問い合わせ',
    subtitle: '24時間受付中',
    formFields: ['name', 'email', 'phone', 'grade', 'course', 'message'],
    courseOptions: ['5日間集中コース', '3日間基礎コース', '相談してから決めたい'],
    submitText: '申し込む',
    successMessage: 'お申し込みありがとうございます。24時間以内にご連絡いたします。',
  },
  lp_gallery: {
    title: '塾の様子',
    subtitle: '明るく集中できる学習環境',
    images: [
      { url: '/juku-classroom.png', caption: '集中できる教室環境', category: '教室' },
      { url: '/juku-teacher1.png', caption: '丁寧な個別指導', category: '授業' },
      { url: '/juku-teacher2.png', caption: '笑顔で楽しく学べる', category: '授業' },
      { url: '/juku-student2.png', caption: '真剣に取り組む生徒', category: '自習' },
      { url: '/juku-desk.png', caption: '整った学習環境', category: '設備' },
      { url: '/juku-analytics.png', caption: 'データで成績管理', category: '設備' },
    ],
    layout: 'grid',
    showCaptions: true,
  },
}
