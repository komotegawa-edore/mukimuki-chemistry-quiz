'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  siteId: string
  onUpload: (url: string) => void
  currentImage?: string
  aspectRatio?: 'square' | 'video' | 'free'
  label?: string
}

export function ImageUploader({
  siteId,
  onUpload,
  currentImage,
  aspectRatio = 'free',
  label = '画像をアップロード',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    free: 'min-h-[120px]',
  }[aspectRatio]

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    setUploading(true)

    try {
      // プレビュー表示
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)

      // Supabase Storageにアップロード
      const fileExt = file.name.split('.').pop()
      const fileName = `${siteId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('juku-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('アップロードに失敗しました')
        return
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('juku-images')
        .getPublicUrl(fileName)

      onUpload(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {preview ? (
        <div className={`relative rounded-xl overflow-hidden bg-gray-100 ${aspectRatioClass}`}>
          <img
            src={preview}
            alt="プレビュー"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              変更
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`${aspectRatioClass} border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">アップロード中...</p>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 mb-1">
                クリックまたはドラッグ&ドロップ
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, GIF（5MBまで）
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
        className="hidden"
      />
    </div>
  )
}

// 複数画像アップロード用
interface MultiImageUploaderProps {
  siteId: string
  images: { url: string; caption?: string }[]
  onChange: (images: { url: string; caption?: string }[]) => void
}

export function MultiImageUploader({ siteId, images, onChange }: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (files: FileList) => {
    setUploading(true)

    const newImages: { url: string; caption?: string }[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) continue

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${siteId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

        const { error } = await supabase.storage
          .from('juku-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('juku-images')
            .getPublicUrl(fileName)

          newImages.push({ url: publicUrl })
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    onChange([...images, ...newImages])
    setUploading(false)
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleCaptionChange = (index: number, caption: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], caption }
    onChange(newImages)
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onChange(newImages)
  }

  return (
    <div>
      {/* 画像グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={image.url}
                alt={image.caption || `画像 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* オーバーレイ */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleReorder(index, index - 1)}
                  className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                  title="前へ"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                title="削除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleReorder(index, index + 1)}
                  className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                  title="次へ"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* キャプション */}
            <input
              type="text"
              value={image.caption || ''}
              onChange={(e) => handleCaptionChange(index, e.target.value)}
              placeholder="キャプション"
              className="mt-2 w-full px-2 py-1 text-xs border border-gray-200 rounded-lg"
            />
          </div>
        ))}

        {/* 追加ボタン */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <>
              <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">追加</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) handleUpload(e.target.files)
        }}
        className="hidden"
      />
    </div>
  )
}
