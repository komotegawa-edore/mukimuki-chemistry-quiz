'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Chapter, Subject } from '@/lib/types/database'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function SubjectChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const subjectId = Number(params.subjectId)

  useEffect(() => {
    async function fetchData() {
      try {
        // 教科情報を取得
        const { data: subjectData, error: subjectError } = await supabase
          .from('mukimuki_subjects')
          .select('*')
          .eq('id', subjectId)
          .single()

        if (subjectError) throw subjectError
        setSubject(subjectData)

        // 章一覧を取得（公開済みのみ）
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('mukimuki_chapters')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('is_published', true)
          .order('order_num')

        if (chaptersError) throw chaptersError
        if (chaptersData) setChapters(chaptersData)
      } catch (error) {
        console.error('データ取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase, subjectId])

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

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">教科が見つかりません</p>
            <Link href="/subjects" className="text-blue-600 hover:underline">
              教科一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title={subject.name}
        rightContent={
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            ← ホームに戻る
          </Link>
        }
      />
      <div className="max-w-4xl mx-auto p-6">
        {subject.description && (
          <p className="text-gray-600 mb-8">{subject.description}</p>
        )}

        {chapters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">まだ章が登録されていません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/quiz/${chapter.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {chapter.order_num}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {chapter.title}
                    </h2>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
