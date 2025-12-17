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

type Props = {
  blogs: Blog[]
}

export default function RelatedBlogs({ blogs }: Props) {
  if (blogs.length === 0) {
    return null
  }

  return (
    <section className="mt-16 pt-8 border-t border-[#E0F7F1]">
      <h2 className="text-xl font-bold text-[#3A405A] mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-[#5DDFC3] rounded-full" />
        おすすめの記事
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
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
                    width={48}
                    height={48}
                    className="opacity-30"
                  />
                </div>
              )}
            </div>

            {/* コンテンツ */}
            <div className="p-4">
              {/* カテゴリ */}
              {blog.category && (
                <span className="inline-block bg-[#E0F7F1] text-[#3A405A] text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                  {blog.category.name}
                </span>
              )}

              {/* タイトル */}
              <h3 className="text-sm font-bold text-[#3A405A] mb-2 line-clamp-2 group-hover:text-[#5DDFC3] transition-colors">
                {blog.title}
              </h3>

              {/* 日付とリンク */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-[#3A405A] opacity-60">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(blog.publishedAt)}</span>
                </div>
                <span className="text-[#5DDFC3] text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  読む
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
