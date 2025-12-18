import { LPType, LPSectionType, defaultLPSectionContent } from '@/app/juku/types'

export interface LPTemplate {
  id: string
  name: string
  description: string
  lpType: LPType
  primaryColor: string
  secondaryColor: string
  accentColor: string
  sections: LPSectionType[]
  tags: string[]
}

export const lpTemplates: LPTemplate[] = [
  // ========== 冬期講習 ==========
  {
    id: 'winter-urgent',
    name: '冬期講習（緊急訴求型）',
    description: '受験直前の緊急感を演出。カウントダウンと残席数で申込を促進',
    lpType: 'winter',
    primaryColor: '#dc2626',
    secondaryColor: '#1e3a8a',
    accentColor: '#f59e0b',
    sections: [
      'lp_hero',
      'countdown',
      'campaign',
      'curriculum',
      'lp_pricing',
      'testimonials',
      'lp_gallery',
      'lp_faq',
      'lp_cta',
      'lp_contact',
    ],
    tags: ['受験直前', '緊急', '中3', '高3'],
  },
  {
    id: 'winter-standard',
    name: '冬期講習（スタンダード）',
    description: '一般的な冬期講習LP。成績アップをアピール',
    lpType: 'winter',
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    accentColor: '#10b981',
    sections: [
      'lp_hero',
      'campaign',
      'before_after',
      'curriculum',
      'lp_pricing',
      'testimonials',
      'lp_gallery',
      'lp_faq',
      'lp_contact',
    ],
    tags: ['標準', '成績アップ', '全学年'],
  },

  // ========== 夏期講習 ==========
  {
    id: 'summer-intensive',
    name: '夏期講習（集中特訓型）',
    description: '長期休みを活かした集中講座。ビフォーアフターで効果を訴求',
    lpType: 'summer',
    primaryColor: '#0891b2',
    secondaryColor: '#f97316',
    accentColor: '#eab308',
    sections: [
      'lp_hero',
      'campaign',
      'before_after',
      'curriculum',
      'lp_pricing',
      'testimonials',
      'lp_gallery',
      'lp_faq',
      'lp_cta',
      'lp_contact',
    ],
    tags: ['夏休み', '集中', '弱点克服'],
  },
  {
    id: 'summer-fun',
    name: '夏期講習（楽しい学び型）',
    description: '小中学生向け。楽しく学べる雰囲気をアピール',
    lpType: 'summer',
    primaryColor: '#0ea5e9',
    secondaryColor: '#f472b6',
    accentColor: '#22c55e',
    sections: [
      'lp_hero',
      'campaign',
      'lp_gallery',
      'curriculum',
      'testimonials',
      'lp_pricing',
      'lp_faq',
      'lp_contact',
    ],
    tags: ['小学生', '中学生', '楽しい'],
  },

  // ========== 春期講習 ==========
  {
    id: 'spring-newstart',
    name: '春期講習（新学年準備型）',
    description: '新学年に向けた準備講座。先取り学習をアピール',
    lpType: 'spring',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    accentColor: '#14b8a6',
    sections: [
      'lp_hero',
      'campaign',
      'curriculum',
      'lp_pricing',
      'testimonials',
      'lp_gallery',
      'lp_faq',
      'lp_contact',
    ],
    tags: ['新学年', '先取り', '準備'],
  },

  // ========== テスト対策 ==========
  {
    id: 'test-prep-urgent',
    name: 'テスト対策（直前集中型）',
    description: '定期テスト直前の短期集中講座',
    lpType: 'test_prep',
    primaryColor: '#7c3aed',
    secondaryColor: '#dc2626',
    accentColor: '#f59e0b',
    sections: [
      'lp_hero',
      'countdown',
      'campaign',
      'before_after',
      'lp_pricing',
      'lp_faq',
      'lp_cta',
      'lp_contact',
    ],
    tags: ['定期テスト', '直前', '短期'],
  },

  // ========== 入塾キャンペーン ==========
  {
    id: 'enrollment-campaign',
    name: '入塾キャンペーン',
    description: '新規入塾者向けのキャンペーンLP',
    lpType: 'enrollment',
    primaryColor: '#059669',
    secondaryColor: '#0284c7',
    accentColor: '#f97316',
    sections: [
      'lp_hero',
      'campaign',
      'before_after',
      'testimonials',
      'lp_gallery',
      'lp_pricing',
      'lp_faq',
      'lp_cta',
      'lp_contact',
    ],
    tags: ['入塾', 'キャンペーン', '新規'],
  },
]

// テンプレートからセクションデータを生成
export function generateLPSectionsFromTemplate(template: LPTemplate) {
  return template.sections.map((type, index) => ({
    type,
    order_num: index + 1,
    is_visible: true,
    content: defaultLPSectionContent[type],
  }))
}

// LPタイプでテンプレートをフィルター
export function getTemplatesByLPType(lpType: LPType): LPTemplate[] {
  return lpTemplates.filter((t) => t.lpType === lpType)
}

// タグでテンプレートを検索
export function searchTemplatesByTag(tag: string): LPTemplate[] {
  return lpTemplates.filter((t) =>
    t.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
  )
}
