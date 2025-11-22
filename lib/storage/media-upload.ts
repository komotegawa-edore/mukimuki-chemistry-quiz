/**
 * Supabase Storage メディアアップロード用ヘルパー
 * 画像・音声ファイルのアップロード・削除を管理
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

export const STORAGE_BUCKET = 'question-media'

export type MediaFileType = 'image' | 'audio'

export interface UploadResult {
  url: string
  path: string
}

/**
 * メディアファイルをアップロード
 * @param file - アップロードするファイル
 * @param questionId - 問題ID（既存問題の場合）
 * @param mediaType - メディアタイプ（image or audio）
 * @param fieldName - フィールド名（question_image, choice_a_image など）
 */
export async function uploadMediaFile(
  file: File,
  questionId: number | null,
  mediaType: MediaFileType,
  fieldName: string
): Promise<UploadResult> {
  const supabase = createClient()

  // ファイル拡張子を取得
  const fileExt = file.name.split('.').pop()
  const timestamp = Date.now()

  // ファイルパスを生成: {mediaType}/{questionId or temp}/{fieldName}_{timestamp}.{ext}
  const folder = questionId ? `${questionId}` : `temp_${timestamp}`
  const fileName = `${fieldName}_${timestamp}.${fileExt}`
  const filePath = `${mediaType}/${folder}/${fileName}`

  // ファイルをアップロード
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`アップロードエラー: ${error.message}`)
  }

  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

/**
 * メディアファイルを削除
 * @param url - 削除するファイルのURL
 */
export async function deleteMediaFile(url: string): Promise<void> {
  if (!url) return

  const supabase = createClient()

  // URLからパスを抽出
  const path = extractPathFromUrl(url)
  if (!path) return

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path])

  if (error) {
    console.error('ファイル削除エラー:', error)
    // 削除エラーは致命的ではないので、ログのみ
  }
}

/**
 * 複数のメディアファイルを削除
 * @param urls - 削除するファイルのURL配列
 */
export async function deleteMultipleMediaFiles(urls: (string | null)[]): Promise<void> {
  const validUrls = urls.filter((url): url is string => !!url)
  await Promise.all(validUrls.map(deleteMediaFile))
}

/**
 * URLからストレージパスを抽出
 */
function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}

/**
 * ファイルタイプの検証
 */
export function validateFileType(file: File, mediaType: MediaFileType): boolean {
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'],
  }

  return allowedTypes[mediaType].includes(file.type)
}

/**
 * ファイルサイズの検証（10MB制限）
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxBytes
}

/**
 * 一時ファイルのクリーンアップ（問題保存時に使用）
 * @param tempUrls - 一時URLの配列
 * @param questionId - 保存された問題ID
 */
export async function moveTempFilesToPermanent(
  tempUrls: (string | null)[],
  questionId: number
): Promise<Record<string, string>> {
  const supabase = createClient()
  const urlMap: Record<string, string> = {}

  for (const url of tempUrls) {
    if (!url || !url.includes('temp_')) continue

    const oldPath = extractPathFromUrl(url)
    if (!oldPath) continue

    // 新しいパスを生成
    const newPath = oldPath.replace(/temp_\d+/, questionId.toString())

    // ファイルを移動（コピー→削除）
    const { data: copyData, error: copyError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .copy(oldPath, newPath)

    if (!copyError) {
      await supabase.storage.from(STORAGE_BUCKET).remove([oldPath])

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(newPath)

      urlMap[url] = urlData.publicUrl
    }
  }

  return urlMap
}
