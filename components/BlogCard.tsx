import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import type { Blog } from '@/lib/microcms'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogCard({ blog }: { blog: Blog }) {
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
