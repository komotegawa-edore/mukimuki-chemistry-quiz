'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { siteTemplates, generateSectionsFromTemplate, SiteTemplate } from '../../../juku/templates'

export default function NewSitePage() {
  const [step, setStep] = useState<'template' | 'details'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<SiteTemplate>(siteTemplates[0])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [primaryColor, setPrimaryColor] = useState(siteTemplates[0].primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(siteTemplates[0].secondaryColor)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const generateSlug = (text: string) => {
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

  const handleTemplateSelect = (template: SiteTemplate) => {
    setSelectedTemplate(template)
    setPrimaryColor(template.primaryColor)
    setSecondaryColor(template.secondaryColor)
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

      // テンプレートからセクション作成
      const sections = generateSectionsFromTemplate(selectedTemplate)

      for (const section of sections) {
        await supabase.from('juku_sections').insert({
          site_id: newSite.id,
          type: section.type,
          order_num: section.order_num,
          is_visible: section.is_visible,
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/juku-admin"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800">新規サイト作成</h1>
            <p className="text-xs text-gray-500">
              {step === 'template' ? 'ステップ 1/2: テンプレートを選択' : 'ステップ 2/2: 基本情報を入力'}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {step === 'template' ? (
          // ステップ1: テンプレート選択
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">テンプレートを選択</h2>
            <p className="text-gray-600 mb-6">サイトの構成を選んでください。後から変更可能です。</p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {siteTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all ${
                    selectedTemplate.id === template.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* カラープレビュー */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: template.primaryColor }}
                      >
                        {template.sections.length}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                      {/* セクション一覧 */}
                      <div className="flex flex-wrap gap-1">
                        {template.sections.map((section) => (
                          <span
                            key={section}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {sectionLabels[section]}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 選択チェック */}
                    {selectedTemplate.id === template.id && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href="/juku-admin"
                className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
              >
                次へ
              </button>
            </div>
          </div>
        ) : (
          // ステップ2: 詳細入力
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            {/* 選択中のテンプレート表示 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: selectedTemplate.primaryColor }}
                >
                  {selectedTemplate.sections.length}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{selectedTemplate.name}</p>
                  <p className="text-xs text-gray-500">{selectedTemplate.sections.length}セクション</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('template')}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                変更
              </button>
            </div>

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">メインカラー</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">アクセントカラー</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* プレビュー */}
              <div className="mt-3 p-4 bg-gray-50 rounded-xl">
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
              <button
                type="button"
                onClick={() => setStep('template')}
                className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl text-center hover:bg-gray-50 transition-colors"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '作成中...' : 'サイトを作成'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

const sectionLabels: Record<string, string> = {
  hero: 'ヒーロー',
  features: '特徴',
  pricing: '料金',
  teachers: '講師',
  results: '実績',
  access: 'アクセス',
  contact: 'お問い合わせ',
  blog: 'ブログ',
  schedule: '時間割',
  faq: 'FAQ',
  gallery: 'ギャラリー',
}
