'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Subject } from '@/lib/types/database'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data, error } = await supabase
          .from('mukimuki_subjects')
          .select('*')
          .order('display_order')

        if (error) throw error
        if (data) setSubjects(data)
      } catch (error) {
        console.error('教科の取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubjects()
  }, [supabase])

  const getMediaTypeLabel = (mediaType: string) => {
    switch (mediaType) {
      case 'text':
        return 'テキスト問題'
      case 'image':
        return '画像問題対応'
      case 'audio':
        return '音声問題対応'
      case 'mixed':
        return '複合問題'
      default:
        return 'テキスト問題'
    }
  }

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'text':
        return '📝'
      case 'image':
        return '🖼️'
      case 'audio':
        return '🎧'
      case 'mixed':
        return '🎬'
      default:
        return '📝'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">教科を選択</h1>
          <p className="text-gray-600">学習する教科を選んでください</p>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">まだ教科が登録されていません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}/chapters`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getMediaTypeIcon(subject.media_type)}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {subject.name}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {subject.description && (
                    <p className="text-gray-600 mb-4 text-sm">{subject.description}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {getMediaTypeLabel(subject.media_type)}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3">
                  <p className="text-white text-sm font-semibold flex items-center justify-between">
                    <span>章一覧を見る</span>
                    <span>→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← 戻る
          </button>
        </div>
      </div>
    </div>
  )
}
