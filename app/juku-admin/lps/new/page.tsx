'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { lpTemplates, generateLPSectionsFromTemplate, LPTemplate } from '@/app/lp/templates'
import { LPType, lpTypeLabels } from '@/app/juku/types'

export default function NewLPPage() {
  const [step, setStep] = useState<'type' | 'template' | 'info'>('type')
  const [selectedType, setSelectedType] = useState<LPType | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<LPTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    juku_name: '',
    slug: '',
    phone: '',
    email: '',
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredTemplates = selectedType
    ? lpTemplates.filter((t) => t.lpType === selectedType)
    : lpTemplates

  const handleCreate = async () => {
    if (!selectedTemplate || !formData.name || !formData.juku_name || !formData.slug) {
      setError('必須項目を入力してください')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        router.push('/juku-admin/login')
        return
      }

      // slug重複チェック
      const { data: existing } = await supabase
        .from('juku_lps')
        .select('id')
        .eq('slug', formData.slug)
        .single()

      if (existing) {
        setError('このURLは既に使用されています')
        setCreating(false)
        return
      }

      // LP作成
      const { data: lp, error: lpError } = await supabase
        .from('juku_lps')
        .insert({
          slug: formData.slug,
          owner_id: user.user.id,
          lp_type: selectedTemplate.lpType,
          name: formData.name,
          juku_name: formData.juku_name,
          phone: formData.phone || null,
          email: formData.email || null,
          theme: 'default',
          primary_color: selectedTemplate.primaryColor,
          secondary_color: selectedTemplate.secondaryColor,
          accent_color: selectedTemplate.accentColor,
          is_published: false,
        })
        .select()
        .single()

      if (lpError) throw lpError

      // セクション作成
      const sections = generateLPSectionsFromTemplate(selectedTemplate)
      const sectionsWithLpId = sections.map((s) => ({
        ...s,
        lp_id: lp.id,
      }))

      const { error: sectionsError } = await supabase
        .from('juku_lp_sections')
        .insert(sectionsWithLpId)

      if (sectionsError) throw sectionsError

      router.push(`/juku-admin/lps/${lp.id}`)
    } catch (err) {
      console.error('Error creating LP:', err)
      setError('LPの作成に失敗しました')
      setCreating(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || `lp-${Date.now()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/juku-admin/lps" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">新規LP作成</h1>
        </div>
      </header>

      {/* ステップインジケーター */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {['type', 'template', 'info'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === s
                      ? 'bg-blue-600 text-white'
                      : ['type', 'template', 'info'].indexOf(step) > i
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {['type', 'template', 'info'].indexOf(step) > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {s === 'type' && 'タイプ選択'}
                  {s === 'template' && 'テンプレート'}
                  {s === 'info' && '基本情報'}
                </span>
                {i < 2 && <div className="w-8 h-px bg-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* メイン */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: タイプ選択 */}
        {step === 'type' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">LPのタイプを選択</h2>
            <p className="text-gray-600 mb-8">作成したいLPの種類を選んでください</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(lpTypeLabels) as LPType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type)
                    setStep('template')
                  }}
                  className={`p-6 rounded-xl border-2 text-left hover:border-blue-500 transition-colors ${
                    selectedType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{lpTypeLabels[type]}</h3>
                  <p className="text-sm text-gray-500">
                    {type === 'winter' && '冬休みの集中講座を告知'}
                    {type === 'summer' && '夏休みの講習会を告知'}
                    {type === 'spring' && '新学年準備講座を告知'}
                    {type === 'test_prep' && '定期テスト対策講座を告知'}
                    {type === 'enrollment' && '入塾キャンペーンを告知'}
                    {type === 'custom' && '自由にカスタマイズ'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: テンプレート選択 */}
        {step === 'template' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">テンプレートを選択</h2>
            <p className="text-gray-600 mb-8">デザインテンプレートを選んでください</p>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setFormData((prev) => ({
                      ...prev,
                      name: lpTypeLabels[template.lpType],
                    }))
                    setStep('info')
                  }}
                  className={`rounded-xl border-2 overflow-hidden text-left hover:border-blue-500 transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  }`}
                >
                  {/* プレビュー */}
                  <div
                    className="h-32"
                    style={{
                      background: `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.secondaryColor} 100%)`,
                    }}
                  />
                  <div className="p-4 bg-white">
                    <h3 className="font-bold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setStep('type')}
                className="text-blue-600 hover:underline"
              >
                ← タイプ選択に戻る
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 基本情報入力 */}
        {step === 'info' && selectedTemplate && (
          <div>
            <h2 className="text-2xl font-bold mb-2">基本情報を入力</h2>
            <p className="text-gray-600 mb-8">LPの基本情報を入力してください</p>

            <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
              {/* LP名 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  LP名（タイトル）<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (!formData.slug) {
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      }))
                    }
                  }}
                  placeholder="例: 冬期講習2024"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 塾名 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  塾名<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.juku_name}
                  onChange={(e) => setFormData({ ...formData, juku_name: e.target.value })}
                  placeholder="例: ○○学習塾"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  URL（スラッグ）<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">edore.jp/lp/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value.replace(/[^a-z0-9-]/g, '') })
                    }
                    placeholder="winter-2024"
                    className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">電話番号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="例: 03-0000-0000"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* メール */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  通知先メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="例: info@example.com"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  申込があった際の通知先です
                </p>
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
              )}

              {/* ボタン */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('template')}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  戻る
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      作成中...
                    </>
                  ) : (
                    'LPを作成'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
