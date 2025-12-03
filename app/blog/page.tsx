import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { getBlogs, type Blog } from '@/lib/microcms'
import { Calendar, ArrowRight } from 'lucide-react'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ブログ | Roopy（るーぴー）',
  description: '大学受験の勉強法、学習のコツ、Roopyの使い方など、受験生に役立つ情報をお届けします。',
  openGraph: {
    title: 'ブログ | Roopy（るーぴー）',
    description: '大学受験の勉強法、学習のコツ、Roopyの使い方など、受験生に役立つ情報をお届けします。',
    type: 'website',
  },
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

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* サムネイル */}
      <div className="aspect-[16/9] relative bg-[#E0F7F1]">
        {blog.thumbnail ? (
          <Image
            src={blog.thumbnail.url}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={80}
              height={80}
              className="opacity-30"
            />
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-6">
        {/* カテゴリ */}
        {blog.category && (
          <span className="inline-block bg-[#E0F7F1] text-[#3A405A] text-xs font-bold px-3 py-1 rounded-full mb-3">
            {blog.category.name}
          </span>
        )}

        {/* タイトル */}
        <h2 className="text-lg font-bold text-[#3A405A] mb-2 line-clamp-2 group-hover:text-[#5DDFC3] transition-colors">
          {blog.title}
        </h2>

        {/* 概要 */}
        <p className="text-sm text-[#3A405A] opacity-70 mb-4 line-clamp-2">
          {blog.excerpt}
        </p>

        {/* 日付 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-[#3A405A] opacity-60">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(blog.publishedAt)}</span>
          </div>
          <span className="text-[#5DDFC3] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            読む
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function BlogListPage() {
  const { contents: blogs, totalCount } = await getBlogs({ limit: 20 })

  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}>
      {/* Navigation Header */}
      <nav className="bg-white border-b border-[#E0F7F1] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-xl text-[#3A405A]">Roopy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-[#5DDFC3] font-medium"
            >
              ブログ
            </Link>
            <Link
              href="/login"
              className="text-[#3A405A] hover:text-[#5DDFC3] font-medium transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="bg-[#5DDFC3] text-white px-6 py-2 rounded-full font-bold hover:bg-[#4ECFB3] transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-white to-[#F4F9F7] py-12 px-4 text-center">
        <div className="max-w-[860px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Roopy ブログ
          </h1>
          <p className="text-lg opacity-80">
            大学受験の勉強法、学習のコツ、<br className="md:hidden" />
            Roopyの使い方をお届けします
          </p>
        </div>
      </header>

      {/* Blog Grid */}
      <main className="max-w-[1200px] mx-auto px-4 py-12">
        {blogs.length > 0 ? (
          <>
            <p className="text-sm opacity-60 mb-6">{totalCount}件の記事</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={80}
              height={80}
              className="mx-auto mb-4 opacity-30"
            />
            <p className="text-lg opacity-60">まだ記事がありません</p>
            <p className="text-sm opacity-40 mt-2">近日公開予定です</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0F7F1] py-8 px-4 mt-16">
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
