import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { notFound } from 'next/navigation'
import { getBlogBySlug, getAllBlogSlugs, getRelatedBlogs, type Blog } from '@/lib/microcms'
import { Calendar, ArrowLeft } from 'lucide-react'
import BlogHeader from '@/components/BlogHeader'
import BlogLikeButton from '@/components/BlogLikeButton'
import BlogComments from '@/components/BlogComments'
import RelatedBlogs from '@/components/RelatedBlogs'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

// 静的生成用のパスを取得
export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

// メタデータを動的に生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    return {
      title: '記事が見つかりません | Roopy',
    }
  }

  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt,
      url: `https://edore-edu.com/blog/${slug}`,
      images: blog.thumbnail ? [blog.thumbnail.url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
      images: blog.thumbnail ? [blog.thumbnail.url] : [],
    },
  }
}

// ISR: 60秒ごとに再検証
export const revalidate = 60

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// JSON-LD 構造化データ
function JsonLd({ blog }: { blog: Blog }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    image: blog.thumbnail?.url,
    author: {
      '@type': 'Organization',
      name: 'Roopy',
      url: 'https://edore-edu.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Roopy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://edore-edu.com/Roopy-icon.png',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  // 関連記事を取得
  const relatedBlogs = await getRelatedBlogs(blog, 3)

  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}>
      <JsonLd blog={blog} />

      <BlogHeader />

      {/* Back Link */}
      <div className="max-w-[860px] mx-auto px-4 pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#5DDFC3] hover:text-[#4ECFB3] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ブログ一覧に戻る
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-[860px] mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* カテゴリ */}
          {blog.category && (
            <span className="inline-block bg-[#E0F7F1] text-[#3A405A] text-sm font-bold px-4 py-1 rounded-full mb-4">
              {blog.category.name}
            </span>
          )}

          {/* タイトル */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* 日付 */}
          <div className="flex items-center gap-4 text-sm opacity-60">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(blog.publishedAt)}</span>
            </div>
          </div>
        </header>

        {/* サムネイル */}
        {blog.thumbnail && (
          <div className="aspect-[16/9] relative rounded-2xl overflow-hidden mb-8">
            <Image
              src={blog.thumbnail.url}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* 本文 */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-[#3A405A] prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-[#E0F7F1]
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-[#3A405A] prose-p:leading-relaxed
            prose-a:text-[#5DDFC3] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#3A405A]
            prose-ul:my-4 prose-ol:my-4
            prose-li:text-[#3A405A]
            prose-blockquote:border-l-4 prose-blockquote:border-[#5DDFC3] prose-blockquote:bg-[#E0F7F1] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-code:bg-[#E0F7F1] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-[#3A405A] prose-pre:rounded-xl
            prose-img:rounded-xl prose-img:shadow-lg
          "
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Like & Share */}
        <div className="mt-12 pt-8 border-t border-[#E0F7F1]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <BlogLikeButton blogSlug={blog.slug} />
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold">この記事をシェア</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`https://edore-edu.com/blog/${blog.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1DA1F2] text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                ポスト
              </a>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12 pt-8 border-t border-[#E0F7F1]">
          <BlogComments blogSlug={blog.slug} />
        </div>

        {/* 関連記事 */}
        <RelatedBlogs blogs={relatedBlogs} />
      </article>

      {/* CTA */}
      <section className="max-w-[860px] mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Roopyで学習を始めよう
          </h2>
          <p className="mb-6 opacity-90">
            無料で使える大学受験学習アプリ。<br />
            毎日の学習をゲーム感覚で続けられます。
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#5DDFC3] font-bold px-8 py-3 rounded-full hover:shadow-lg transition-shadow"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0F7F1] py-8 px-4 mt-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-lg text-[#3A405A]">Roopy</span>
          </Link>
          <p className="text-sm opacity-60">
            &copy; 2025 Edore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
