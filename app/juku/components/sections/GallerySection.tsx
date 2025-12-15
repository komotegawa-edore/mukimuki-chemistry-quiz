'use client'

import { useState } from 'react'
import { GalleryContent } from '../../types'

interface Props {
  content: GalleryContent
  primaryColor: string
  secondaryColor: string
}

export function GallerySection({ content, primaryColor }: Props) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  if (content.images.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-600 text-lg">{content.subtitle}</p>
          )}
          <div
            className="w-20 h-1 mx-auto mt-6 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* グリッドレイアウト */}
        {content.layout === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-200"
              >
                <img
                  src={image.url}
                  alt={image.caption || `塾内の様子 ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* メイソンリーレイアウト */}
        {content.layout === 'masonry' && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {content.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className="group relative w-full mb-4 overflow-hidden rounded-2xl bg-gray-200 break-inside-avoid"
              >
                <img
                  src={image.url}
                  alt={image.caption || `塾内の様子 ${index + 1}`}
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* スライダーレイアウト */}
        {content.layout === 'slider' && (
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {content.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className="group relative flex-shrink-0 w-72 md:w-96 aspect-[4/3] overflow-hidden rounded-2xl bg-gray-200 snap-center"
                >
                  <img
                    src={image.url}
                    alt={image.caption || `塾内の様子 ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-sm">{image.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ライトボックス */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 前へ */}
            {selectedImage > 0 && (
              <button
                className="absolute left-4 text-white/80 hover:text-white p-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(selectedImage - 1)
                }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* 画像 */}
            <img
              src={content.images[selectedImage].url}
              alt={content.images[selectedImage].caption || ''}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* 次へ */}
            {selectedImage < content.images.length - 1 && (
              <button
                className="absolute right-4 text-white/80 hover:text-white p-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(selectedImage + 1)
                }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* キャプション */}
            {content.images[selectedImage].caption && (
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-white text-lg">{content.images[selectedImage].caption}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
