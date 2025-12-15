'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { defaultSectionContent } from '../../../juku/types'

const colorPresets = [
  { name: 'エメラルド', primary: '#10b981', secondary: '#f59e0b' },
  { name: 'ブルー', primary: '#3b82f6', secondary: '#f97316' },
  { name: 'パープル', primary: '#8b5cf6', secondary: '#ec4899' },
  { name: 'レッド', primary: '#ef4444', secondary: '#f59e0b' },
  { name: 'ティール', primary: '#14b8a6', secondary: '#f59e0b' },
  { name: 'インディゴ', primary: '#6366f1', secondary: '#f97316' },
]

export default function NewSitePage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#10b981')
  const [secondaryColor, setSecondaryColor] = useState('#f59e0b')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const generateSlug = (text: string) => {
    // ひらがな・カタカナ・漢字をローマ字風に変換せず、英数字とハイフンのみ残す
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!name.trim()) {
      setError('塾名を入力してください')
      setIsLoading(false)
      return
    }

    const finalSlug = slug || `juku-${Date.now()}`

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/juku-admin/login')
        return
      }

      // スラッグの重複チェック
      const { data: existing } = await supabase
        .from('juku_sites')
        .select('id')
        .eq('slug', finalSlug)
        .single()

      if (existing) {
        setError('このURLは既に使用されています。別のURLを入力してください。')
        setIsLoading(false)
        return
      }

      // サイト作成
      const { data: newSite, error: siteError } = await supabase
        .from('juku_sites')
        .insert({
          name,
          slug: finalSlug,
          owner_id: user.id,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          font_family: 'Noto Sans JP',
          is_published: false,
        })
        .select()
        .single()

      if (siteError) {
        console.error('Site creation error:', siteError)
        setError('サイトの作成に失敗しました')
        setIsLoading(false)
        return
      }

      // 初期セクション作成
      const initialSections = [
        { type: 'hero', order_num: 1, content: defaultSectionContent.hero },
        { type: 'features', order_num: 2, content: defaultSectionContent.features },
        { type: 'contact', order_num: 3, content: defaultSectionContent.contact },
      ]

      for (const section of initialSections) {
        await supabase.from('juku_sections').insert({
          site_id: newSite.id,
          type: section.type,
          order_num: section.order_num,
          is_visible: true,
          content: section.content,
        })
      }

      // サイト編集ページへリダイレクト
      router.push(`/juku-admin/sites/${newSite.id}`)
    } catch (err) {
      console.error('Error creating site:', err)
      setError('サイトの作成に失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/juku-admin"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">新規サイト作成</h1>
        </div>
      </header>

      {/* フォーム */}
      <main className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* 塾名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              塾名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="○○塾"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              サイトURL
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">edore-edu.com/juku/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="your-juku"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              英数字とハイフンのみ使用できます
            </p>
          </div>

          {/* テーマカラー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              テーマカラー
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(preset.primary)
                    setSecondaryColor(preset.secondary)
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    primaryColor === preset.primary
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="text-sm">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* プレビュー */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  ボタン
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ backgroundColor: secondaryColor }}
                >
                  アクセント
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/juku-admin"
              className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl text-center hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '作成中...' : 'サイトを作成'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
