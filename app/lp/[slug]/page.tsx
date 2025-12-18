import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { LPRenderer } from './LPRenderer'
import { JukuLP, JukuLPSection, lpTypeLabels } from '@/app/juku/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: lp } = await supabase
    .from('juku_lps')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!lp) {
    return {
      title: 'ページが見つかりません',
    }
  }

  const typedLP = lp as JukuLP
  const lpTypeLabel = lpTypeLabels[typedLP.lp_type] || ''

  return {
    title: `${typedLP.name} | ${typedLP.juku_name}`,
    description: `${typedLP.juku_name}の${lpTypeLabel}。お申し込み受付中！`,
    openGraph: {
      title: `${typedLP.name} | ${typedLP.juku_name}`,
      description: `${typedLP.juku_name}の${lpTypeLabel}。お申し込み受付中！`,
      type: 'website',
    },
  }
}

export default async function LPPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // LP取得
  const { data: lp, error: lpError } = await supabase
    .from('juku_lps')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (lpError || !lp) {
    notFound()
  }

  // 公開期間チェック
  const now = new Date()
  if (lp.publish_start && new Date(lp.publish_start) > now) {
    notFound()
  }
  if (lp.publish_end && new Date(lp.publish_end) < now) {
    notFound()
  }

  // セクション取得
  const { data: sections } = await supabase
    .from('juku_lp_sections')
    .select('*')
    .eq('lp_id', lp.id)
    .order('order_num')

  return (
    <LPRenderer
      lp={lp as JukuLP}
      sections={(sections || []) as JukuLPSection[]}
    />
  )
}
