import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // サイト情報を取得
  const { data: site } = await supabase
    .from('juku_sites')
    .select('id, slug, custom_domain, updated_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!site) {
    return new Response('Not found', { status: 404 })
  }

  // ブログ記事を取得
  const { data: posts } = await supabase
    .from('juku_blog_posts')
    .select('slug, updated_at')
    .eq('site_id', site.id)
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  // ベースURLを決定（カスタムドメインがあればそれを使用）
  const baseUrl = site.custom_domain
    ? `https://${site.custom_domain}`
    : `https://edore-edu.com/juku/${site.slug}`

  // サイトマップXMLを生成
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date(site.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date(site.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${(posts || []).map(post => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
