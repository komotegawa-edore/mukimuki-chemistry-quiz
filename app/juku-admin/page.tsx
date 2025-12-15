'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { JukuSite, JukuSection, SectionType, sectionTypeLabels, defaultSectionContent } from '../juku/types'
import { SectionList } from './components/SectionList'
import { SectionEditor } from './components/SectionEditor'
import { SiteSettings } from './components/SiteSettings'
import { PreviewFrame } from './components/PreviewFrame'

type Tab = 'sections' | 'settings' | 'preview'

export default function JukuAdminPage() {
  const [site, setSite] = useState<JukuSite | null>(null)
  const [sections, setSections] = useState<JukuSection[]>([])
  const [selectedSection, setSelectedSection] = useState<JukuSection | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('sections')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  // デモサイトのデータを取得
  useEffect(() => {
    async function loadData() {
      // デモサイトを取得（実際は認証済みユーザーの所有サイトを取得）
      const { data: siteData } = await supabase
        .from('juku_sites')
        .select('*')
        .eq('slug', 'demo')
        .single()

      if (siteData) {
        setSite(siteData as JukuSite)

        const { data: sectionsData } = await supabase
          .from('juku_sections')
          .select('*')
          .eq('site_id', siteData.id)
          .order('order_num', { ascending: true })

        setSections((sectionsData || []) as JukuSection[])
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // セクションの順序を更新
  const handleReorder = async (newSections: JukuSection[]) => {
    setSections(newSections)

    // 順序をDBに保存
    for (let i = 0; i < newSections.length; i++) {
      await supabase
        .from('juku_sections')
        .update({ order_num: i + 1 })
        .eq('id', newSections[i].id)
    }
  }

  // セクションを追加
  const handleAddSection = async (type: SectionType) => {
    if (!site) return

    const maxOrder = Math.max(...sections.map(s => s.order_num), 0)

    const { data: newSection } = await supabase
      .from('juku_sections')
      .insert({
        site_id: site.id,
        type,
        order_num: maxOrder + 1,
        is_visible: true,
        content: defaultSectionContent[type],
      })
      .select()
      .single()

    if (newSection) {
      setSections([...sections, newSection as JukuSection])
    }
  }

  // セクションを削除
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('このセクションを削除しますか？')) return

    await supabase.from('juku_sections').delete().eq('id', sectionId)
    setSections(sections.filter(s => s.id !== sectionId))
    setSelectedSection(null)
  }

  // セクションの表示/非表示を切り替え
  const handleToggleVisibility = async (section: JukuSection) => {
    const newVisibility = !section.is_visible

    await supabase
      .from('juku_sections')
      .update({ is_visible: newVisibility })
      .eq('id', section.id)

    setSections(sections.map(s =>
      s.id === section.id ? { ...s, is_visible: newVisibility } : s
    ))
  }

  // セクションのコンテンツを更新
  const handleUpdateSection = async (sectionId: string, content: any) => {
    setSaving(true)

    await supabase
      .from('juku_sections')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', sectionId)

    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, content } : s
    ))

    setSaving(false)
  }

  // サイト設定を更新
  const handleUpdateSite = async (updates: Partial<JukuSite>) => {
    if (!site) return
    setSaving(true)

    await supabase
      .from('juku_sites')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', site.id)

    setSite({ ...site, ...updates })
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">サイトが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-800">
              {site.name}
            </h1>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
              エディタ
            </span>
          </div>

          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-sm text-gray-500">保存中...</span>
            )}
            <a
              href={`/juku/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              サイトを見る
            </a>
            <button
              onClick={() => handleUpdateSite({ is_published: !site.is_published })}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                site.is_published
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {site.is_published ? '公開中' : '非公開'}
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'sections', label: 'セクション' },
              { id: 'settings', label: 'サイト設定' },
              { id: 'preview', label: 'プレビュー' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'sections' && (
          <div className="grid grid-cols-12 gap-6">
            {/* セクションリスト */}
            <div className="col-span-4">
              <SectionList
                sections={sections}
                selectedSection={selectedSection}
                onSelect={setSelectedSection}
                onReorder={handleReorder}
                onAdd={handleAddSection}
                onDelete={handleDeleteSection}
                onToggleVisibility={handleToggleVisibility}
              />
            </div>

            {/* セクションエディタ */}
            <div className="col-span-8">
              {selectedSection ? (
                <SectionEditor
                  section={selectedSection}
                  site={site}
                  onUpdate={(content) => handleUpdateSection(selectedSection.id, content)}
                />
              ) : (
                <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <p>左のリストからセクションを選択して編集</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SiteSettings site={site} onUpdate={handleUpdateSite} />
        )}

        {activeTab === 'preview' && (
          <PreviewFrame slug={site.slug} />
        )}
      </main>
    </div>
  )
}
