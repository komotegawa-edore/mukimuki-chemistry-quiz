'use client'

import { useState, useEffect } from 'react'
import { JukuBlogPost } from '../../juku/types'
import { ImageUploader } from '../components/ImageUploader'
import { RichTextEditor } from './RichTextEditor'

interface Props {
  post: JukuBlogPost | null
  siteId: string
  onSave: (post: Partial<JukuBlogPost>) => void
  onDelete?: () => void
  onTogglePublish?: () => void
}

// 古いブロック形式からHTMLへの変換
function blocksToHtml(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''

  return blocks.map(block => {
    if (block.type === 'paragraph') {
      return `<p>${block.data?.text || ''}</p>`
    }
    if (block.type === 'header') {
      const level = block.data?.level || 2
      return `<h${level}>${block.data?.text || ''}</h${level}>`
    }
    if (block.type === 'image') {
      const caption = block.data?.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''
      return `<figure><img src="${block.data?.url || ''}" alt="${block.data?.caption || ''}" />${caption}</figure>`
    }
    if (block.type === 'list') {
      const tag = block.data?.style === 'ordered' ? 'ol' : 'ul'
      const items = (block.data?.items || []).map((item: string) => `<li>${item}</li>`).join('')
      return `<${tag}>${items}</${tag}>`
    }
    return ''
  }).join('')
}

// コンテンツの初期値を取得
function getInitialContent(post: JukuBlogPost | null): string {
  if (!post?.content) return ''

  // 既にHTML文字列の場合
  if (typeof post.content === 'string') {
    return post.content
  }

  // 古いブロック形式の場合
  if (Array.isArray(post.content)) {
    return blocksToHtml(post.content)
  }

  return ''
}

export function BlogEditor({ post, siteId, onSave, onDelete, onTogglePublish }: Props) {
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '')
  const [content, setContent] = useState(getInitialContent(post))
  const [hasChanges, setHasChanges] = useState(false)
  const [showSlugInput, setShowSlugInput] = useState(false)

  // 記事が変わったらリセット
  useEffect(() => {
    setTitle(post?.title || '')
    setSlug(post?.slug || '')
    setFeaturedImage(post?.featured_image || '')
    setContent(getInitialContent(post))
    setHasChanges(false)
    setShowSlugInput(false)
  }, [post?.id])

  const handleChange = () => {
    setHasChanges(true)
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleSave = () => {
    const finalSlug = slug || generateSlug(title) || `post-${Date.now()}`

    onSave({
      title,
      slug: finalSlug,
      content: content, // HTMLとして保存
      featured_image: featuredImage || null,
    })
    setHasChanges(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* ヘッダーツールバー */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          {post && (
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                post.is_published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {post.is_published ? '公開中' : '下書き'}
            </span>
          )}
          {hasChanges && (
            <span className="flex items-center gap-1 text-xs text-orange-500">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              未保存
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              削除
            </button>
          )}
          {onTogglePublish && post && (
            <button
              onClick={onTogglePublish}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
                post.is_published
                  ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  : 'border-green-200 text-green-600 hover:bg-green-50'
              }`}
            >
              {post.is_published ? '非公開にする' : '公開する'}
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            保存
          </button>
        </div>
      </div>

      {/* メインエディタ */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* アイキャッチ画像 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              アイキャッチ画像
            </label>
            {featuredImage && (
              <button
                onClick={() => {
                  setFeaturedImage('')
                  handleChange()
                }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                削除
              </button>
            )}
          </div>
          {featuredImage ? (
            <div className="relative group">
              <img
                src={featuredImage}
                alt="アイキャッチ"
                className="w-full h-48 object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    // 既存の画像を削除して再アップロードを促す
                    setFeaturedImage('')
                    handleChange()
                  }}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                  変更
                </button>
              </div>
            </div>
          ) : (
            <ImageUploader
              siteId={siteId}
              currentImage=""
              onUpload={(url) => {
                setFeaturedImage(url)
                handleChange()
              }}
              aspectRatio="video"
              label="クリックまたはドラッグ&ドロップで画像をアップロード"
            />
          )}
        </div>

        {/* タイトル */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              handleChange()
            }}
            placeholder="記事のタイトルを入力"
            className="w-full text-3xl font-bold text-gray-900 border-none outline-none placeholder:text-gray-300 bg-transparent"
          />

          {/* URL設定 */}
          <div className="mt-2">
            {showSlugInput ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">URL:</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    handleChange()
                  }}
                  placeholder={generateSlug(title) || 'post-slug'}
                  className="flex-1 text-sm text-gray-600 border-b border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent"
                />
                <button
                  onClick={() => setShowSlugInput(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSlugInput(true)}
                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>/{slug || generateSlug(title) || 'post-slug'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 本文エディタ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            本文
          </label>
          <RichTextEditor
            content={content}
            onChange={(html) => {
              setContent(html)
              handleChange()
            }}
            siteId={siteId}
            placeholder="本文を入力... (Markdownショートカット対応: ## 見出し、- リスト、など)"
          />
        </div>
      </div>
    </div>
  )
}
