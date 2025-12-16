import { SectionType, defaultSectionContent } from './types'
import { ThemeId } from './themes'

export interface SiteTemplate {
  id: string
  name: string
  description: string
  theme: ThemeId
  primaryColor: string
  secondaryColor: string
  sections: SectionType[]
  tags: string[]  // 用途タグ
}

export const siteTemplates: SiteTemplate[] = [
  // ========== モダンテーマ ==========
  {
    id: 'modern-standard',
    name: 'モダン・スタンダード',
    description: 'シンプルで洗練された現代的デザイン。どんな塾にも合う万能型',
    theme: 'default',
    primaryColor: '#10b981',
    secondaryColor: '#f59e0b',
    sections: ['hero', 'features', 'pricing', 'teachers', 'results', 'access', 'contact'],
    tags: ['万能', '個別指導', '集団塾'],
  },
  {
    id: 'modern-simple',
    name: 'モダン・シンプル',
    description: '必要最小限の構成。まずは始めたい方におすすめ',
    theme: 'default',
    primaryColor: '#3b82f6',
    secondaryColor: '#f97316',
    sections: ['hero', 'features', 'pricing', 'contact'],
    tags: ['シンプル', 'LP向け'],
  },

  // ========== クラシックテーマ ==========
  {
    id: 'classic-traditional',
    name: 'クラシック・伝統派',
    description: '明朝体を使った格式高いデザイン。進学塾・老舗塾向け',
    theme: 'classic',
    primaryColor: '#1e3a5f',
    secondaryColor: '#c9a227',
    sections: ['hero', 'results', 'features', 'teachers', 'pricing', 'faq', 'access', 'contact'],
    tags: ['進学塾', '老舗', '高校受験', '大学受験'],
  },
  {
    id: 'classic-academic',
    name: 'クラシック・アカデミック',
    description: '学術的で真面目な印象。合格実績をアピールしたい塾向け',
    theme: 'classic',
    primaryColor: '#7c2d12',
    secondaryColor: '#0f766e',
    sections: ['hero', 'results', 'teachers', 'schedule', 'pricing', 'gallery', 'access', 'contact'],
    tags: ['予備校', '大学受験', '医学部'],
  },

  // ========== ポップテーマ ==========
  {
    id: 'pop-kids',
    name: 'ポップ・キッズ',
    description: '明るく楽しい雰囲気。小学生・中学生向け',
    theme: 'pop',
    primaryColor: '#f472b6',
    secondaryColor: '#38bdf8',
    sections: ['hero', 'features', 'teachers', 'gallery', 'pricing', 'faq', 'contact'],
    tags: ['小学生', '中学生', '個別指導', '楽しい'],
  },
  {
    id: 'pop-colorful',
    name: 'ポップ・カラフル',
    description: 'カラフルで親しみやすいデザイン。地域密着型塾向け',
    theme: 'pop',
    primaryColor: '#a855f7',
    secondaryColor: '#22c55e',
    sections: ['hero', 'features', 'pricing', 'teachers', 'gallery', 'access', 'contact'],
    tags: ['地域密着', '補習塾', '小中学生'],
  },

  // ========== プレミアムテーマ ==========
  {
    id: 'premium-elite',
    name: 'プレミアム・エリート',
    description: 'ダークで高級感のあるデザイン。難関校受験専門塾向け',
    theme: 'premium',
    primaryColor: '#1a1a2e',
    secondaryColor: '#eab308',
    sections: ['hero', 'results', 'features', 'teachers', 'pricing', 'schedule', 'faq', 'access', 'contact'],
    tags: ['難関校', '医学部', 'エリート', '高級'],
  },
  {
    id: 'premium-prep',
    name: 'プレミアム・予備校',
    description: '本格的な予備校スタイル。大学受験に特化',
    theme: 'premium',
    primaryColor: '#0f172a',
    secondaryColor: '#f43f5e',
    sections: ['hero', 'features', 'schedule', 'teachers', 'results', 'pricing', 'gallery', 'faq', 'access', 'contact'],
    tags: ['予備校', '大学受験', '浪人生'],
  },

  // ========== ナチュラルテーマ ==========
  {
    id: 'natural-warm',
    name: 'ナチュラル・温かみ',
    description: '温かみのあるアースカラー。地域に根差した塾向け',
    theme: 'natural',
    primaryColor: '#65a30d',
    secondaryColor: '#ea580c',
    sections: ['hero', 'features', 'teachers', 'pricing', 'gallery', 'access', 'contact'],
    tags: ['地域密着', 'アットホーム', '小規模'],
  },
  {
    id: 'natural-forest',
    name: 'ナチュラル・フォレスト',
    description: '落ち着いた緑基調。集中できる環境をアピール',
    theme: 'natural',
    primaryColor: '#166534',
    secondaryColor: '#b45309',
    sections: ['hero', 'features', 'gallery', 'teachers', 'pricing', 'faq', 'access', 'contact'],
    tags: ['自習室', '落ち着いた', '高校生'],
  },
]

// テンプレートからセクションコンテンツを生成
export function generateSectionsFromTemplate(template: SiteTemplate) {
  return template.sections.map((type, index) => ({
    type,
    order_num: index + 1,
    is_visible: true,
    content: defaultSectionContent[type],
  }))
}

// テーマIDでグループ化
export function getTemplatesByTheme(): Record<ThemeId, SiteTemplate[]> {
  const grouped: Record<string, SiteTemplate[]> = {}

  for (const template of siteTemplates) {
    if (!grouped[template.theme]) {
      grouped[template.theme] = []
    }
    grouped[template.theme].push(template)
  }

  return grouped as Record<ThemeId, SiteTemplate[]>
}
