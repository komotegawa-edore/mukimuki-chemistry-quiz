'use client'

import { useState, useEffect, useRef } from 'react'
import { JukuBlogPost } from '../../juku/types'
import { ImageUploader } from '../components/ImageUploader'

interface Props {
  post: JukuBlogPost | null
  siteId: string
  onSave: (post: Partial<JukuBlogPost>) => void
  onDelete?: () => void
  onTogglePublish?: () => void
}

interface ContentBlock {
  type: 'paragraph' | 'header' | 'image' | 'list'
  data: any
}

export function BlogEditor({ post, siteId, onSave, onDelete, onTogglePublish }: Props) {
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '')
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    (post?.content as ContentBlock[]) || [{ type: 'paragraph', data: { text: '' } }]
  )
  const [hasChanges, setHasChanges] = useState(false)

  // 記事が変わったらリセット
  useEffect(() => {
    setTitle(post?.title || '')
    setSlug(post?.slug || '')
    setFeaturedImage(post?.featured_image || '')
    setBlocks((post?.content as ContentBlock[]) || [{ type: 'paragraph', data: { text: '' } }])
    setHasChanges(false)
  }, [post?.id])

  const handleChange = () => {
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`,
      content: blocks,
      featured_image: featuredImage || null,
    })
    setHasChanges(false)
  }

  const addBlock = (type: ContentBlock['type'], afterIndex: number) => {
    const newBlock: ContentBlock = {
      type,
      data: type === 'paragraph' ? { text: '' }
           : type === 'header' ? { text: '', level: 2 }
           : type === 'list' ? { style: 'unordered', items: [''] }
           : { url: '', caption: '' }
    }
    const newBlocks = [...blocks]
    newBlocks.splice(afterIndex + 1, 0, newBlock)
    setBlocks(newBlocks)
    handleChange()
  }

  const updateBlock = (index: number, data: any) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], data }
    setBlocks(newBlocks)
    handleChange()
  }

  const deleteBlock = (index: number) => {
    if (blocks.length <= 1) return
    setBlocks(blocks.filter((_, i) => i !== index))
    handleChange()
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blocks.length) return
    const newBlocks = [...blocks]
    ;[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
    setBlocks(newBlocks)
    handleChange()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* ツールバー */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post && (
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                post.is_published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {post.is_published ? '公開中' : '下書き'}
            </span>
          )}
          {hasChanges && (
            <span className="text-xs text-orange-500">未保存の変更あり</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              削除
            </button>
          )}
          {onTogglePublish && post && (
            <button
              onClick={onTogglePublish}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                post.is_published
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              {post.is_published ? '非公開にする' : '公開する'}
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>

      {/* エディタ本体 */}
      <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        {/* アイキャッチ画像 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            アイキャッチ画像
          </label>
          <ImageUploader
            siteId={siteId}
            currentImage={featuredImage}
            onUpload={(url) => {
              setFeaturedImage(url)
              handleChange()
            }}
            aspectRatio="video"
          />
        </div>

        {/* タイトル */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            handleChange()
          }}
          placeholder="記事のタイトル"
          className="w-full text-3xl font-bold text-gray-800 border-none outline-none mb-4 placeholder:text-gray-300"
        />

        {/* スラッグ */}
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">
            URL: /juku/demo/blog/{slug || 'post-slug'}
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              handleChange()
            }}
            placeholder="post-slug"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* コンテンツブロック */}
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <BlockEditor
              key={index}
              block={block}
              index={index}
              totalBlocks={blocks.length}
              siteId={siteId}
              onUpdate={(data) => updateBlock(index, data)}
              onDelete={() => deleteBlock(index)}
              onMove={(dir) => moveBlock(index, dir)}
              onAddBlock={(type) => addBlock(type, index)}
            />
          ))}
        </div>

        {/* ブロック追加ボタン */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => addBlock('paragraph', blocks.length - 1)}
            className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            + テキスト
          </button>
          <button
            onClick={() => addBlock('header', blocks.length - 1)}
            className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            + 見出し
          </button>
          <button
            onClick={() => addBlock('image', blocks.length - 1)}
            className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            + 画像
          </button>
          <button
            onClick={() => addBlock('list', blocks.length - 1)}
            className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            + リスト
          </button>
        </div>
      </div>
    </div>
  )
}

// ブロックエディタ
interface BlockEditorProps {
  block: ContentBlock
  index: number
  totalBlocks: number
  siteId: string
  onUpdate: (data: any) => void
  onDelete: () => void
  onMove: (direction: 'up' | 'down') => void
  onAddBlock: (type: ContentBlock['type']) => void
}

function BlockEditor({ block, index, totalBlocks, siteId, onUpdate, onDelete, onMove, onAddBlock }: BlockEditorProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group relative">
      {/* ブロックメニュー */}
      <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        {showMenu && (
          <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 w-32">
            {index > 0 && (
              <button
                onClick={() => { onMove('up'); setShowMenu(false) }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                上に移動
              </button>
            )}
            {index < totalBlocks - 1 && (
              <button
                onClick={() => { onMove('down'); setShowMenu(false) }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                下に移動
              </button>
            )}
            {totalBlocks > 1 && (
              <button
                onClick={() => { onDelete(); setShowMenu(false) }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50"
              >
                削除
              </button>
            )}
          </div>
        )}
      </div>

      {/* ブロック本体 */}
      {block.type === 'paragraph' && (
        <textarea
          value={block.data.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="本文を入力..."
          className="w-full min-h-[80px] text-gray-700 leading-relaxed border-none outline-none resize-none placeholder:text-gray-300"
        />
      )}

      {block.type === 'header' && (
        <div className="flex items-center gap-2">
          <select
            value={block.data.level || 2}
            onChange={(e) => onUpdate({ ...block.data, level: parseInt(e.target.value) })}
            className="text-sm text-gray-500 border border-gray-200 rounded px-1"
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
          </select>
          <input
            type="text"
            value={block.data.text || ''}
            onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
            placeholder="見出しを入力..."
            className={`flex-1 font-bold text-gray-800 border-none outline-none placeholder:text-gray-300 ${
              block.data.level === 2 ? 'text-2xl' : block.data.level === 3 ? 'text-xl' : 'text-lg'
            }`}
          />
        </div>
      )}

      {block.type === 'image' && (
        <div>
          <ImageUploader
            siteId={siteId}
            currentImage={block.data.url}
            onUpload={(url) => onUpdate({ ...block.data, url })}
            aspectRatio="video"
          />
          {block.data.url && (
            <input
              type="text"
              value={block.data.caption || ''}
              onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
              placeholder="キャプション（任意）"
              className="w-full mt-2 text-sm text-gray-500 text-center border-none outline-none placeholder:text-gray-300"
            />
          )}
        </div>
      )}

      {block.type === 'list' && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onUpdate({ ...block.data, style: 'unordered' })}
              className={`px-2 py-1 text-xs rounded ${
                block.data.style !== 'ordered' ? 'bg-gray-200' : 'text-gray-500'
              }`}
            >
              箇条書き
            </button>
            <button
              onClick={() => onUpdate({ ...block.data, style: 'ordered' })}
              className={`px-2 py-1 text-xs rounded ${
                block.data.style === 'ordered' ? 'bg-gray-200' : 'text-gray-500'
              }`}
            >
              番号付き
            </button>
          </div>
          <div className="space-y-1">
            {(block.data.items || ['']).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-400">
                  {block.data.style === 'ordered' ? `${i + 1}.` : '•'}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(block.data.items || [''])]
                    newItems[i] = e.target.value
                    onUpdate({ ...block.data, items: newItems })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const newItems = [...(block.data.items || [''])]
                      newItems.splice(i + 1, 0, '')
                      onUpdate({ ...block.data, items: newItems })
                    }
                    if (e.key === 'Backspace' && item === '' && block.data.items.length > 1) {
                      e.preventDefault()
                      const newItems = block.data.items.filter((_: any, idx: number) => idx !== i)
                      onUpdate({ ...block.data, items: newItems })
                    }
                  }}
                  placeholder="リスト項目..."
                  className="flex-1 text-gray-700 border-none outline-none placeholder:text-gray-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
