// 塾サイトビルダーの型定義

export interface JukuSite {
  id: string
  slug: string
  name: string
  owner_id: string | null

  // テーマ
  primary_color: string
  secondary_color: string
  font_family: string

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
  content: any[] // Editor.js blocks
  featured_image: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}
