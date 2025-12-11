import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { getBlogs } from '@/lib/microcms'
import BlogHeader from '@/components/BlogHeader'
import BlogCard from '@/components/BlogCard'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ブログ',
  description: '大学受験の勉強法、学習のコツ、Roopyの使い方など、受験生に役立つ情報をお届けします。',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'ブログ | Roopy（るーぴー）',
    description: '大学受験の勉強法、学習のコツ、Roopyの使い方など、受験生に役立つ情報をお届けします。',
    type: 'website',
    url: 'https://edore-edu.com/blog',
  },
}

// ISR: 60秒ごとに再検証
export const revalidate = 60

export default async function BlogListPage() {
  const { contents: blogs, totalCount } = await getBlogs({ limit: 20 })

  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}>
      <BlogHeader />

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
