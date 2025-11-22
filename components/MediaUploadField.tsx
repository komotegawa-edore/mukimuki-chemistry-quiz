'use client'

import { useState } from 'react'
import Image from 'next/image'
import { uploadMediaFile, deleteMediaFile, validateFileType, validateFileSize } from '@/lib/storage/media-upload'

interface MediaUploadFieldProps {
  label: string
  mediaType: 'image' | 'audio'
  currentUrl: string | null
  onUpload: (url: string) => void
  onDelete: () => void
  questionId: number | null
  fieldName: string
}

export default function MediaUploadField({
  label,
  mediaType,
  currentUrl,
  onUpload,
  onDelete,
  questionId,
  fieldName,
}: MediaUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // バリデーション
    if (!validateFileType(file, mediaType)) {
      alert(`${mediaType === 'image' ? '画像' : '音声'}ファイルを選択してください`)
      return
    }
    if (!validateFileSize(file, 10)) {
      alert('ファイルサイズは10MB以下にしてください')
      return
    }

    setUploading(true)
    try {
      const result = await uploadMediaFile(file, questionId, mediaType, fieldName)
      onUpload(result.url)
      setImageError(false)
    } catch (error) {
      console.error('アップロードエラー:', error)
      alert('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentUrl) return
    if (!confirm('削除してよろしいですか？')) return

    try {
      await deleteMediaFile(currentUrl)
      onDelete()
    } catch (error) {
      console.error('削除エラー:', error)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      {/* プレビュー */}
      {currentUrl && (
        <div className="relative bg-gray-50 rounded-lg p-4">
          {mediaType === 'image' ? (
            <div className="relative w-full h-48 bg-white rounded border border-gray-200">
              {!imageError ? (
                <Image
                  src={currentUrl}
                  alt={label}
                  fill
                  className="object-contain p-2"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  画像の読み込みに失敗しました
                </div>
              )}
            </div>
          ) : (
            <audio src={currentUrl} controls className="w-full" />
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            削除
          </button>
        </div>
      )}

      {/* アップロードボタン */}
      <div>
        <input
          type="file"
          accept={mediaType === 'image' ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp' : 'audio/mpeg,audio/mp3,audio/wav,audio/ogg'}
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        {uploading && (
          <p className="text-sm text-blue-600 mt-1">アップロード中...</p>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {mediaType === 'image'
          ? '対応形式: JPEG, PNG, GIF, WebP（最大10MB）'
          : '対応形式: MP3, WAV, OGG（最大10MB）'}
      </p>
    </div>
  )
}
