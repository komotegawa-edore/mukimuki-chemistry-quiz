'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { JukuSite, JukuBlogPost } from '../../../../juku/types'
import { BlogEditor } from '../../../blog/BlogEditor'

export default function SiteBlogPage() {
  const params = useParams()
  const siteId = params.siteId as string
  const [site, setSite] = useState<JukuSite | null>(null)
  const [posts, setPosts] = useState<JukuBlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<JukuBlogPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [siteId])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/juku-admin/login')
      return
    }

    // サイト取得（自分が所有するサイトのみ）
    const { data: siteData, error: siteError } = await supabase
      .from('juku_sites')
      .select('*')
      .eq('id', siteId)
      .eq('owner_id', user.id)
      .single()

    if (siteError || !siteData) {
      router.push('/juku-admin')
      return
    }

    setSite(siteData as JukuSite)

    // ブログ記事取得
    const { data: postsData } = await supabase
      .from('juku_blog_posts')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })

    setPosts((postsData || []) as JukuBlogPost[])
    setLoading(false)
  }

  const handleCreateNew = () => {
    setSelectedPost(null)
    setIsCreating(true)
  }

  const handleSelectPost = (post: JukuBlogPost) => {
    setSelectedPost(post)
    setIsCreating(false)
  }

  const handleSave = async (post: Partial<JukuBlogPost>) => {
    if (!site) return

    if (selectedPost) {
      // 更新
      await supabase
        .from('juku_blog_posts')
        .update({
          ...post,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPost.id)

      setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, ...post } as JukuBlogPost : p))
      setSelectedPost({ ...selectedPost, ...post } as JukuBlogPost)
    } else {
      // 新規作成
      const { data: newPost } = await supabase
        .from('juku_blog_posts')
        .insert({
          site_id: site.id,
          title: post.title || '無題',
          slug: post.slug || `post-${Date.now()}`,
          content: post.content || [],
          featured_image: post.featured_image || null,
          is_published: false,
        })
        .select()
        .single()

      if (newPost) {
        setPosts([newPost as JukuBlogPost, ...posts])
        setSelectedPost(newPost as JukuBlogPost)
        setIsCreating(false)
      }
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('この記事を削除しますか？')) return

    await supabase.from('juku_blog_posts').delete().eq('id', postId)
    setPosts(posts.filter(p => p.id !== postId))
    setSelectedPost(null)
    setIsCreating(false)
  }

  const handleTogglePublish = async (post: JukuBlogPost) => {
    const newPublished = !post.is_published
    const publishedAt = newPublished ? new Date().toISOString() : null

    await supabase
      .from('juku_blog_posts')
      .update({
        is_published: newPublished,
        published_at: publishedAt,
      })
      .eq('id', post.id)

    setPosts(posts.map(p =>
      p.id === post.id ? { ...p, is_published: newPublished, published_at: publishedAt } : p
    ))

    if (selectedPost?.id === post.id) {
      setSelectedPost({ ...selectedPost, is_published: newPublished, published_at: publishedAt })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">サイトが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/juku-admin/sites/${siteId}`}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                ブログ管理
              </h1>
              <p className="text-xs text-gray-500">{site.name}</p>
            </div>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            新規作成
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-6">
          {/* 記事リスト */}
          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">記事一覧</h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                {posts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>まだ記事がありません</p>
                    <button
                      onClick={handleCreateNew}
                      className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
                    >
                      最初の記事を作成
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handleSelectPost(post)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedPost?.id === post.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">
                            {post.title || '無題'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(post.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full ${
                            post.is_published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {post.is_published ? '公開' : '下書き'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* エディタ */}
          <div className="col-span-8">
            {(selectedPost || isCreating) ? (
              <BlogEditor
                post={selectedPost}
                siteId={site.id}
                onSave={handleSave}
                onDelete={selectedPost ? () => handleDelete(selectedPost.id) : undefined}
                onTogglePublish={selectedPost ? () => handleTogglePublish(selectedPost) : undefined}
              />
            ) : (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p>記事を選択するか、新規作成してください</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
