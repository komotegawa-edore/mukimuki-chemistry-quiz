import { SectionType, defaultSectionContent } from './types'

export interface SiteTemplate {
  id: string
  name: string
  description: string
  thumbnail: string  // 後でサムネイル画像を追加
  primaryColor: string
  secondaryColor: string
  sections: SectionType[]
}

export const siteTemplates: SiteTemplate[] = [
  {
    id: 'standard',
    name: 'スタンダード',
    description: '塾サイトの基本形。特徴・料金・講師紹介・実績・アクセスを網羅',
    thumbnail: '/templates/standard.png',
    primaryColor: '#10b981',
    secondaryColor: '#f59e0b',
    sections: ['hero', 'features', 'pricing', 'teachers', 'results', 'access', 'contact'],
  },
  {
    id: 'simple',
    name: 'シンプル',
    description: '必要最小限の構成。まずは始めたい方におすすめ',
    thumbnail: '/templates/simple.png',
    primaryColor: '#3b82f6',
    secondaryColor: '#f97316',
    sections: ['hero', 'features', 'pricing', 'contact'],
  },
  {
    id: 'results-focus',
    name: '実績重視',
    description: '合格実績を前面に。進学塾・受験専門塾向け',
    thumbnail: '/templates/results.png',
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    sections: ['hero', 'results', 'teachers', 'features', 'pricing', 'faq', 'access', 'contact'],
  },
  {
    id: 'modern',
    name: 'モダン',
    description: 'ギャラリーとFAQを含む現代的なデザイン',
    thumbnail: '/templates/modern.png',
    primaryColor: '#0ea5e9',
    secondaryColor: '#f59e0b',
    sections: ['hero', 'gallery', 'features', 'teachers', 'pricing', 'faq', 'contact', 'access'],
  },
  {
    id: 'minimal',
    name: 'ミニマル',
    description: '情報を絞った1ページ完結型。LP向け',
    thumbnail: '/templates/minimal.png',
    primaryColor: '#18181b',
    secondaryColor: '#ef4444',
    sections: ['hero', 'features', 'contact'],
  },
  {
    id: 'prep-school',
    name: '予備校スタイル',
    description: '大学受験予備校向け。時間割・アクセス重視の本格派',
    thumbnail: '/templates/prep-school.png',
    primaryColor: '#04384c',
    secondaryColor: '#d30062',
    sections: ['hero', 'features', 'schedule', 'teachers', 'results', 'pricing', 'gallery', 'faq', 'access', 'contact'],
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
