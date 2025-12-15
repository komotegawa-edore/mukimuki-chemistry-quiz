'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { JukuSite, JukuSection, SectionType, sectionTypeLabels, defaultSectionContent } from '../../../juku/types'
import { SectionList } from '../../components/SectionList'
import { SectionEditor } from '../../components/SectionEditor'
import { SiteSettings } from '../../components/SiteSettings'
import { PreviewFrame } from '../../components/PreviewFrame'

type Tab = 'sections' | 'settings' | 'preview'

interface PageProps {
  params: Promise<{ siteId: string }>
}

export default function SiteEditorPage({ params }: PageProps) {
  const { siteId } = use(params)
  const [site, setSite] = useState<JukuSite | null>(null)
  const [sections, setSections] = useState<JukuSection[]>([])
  const [selectedSection, setSelectedSection] = useState<JukuSection | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('sections')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [pendingSiteChanges, setPendingSiteChanges] = useState<Partial<JukuSite>>({})
  const [pendingSectionChanges, setPendingSectionChanges] = useState<Record<string, any>>({})

  const router = useRouter()
  const supabase = createClient()

  // データ読み込み
  useEffect(() => {
    loadData()
  }, [siteId])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/juku-admin/login')
      return
    }

    // サイト取得（自分が所有するサイトのみ）
    const { data: siteData, error: siteError } = await supabase
      .from('juku_sites')
      .select('*')
      .eq('id', siteId)
      .eq('owner_id', user.id)
      .single()

    if (siteError || !siteData) {
      router.push('/juku-admin')
      return
    }

    setSite(siteData as JukuSite)

    // セクション取得
    const { data: sectionsData } = await supabase
      .from('juku_sections')
      .select('*')
      .eq('site_id', siteId)
      .order('order_num', { ascending: true })

    setSections((sectionsData || []) as JukuSection[])
    setLoading(false)
  }

  // セクションの順序を更新（即座に保存）
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

    // 保留中の変更も削除
    const newPendingChanges = { ...pendingSectionChanges }
    delete newPendingChanges[sectionId]
    setPendingSectionChanges(newPendingChanges)
  }

  // セクションの表示/非表示を切り替え（即座に保存）
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

  // セクションのコンテンツを変更（保留）
  const handleUpdateSection = (sectionId: string, content: any) => {
    setPendingSectionChanges({
      ...pendingSectionChanges,
      [sectionId]: content,
    })

    // ローカル状態も更新
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, content } : s
    ))

    if (selectedSection?.id === sectionId) {
      setSelectedSection({ ...selectedSection, content })
    }

    setHasChanges(true)
  }

  // サイト設定を変更（保留）
  const handleUpdateSite = (updates: Partial<JukuSite>) => {
    setPendingSiteChanges({
      ...pendingSiteChanges,
      ...updates,
    })

    // ローカル状態も更新
    if (site) {
      setSite({ ...site, ...updates })
    }

    setHasChanges(true)
  }

  // すべての変更を保存
  const handleSaveAll = async () => {
    if (!site) return
    setSaving(true)

    try {
      // サイト設定を保存
      if (Object.keys(pendingSiteChanges).length > 0) {
        await supabase
          .from('juku_sites')
          .update({
            ...pendingSiteChanges,
            updated_at: new Date().toISOString(),
          })
          .eq('id', site.id)
      }

      // セクションの変更を保存
      for (const [sectionId, content] of Object.entries(pendingSectionChanges)) {
        await supabase
          .from('juku_sections')
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sectionId)
      }

      // 保留中の変更をクリア
      setPendingSiteChanges({})
      setPendingSectionChanges({})
      setHasChanges(false)
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // 公開/非公開を切り替え
  const handleTogglePublish = async () => {
    if (!site) return
    setSaving(true)

    const newPublished = !site.is_published

    await supabase
      .from('juku_sites')
      .update({
        is_published: newPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', site.id)

    setSite({ ...site, is_published: newPublished })
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
            <Link
              href="/juku-admin"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {site.name}
              </h1>
              <p className="text-xs text-gray-500">
                edore-edu.com/juku/{site.slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs text-orange-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                未保存の変更あり
              </span>
            )}
            {saving && (
              <span className="text-sm text-gray-500">保存中...</span>
            )}
            <Link
              href={`/juku-admin/sites/${siteId}/blog`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              ブログ
            </Link>
            <a
              href={`/juku/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              サイトを見る
            </a>
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                hasChanges
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              保存
            </button>
            <button
              onClick={handleTogglePublish}
              disabled={saving}
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
