import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JukuSiteRenderer } from './JukuSiteRenderer'
import { JukuSite, JukuSection } from '../types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function JukuSitePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // サイト情報を取得
  const { data: site, error: siteError } = await supabase
    .from('juku_sites')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (siteError || !site) {
    notFound()
  }

  // セクション情報を取得
  const { data: sections } = await supabase
    .from('juku_sections')
    .select('*')
    .eq('site_id', site.id)
    .eq('is_visible', true)
    .order('order_num', { ascending: true })

  return (
    <JukuSiteRenderer
      site={site as JukuSite}
      sections={(sections || []) as JukuSection[]}
      slug={slug}
    />
  )
}

// メタデータ
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('juku_sites')
    .select('name, tagline, logo_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!site) {
    return { title: 'ページが見つかりません' }
  }

  return {
    title: `${site.name} | 地域密着型の学習塾`,
    description: site.tagline || `${site.name}は地域に根ざした学習塾です。お子様一人ひとりに寄り添った指導を行っています。`,
    // ロゴがあればfaviconとして使用
    ...(site.logo_url && {
      icons: {
        icon: site.logo_url,
        apple: site.logo_url,
      },
    }),
  }
}
