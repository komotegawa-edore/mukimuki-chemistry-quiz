'use client'

import { useState } from 'react'
import { LPGalleryContent } from '@/app/juku/types'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

interface Props {
  content: LPGalleryContent
  primaryColor: string
  accentColor: string
}

export function LPGallerySection({ content, primaryColor, accentColor }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // カテゴリ抽出
  const categories = Array.from(
    new Set(content.images.map((img) => img.category).filter(Boolean))
  ) as string[]

  // フィルタリング
  const filteredImages = activeCategory
    ? content.images.filter((img) => img.category === activeCategory)
    : content.images

  if (content.images.length === 0) {
    return null
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevImage = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null
    )
  const nextImage = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % filteredImages.length : null
    )

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `${primaryColor}15` }}
          >
            <Camera className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: primaryColor }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
        </div>

        {/* カテゴリフィルター */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === null
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                background: activeCategory === null ? primaryColor : undefined,
              }}
            >
              すべて
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{
                  background: activeCategory === cat ? primaryColor : undefined,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ギャラリーグリッド */}
        <div
          className={`grid gap-4 ${
            content.layout === 'masonry'
              ? 'columns-2 md:columns-3 lg:columns-4 space-y-4'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {filteredImages.map((image, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-xl cursor-pointer ${
                content.layout === 'masonry' ? 'break-inside-avoid mb-4' : 'aspect-square'
              }`}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.url}
                alt={image.caption || `塾の様子 ${index + 1}`}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                  content.layout === 'masonry' ? '' : 'absolute inset-0'
                }`}
              />

              {/* オーバーレイ */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: primaryColor }}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* キャプション */}
              {content.showCaptions && image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-sm">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ライトボックス */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* 閉じるボタン */}
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </button>

            {/* 前へ */}
            <button
              className="absolute left-4 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* 画像 */}
            <div
              className="max-w-4xl max-h-[80vh] px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredImages[lightboxIndex].url}
                alt={filteredImages[lightboxIndex].caption || ''}
                className="max-w-full max-h-[80vh] object-contain"
              />
              {content.showCaptions && filteredImages[lightboxIndex].caption && (
                <p className="text-white text-center mt-4">
                  {filteredImages[lightboxIndex].caption}
                </p>
              )}
            </div>

            {/* 次へ */}
            <button
              className="absolute right-4 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* カウンター */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
