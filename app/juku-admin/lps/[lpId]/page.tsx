'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  JukuLP,
  JukuLPSection,
  LPSectionType,
  defaultLPSectionContent,
} from '@/app/juku/types'
import { LPSectionList } from '../../components/LPSectionList'
import { LPSectionEditor } from '../../components/LPSectionEditor'
import { LPSettings } from '../../components/LPSettings'
import { PreviewFrame } from '../../components/PreviewFrame'

type Tab = 'sections' | 'settings' | 'preview'

export default function EditLPPage() {
  const params = useParams()
  const lpId = params.lpId as string
  const [lp, setLp] = useState<JukuLP | null>(null)
  const [sections, setSections] = useState<JukuLPSection[]>([])
  const [selectedSection, setSelectedSection] = useState<JukuLPSection | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('sections')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [pendingLPChanges, setPendingLPChanges] = useState<Partial<JukuLP>>({})
  const [pendingSectionChanges, setPendingSectionChanges] = useState<Record<string, unknown>>({})

  const router = useRouter()
  const supabase = createClient()

  // データ読み込み
  useEffect(() => {
    loadData()
  }, [lpId])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/juku-admin/login')
      return
    }

    // LP取得
    const { data: lpData, error: lpError } = await supabase
      .from('juku_lps')
      .select('*')
      .eq('id', lpId)
      .eq('owner_id', user.id)
      .single()

    if (lpError || !lpData) {
      router.push('/juku-admin/lps')
      return
    }

    setLp(lpData as JukuLP)

    // セクション取得
    const { data: sectionsData } = await supabase
      .from('juku_lp_sections')
      .select('*')
      .eq('lp_id', lpId)
      .order('order_num', { ascending: true })

    setSections((sectionsData || []) as JukuLPSection[])
    setLoading(false)
  }

  // セクションの順序を更新（即座に保存）
  const handleReorder = async (newSections: JukuLPSection[]) => {
    setSections(newSections)

    for (let i = 0; i < newSections.length; i++) {
      await supabase
        .from('juku_lp_sections')
        .update({ order_num: i + 1 })
        .eq('id', newSections[i].id)
    }
  }

  // セクションを追加
  const handleAddSection = async (type: LPSectionType) => {
    if (!lp) return

    const maxOrder = Math.max(...sections.map(s => s.order_num), 0)

    const { data: newSection } = await supabase
      .from('juku_lp_sections')
      .insert({
        lp_id: lp.id,
        type,
        order_num: maxOrder + 1,
        is_visible: true,
        content: defaultLPSectionContent[type],
      })
      .select()
      .single()

    if (newSection) {
      setSections([...sections, newSection as JukuLPSection])
    }
  }

  // セクションを削除
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('このセクションを削除しますか？')) return

    await supabase.from('juku_lp_sections').delete().eq('id', sectionId)
    setSections(sections.filter(s => s.id !== sectionId))
    setSelectedSection(null)

    const newPendingChanges = { ...pendingSectionChanges }
    delete newPendingChanges[sectionId]
    setPendingSectionChanges(newPendingChanges)
  }

  // セクションの表示/非表示を切り替え（即座に保存）
  const handleToggleVisibility = async (section: JukuLPSection) => {
    const newVisibility = !section.is_visible

    await supabase
      .from('juku_lp_sections')
      .update({ is_visible: newVisibility })
      .eq('id', section.id)

    setSections(sections.map(s =>
      s.id === section.id ? { ...s, is_visible: newVisibility } : s
    ))
  }

  // セクションのコンテンツを変更（保留）
  const handleUpdateSection = (sectionId: string, content: Record<string, unknown>) => {
    setPendingSectionChanges({
      ...pendingSectionChanges,
      [sectionId]: content,
    })

    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, content: content as unknown as JukuLPSection['content'] } : s
    ))

    if (selectedSection?.id === sectionId) {
      setSelectedSection({ ...selectedSection, content: content as unknown as JukuLPSection['content'] })
    }

    setHasChanges(true)
  }

  // LP設定を変更（保留）
  const handleUpdateLP = (updates: Partial<JukuLP>) => {
    setPendingLPChanges({
      ...pendingLPChanges,
      ...updates,
    })

    if (lp) {
      setLp({ ...lp, ...updates })
    }

    setHasChanges(true)
  }

  // すべての変更を保存
  const handleSaveAll = async () => {
    if (!lp) return
    setSaving(true)

    try {
      // LP設定を保存
      if (Object.keys(pendingLPChanges).length > 0) {
        await supabase
          .from('juku_lps')
          .update({
            ...pendingLPChanges,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lp.id)
      }

      // セクションの変更を保存
      for (const [sectionId, content] of Object.entries(pendingSectionChanges)) {
        await supabase
          .from('juku_lp_sections')
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sectionId)
      }

      setPendingLPChanges({})
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
    if (!lp) return
    setSaving(true)

    const newPublished = !lp.is_published

    await supabase
      .from('juku_lps')
      .update({
        is_published: newPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lp.id)

    setLp({ ...lp, is_published: newPublished })
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!lp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">LPが見つかりません</div>
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
              href="/juku-admin/lps"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {lp.name}
              </h1>
              <p className="text-xs text-gray-500">
                edore-edu.com/lp/{lp.slug}
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
            <a
              href={`/lp/${lp.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              LPを見る
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
                lp.is_published
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lp.is_published ? '公開中' : '非公開'}
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'sections', label: 'セクション' },
              { id: 'settings', label: 'LP設定' },
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
              <LPSectionList
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
                <LPSectionEditor
                  section={selectedSection}
                  lp={lp}
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
          <LPSettings lp={lp} onUpdate={handleUpdateLP} />
        )}

        {activeTab === 'preview' && (
          <PreviewFrame slug={`lp/${lp.slug}`} />
        )}
      </main>
    </div>
  )
}
