import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JukuSite, JukuBlogPost } from '../../../types'

interface PageProps {
  params: Promise<{ slug: string; postSlug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug, postSlug } = await params
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
  const { data: post, error: postError } = await supabase
    .from('juku_blog_posts')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', postSlug)
    .eq('is_published', true)
    .single()

  if (postError || !post) {
    notFound()
  }

  const typedSite = site as JukuSite
  const typedPost = post as JukuBlogPost

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
            href={`/juku/${slug}/blog`}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ブログ一覧
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* アイキャッチ画像 */}
        {typedPost.featured_image && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={typedPost.featured_image}
              alt={typedPost.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* タイトル */}
        <header className="mb-8">
          <time className="text-sm text-gray-500 mb-2 block">
            {typedPost.published_at
              ? new Date(typedPost.published_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : new Date(typedPost.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
          </time>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {typedPost.title}
          </h1>
        </header>

        {/* 本文 */}
        <div className="bg-white rounded-2xl p-8 md:p-12">
          <BlogContent content={typedPost.content} />
        </div>

        {/* 戻るボタン */}
        <div className="mt-8 text-center">
          <Link
            href={`/juku/${slug}/blog`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            記事一覧に戻る
          </Link>
        </div>
      </article>

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

// ブログコンテンツレンダラー（Editor.js形式）
function BlogContent({ content }: { content: any[] }) {
  if (!content || !Array.isArray(content)) {
    return <p className="text-gray-500">記事の内容がありません</p>
  }

  return (
    <div className="prose prose-lg max-w-none">
      {content.map((block, index) => {
        switch (block.type) {
          case 'header':
            const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements
            return (
              <HeaderTag key={index} className="font-bold text-gray-800">
                {block.data.text}
              </HeaderTag>
            )

          case 'paragraph':
            return (
              <p
                key={index}
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            )

          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul'
            return (
              <ListTag key={index} className={block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'}>
                {block.data.items.map((item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ListTag>
            )

          case 'image':
            return (
              <figure key={index} className="my-8">
                <img
                  src={block.data.file?.url || block.data.url}
                  alt={block.data.caption || ''}
                  className="w-full rounded-xl"
                />
                {block.data.caption && (
                  <figcaption className="text-center text-sm text-gray-500 mt-2">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            )

          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
                <p>{block.data.text}</p>
                {block.data.caption && (
                  <cite className="text-sm">— {block.data.caption}</cite>
                )}
              </blockquote>
            )

          case 'delimiter':
            return <hr key={index} className="my-8 border-gray-200" />

          default:
            return null
        }
      })}
    </div>
  )
}

// メタデータ
export async function generateMetadata({ params }: PageProps) {
  const { slug, postSlug } = await params
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

  const { data: post } = await supabase
    .from('juku_blog_posts')
    .select('title, content')
    .eq('slug', postSlug)
    .eq('is_published', true)
    .single()

  if (!post) {
    return { title: 'ページが見つかりません' }
  }

  const faviconUrl = site.favicon_url || site.logo_url

  return {
    title: `${post.title} | ${site.name}`,
    description: getExcerpt(post.content as any[]),
    ...(faviconUrl && {
      icons: {
        icon: faviconUrl,
        apple: faviconUrl,
      },
    }),
  }
}

function getExcerpt(content: any[]): string {
  if (!content || !Array.isArray(content)) return ''
  const textBlock = content.find(block => block.type === 'paragraph')
  if (textBlock?.data?.text) {
    return textBlock.data.text.replace(/<[^>]*>/g, '').slice(0, 160)
  }
  return ''
}
