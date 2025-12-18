'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Layers,
  ExternalLink,
  Loader2,
  GripVertical,
  EyeOff,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  JukuLP,
  JukuLPSection,
  LPSectionType,
  lpSectionTypeLabels,
  defaultLPSectionContent,
} from '@/app/juku/types'

interface Props {
  params: Promise<{ lpId: string }>
}

export default function EditLPPage({ params }: Props) {
  const { lpId } = use(params)
  const [lp, setLp] = useState<JukuLP | null>(null)
  const [sections, setSections] = useState<JukuLPSection[]>([])
  const [activeTab, setActiveTab] = useState<'sections' | 'settings'>('sections')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchLP()
  }, [lpId])

  const fetchLP = async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      router.push('/juku-admin/login')
      return
    }

    const { data: lpData, error: lpError } = await supabase
      .from('juku_lps')
      .select('*')
      .eq('id', lpId)
      .eq('owner_id', user.user.id)
      .single()

    if (lpError || !lpData) {
      router.push('/juku-admin/lps')
      return
    }

    setLp(lpData)

    const { data: sectionsData } = await supabase
      .from('juku_lp_sections')
      .select('*')
      .eq('lp_id', lpId)
      .order('order_num')

    setSections(sectionsData || [])
  }

  const handleSave = async () => {
    if (!lp) return
    setSaving(true)

    try {
      // LP保存
      const { error: lpError } = await supabase
        .from('juku_lps')
        .update({
          name: lp.name,
          juku_name: lp.juku_name,
          phone: lp.phone,
          email: lp.email,
          primary_color: lp.primary_color,
          secondary_color: lp.secondary_color,
          accent_color: lp.accent_color,
          start_date: lp.start_date,
          end_date: lp.end_date,
          deadline_date: lp.deadline_date,
          is_published: lp.is_published,
        })
        .eq('id', lpId)

      if (lpError) throw lpError

      // セクション保存（一括更新）
      for (const section of sections) {
        const { error: secError } = await supabase
          .from('juku_lp_sections')
          .update({
            order_num: section.order_num,
            is_visible: section.is_visible,
            content: section.content,
          })
          .eq('id', section.id)

        if (secError) throw secError
      }

      setHasChanges(false)
    } catch (err) {
      console.error('Save error:', err)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const updateSection = (sectionId: string, updates: Partial<JukuLPSection>) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    )
    setHasChanges(true)
  }

  const updateSectionContent = (sectionId: string, contentUpdates: Record<string, unknown>) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, content: { ...s.content, ...contentUpdates } }
          : s
      )
    )
    setHasChanges(true)
  }

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((s) => s.id === sectionId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return
    }

    const newSections = [...sections]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[index],
    ]

    // order_numを更新
    newSections.forEach((s, i) => {
      s.order_num = i + 1
    })

    setSections(newSections)
    setHasChanges(true)
  }

  const addSection = async (type: LPSectionType) => {
    const { data, error } = await supabase
      .from('juku_lp_sections')
      .insert({
        lp_id: lpId,
        type,
        order_num: sections.length + 1,
        is_visible: true,
        content: defaultLPSectionContent[type],
      })
      .select()
      .single()

    if (!error && data) {
      setSections([...sections, data])
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('このセクションを削除しますか？')) return

    const { error } = await supabase
      .from('juku_lp_sections')
      .delete()
      .eq('id', sectionId)

    if (!error) {
      setSections(sections.filter((s) => s.id !== sectionId))
    }
  }

  if (!lp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/juku-admin/lps" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold">{lp.name}</h1>
              <p className="text-xs text-gray-500">{lp.juku_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/lp/${lp.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ExternalLink className="w-4 h-4" />
              プレビュー
            </a>

            <button
              onClick={() => {
                setLp({ ...lp, is_published: !lp.is_published })
                setHasChanges(true)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                lp.is_published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {lp.is_published ? (
                <>
                  <Eye className="w-4 h-4" />
                  公開中
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  非公開
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              保存
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-6 border-t">
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'sections'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <Layers className="w-4 h-4" />
              セクション
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <Settings className="w-4 h-4" />
              設定
            </button>
          </div>
        </div>
      </header>

      {/* メイン */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'sections' && (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`bg-white rounded-xl border overflow-hidden ${
                  !section.is_visible ? 'opacity-60' : ''
                }`}
              >
                {/* セクションヘッダー */}
                <div
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedSection(expandedSection === section.id ? null : section.id)
                  }
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="font-medium flex-1">
                    {lpSectionTypeLabels[section.type as LPSectionType]}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveSection(section.id, 'up')
                      }}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveSection(section.id, 'down')
                      }}
                      disabled={index === sections.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateSection(section.id, { is_visible: !section.is_visible })
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {section.is_visible ? (
                        <Eye className="w-4 h-4 text-gray-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSection(section.id)
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* セクション編集 */}
                {expandedSection === section.id && (
                  <div className="px-4 py-4 border-t bg-gray-50">
                    <SectionEditor
                      section={section}
                      onUpdate={(updates) => updateSectionContent(section.id, updates)}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* セクション追加 */}
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm font-medium text-gray-600 mb-3">セクションを追加</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(lpSectionTypeLabels) as LPSectionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {lpSectionTypeLabels[type]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-6 space-y-6">
            {/* 基本情報 */}
            <div>
              <h3 className="font-bold mb-4">基本情報</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LP名</label>
                  <input
                    type="text"
                    value={lp.name}
                    onChange={(e) => {
                      setLp({ ...lp, name: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">塾名</label>
                  <input
                    type="text"
                    value={lp.juku_name}
                    onChange={(e) => {
                      setLp({ ...lp, juku_name: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    value={lp.phone || ''}
                    onChange={(e) => {
                      setLp({ ...lp, phone: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    通知メール
                  </label>
                  <input
                    type="email"
                    value={lp.email || ''}
                    onChange={(e) => {
                      setLp({ ...lp, email: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* カラー設定 */}
            <div>
              <h3 className="font-bold mb-4">カラー設定</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メインカラー
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={lp.primary_color}
                      onChange={(e) => {
                        setLp({ ...lp, primary_color: e.target.value })
                        setHasChanges(true)
                      }}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={lp.primary_color}
                      onChange={(e) => {
                        setLp({ ...lp, primary_color: e.target.value })
                        setHasChanges(true)
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    サブカラー
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={lp.secondary_color}
                      onChange={(e) => {
                        setLp({ ...lp, secondary_color: e.target.value })
                        setHasChanges(true)
                      }}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={lp.secondary_color}
                      onChange={(e) => {
                        setLp({ ...lp, secondary_color: e.target.value })
                        setHasChanges(true)
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    アクセントカラー
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={lp.accent_color}
                      onChange={(e) => {
                        setLp({ ...lp, accent_color: e.target.value })
                        setHasChanges(true)
                      }}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={lp.accent_color}
                      onChange={(e) => {
                        setLp({ ...lp, accent_color: e.target.value })
                        setHasChanges(true)
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 期間設定 */}
            <div>
              <h3 className="font-bold mb-4">講習期間</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                  <input
                    type="date"
                    value={lp.start_date || ''}
                    onChange={(e) => {
                      setLp({ ...lp, start_date: e.target.value || null })
                      setHasChanges(true)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                  <input
                    type="date"
                    value={lp.end_date || ''}
                    onChange={(e) => {
                      setLp({ ...lp, end_date: e.target.value || null })
                      setHasChanges(true)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    申込締切日
                  </label>
                  <input
                    type="date"
                    value={lp.deadline_date || ''}
                    onChange={(e) => {
                      setLp({ ...lp, deadline_date: e.target.value || null })
                      setHasChanges(true)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* URL */}
            <div>
              <h3 className="font-bold mb-4">公開URL</h3>
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="text-gray-500">edore.jp/lp/</span>
                <span className="font-mono">{lp.slug}</span>
                <a
                  href={`/lp/${lp.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  開く
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// セクションエディター（簡易版）
function SectionEditor({
  section,
  onUpdate,
}: {
  section: JukuLPSection
  onUpdate: (updates: Record<string, unknown>) => void
}) {
  const content = section.content as unknown as Record<string, unknown>

  // 共通のテキスト入力
  const renderTextInput = (key: string, label: string, multiline = false) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={(content[key] as string) || ''}
          onChange={(e) => onUpdate({ [key]: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      ) : (
        <input
          type="text"
          value={(content[key] as string) || ''}
          onChange={(e) => onUpdate({ [key]: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* タイトル（ほぼ全セクションに共通） */}
      {content.title !== undefined && renderTextInput('title', 'タイトル')}
      {content.subtitle !== undefined && renderTextInput('subtitle', 'サブタイトル')}

      {/* セクション固有の編集UI */}
      {section.type === 'lp_hero' && (
        <>
          {renderTextInput('badge', 'バッジ（例: 残り10名）')}
          {renderTextInput('ctaText', 'ボタンテキスト')}
        </>
      )}

      {section.type === 'countdown' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">締切日時</label>
          <input
            type="datetime-local"
            value={
              content.targetDate
                ? new Date(content.targetDate as string).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) =>
              onUpdate({ targetDate: new Date(e.target.value).toISOString() })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      )}

      <p className="text-xs text-gray-500">
        ※詳細な編集機能は今後追加予定です
      </p>
    </div>
  )
}
