import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JukuSite, JukuBlogPost } from '../../types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogListPage({ params }: PageProps) {
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

  // ブログ記事を取得
  const { data: posts } = await supabase
    .from('juku_blog_posts')
    .select('*')
    .eq('site_id', site.id)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const typedSite = site as JukuSite
  const typedPosts = (posts || []) as JukuBlogPost[]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/juku/${slug}`} className="flex items-center gap-3">
            {typedSite.logo_url ? (
              <img
                src={typedSite.logo_url}
                alt={typedSite.name}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-gray-800">{typedSite.name}</span>
            )}
          </Link>
          <Link
            href={`/juku/${slug}`}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            トップに戻る
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">お知らせ・ブログ</h1>
        <p className="text-gray-600 mb-8">教室からの最新情報をお届けします</p>

        {typedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300\" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p>まだ記事がありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {typedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/juku/${slug}/blog/${post.slug}`}
                className="block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex">
                  {post.featured_image && (
                    <div className="w-48 h-32 flex-shrink-0">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <time className="text-sm text-gray-500">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('ja-JP')
                          : new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </time>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {getExcerpt(post.content)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      <footer
        className="py-8 px-6 text-white text-center"
        style={{ backgroundColor: typedSite.primary_color }}
      >
        <p className="text-sm text-white/80">
          &copy; {new Date().getFullYear()} {typedSite.name}
        </p>
      </footer>
    </main>
  )
}

// コンテンツから抜粋を取得（HTML形式と旧ブロック形式の両方に対応）
function getExcerpt(content: string | any[]): string {
  if (!content) return ''

  // HTML形式の場合
  if (typeof content === 'string') {
    return content.replace(/<[^>]*>/g, '').slice(0, 100)
  }

  // 旧ブロック形式の場合
  if (Array.isArray(content)) {
    const textBlock = content.find(block => block.type === 'paragraph')
    if (textBlock?.data?.text) {
      return textBlock.data.text.replace(/<[^>]*>/g, '').slice(0, 100)
    }
  }

  return ''
}

// メタデータ
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('juku_sites')
    .select('name, logo_url, favicon_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!site) {
    return { title: 'ページが見つかりません' }
  }

  const faviconUrl = site.favicon_url || site.logo_url

  return {
    title: `お知らせ・ブログ | ${site.name}`,
    description: `${site.name}からの最新情報、教室の様子、学習のヒントなどをお届けします。`,
    ...(faviconUrl && {
      icons: {
        icon: faviconUrl,
        apple: faviconUrl,
      },
    }),
  }
}
