'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, Search, BookOpen, Image as ImageIcon } from 'lucide-react'

interface EnglishMaterial {
  id: number
  stage_id: string
  stage_name: string
  material_name: string
  material_category: string
  chapter_range: string | null
  chapter_name: string | null
  recommended_days: number | null
  standard_minutes_per_chapter: number | null
  total_chapters: number | null
  difficulty_level: string | null
  recommended_cycles: number | null
  notes: string | null
  image_url: string | null
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

const DIFFICULTY_OPTIONS = [
  '初級',
  '初級〜中級',
  '中級',
  '中級〜上級',
  '上級',
  '最上級',
  '最難関',
]

const CATEGORY_OPTIONS = [
  '英単語',
  '英熟語',
  '文法',
  '文法演習',
  '解釈',
  '英文解釈',
  '長文',
  '英作文',
  'リスニング',
]

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<EnglishMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStage, setSelectedStage] = useState<string>('')
  const [editingMaterial, setEditingMaterial] = useState<EnglishMaterial | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  const fetchMaterials = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('mukimuki_english_materials')
      .select('*')
      .order('display_order')

    if (error) {
      console.error('Error fetching materials:', error)
    } else {
      setMaterials(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  // フィルタリング
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      searchQuery === '' ||
      m.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.stage_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === '' || m.material_category === selectedCategory
    const matchesStage = selectedStage === '' || m.stage_id === selectedStage
    return matchesSearch && matchesCategory && matchesStage
  })

  // ステージ一覧を取得
  const stages = Array.from(new Set(materials.map((m) => m.stage_id))).sort()

  // 保存処理
  const handleSave = async (formData: FormData) => {
    setIsSaving(true)

    const data: Record<string, unknown> = {
      stage_id: formData.get('stage_id'),
      stage_name: formData.get('stage_name'),
      material_name: formData.get('material_name'),
      material_category: formData.get('material_category'),
      chapter_range: formData.get('chapter_range') || null,
      chapter_name: formData.get('chapter_name') || null,
      recommended_days: formData.get('recommended_days')
        ? parseInt(formData.get('recommended_days') as string)
        : null,
      standard_minutes_per_chapter: formData.get('standard_minutes_per_chapter')
        ? parseInt(formData.get('standard_minutes_per_chapter') as string)
        : null,
      total_chapters: formData.get('total_chapters')
        ? parseInt(formData.get('total_chapters') as string)
        : null,
      difficulty_level: formData.get('difficulty_level') || null,
      recommended_cycles: formData.get('recommended_cycles')
        ? parseInt(formData.get('recommended_cycles') as string)
        : 1,
      notes: formData.get('notes') || null,
      image_url: formData.get('image_url') || null,
      is_published: formData.get('is_published') === 'on',
    }

    if (editingMaterial) {
      // 更新
      const { error } = await supabase
        .from('mukimuki_english_materials')
        .update(data)
        .eq('id', editingMaterial.id)

      if (error) {
        alert('更新に失敗しました: ' + error.message)
      } else {
        setShowForm(false)
        setEditingMaterial(null)
        fetchMaterials()
      }
    } else {
      // 新規作成
      const maxOrder = Math.max(...materials.map((m) => m.display_order), 0)
      data.display_order = maxOrder + 1

      const { error } = await supabase.from('mukimuki_english_materials').insert(data)

      if (error) {
        alert('作成に失敗しました: ' + error.message)
      } else {
        setShowForm(false)
        fetchMaterials()
      }
    }

    setIsSaving(false)
  }

  // 削除処理
  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return

    const { error } = await supabase.from('mukimuki_english_materials').delete().eq('id', id)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      fetchMaterials()
    }
  }

  // 難易度の色
  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case '初級':
        return 'bg-green-100 text-green-800'
      case '初級〜中級':
        return 'bg-teal-100 text-teal-800'
      case '中級':
        return 'bg-blue-100 text-blue-800'
      case '中級〜上級':
        return 'bg-indigo-100 text-indigo-800'
      case '上級':
        return 'bg-purple-100 text-purple-800'
      case '最上級':
        return 'bg-orange-100 text-orange-800'
      case '最難関':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="参考書管理" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 戻るリンク */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-5 h-5" />
            ダッシュボードに戻る
          </Link>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="教材名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">全カテゴリ</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">全ステージ</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setEditingMaterial(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              新規追加
            </button>
          </div>
        </div>

        {/* 教材一覧 */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">画像</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      ステージ
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      教材名
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      カテゴリ
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      難易度
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      推奨日数
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      公開
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {material.image_url ? (
                          <img
                            src={material.image_url}
                            alt={material.material_name}
                            className="w-12 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                          {material.stage_id}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{material.stage_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-black">{material.material_name}</div>
                        {material.notes && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {material.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{material.material_category}</td>
                      <td className="px-4 py-3">
                        {material.difficulty_level && (
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                              material.difficulty_level
                            )}`}
                          >
                            {material.difficulty_level}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {material.recommended_days === -1
                          ? '常時'
                          : material.recommended_days
                          ? `${material.recommended_days}日`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            material.is_published ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingMaterial(material)
                              setShowForm(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(material.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMaterials.length === 0 && (
              <div className="text-center py-8 text-gray-500">該当する教材がありません</div>
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          {filteredMaterials.length} / {materials.length} 件表示
        </div>
      </main>

      {/* 編集モーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-black mb-6">
                {editingMaterial ? '教材を編集' : '新規教材を追加'}
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave(new FormData(e.currentTarget))
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ステージID *
                    </label>
                    <input
                      name="stage_id"
                      type="text"
                      required
                      defaultValue={editingMaterial?.stage_id}
                      placeholder="E1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ステージ名 *
                    </label>
                    <input
                      name="stage_name"
                      type="text"
                      required
                      defaultValue={editingMaterial?.stage_name}
                      placeholder="英単語基礎"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">教材名 *</label>
                    <input
                      name="material_name"
                      type="text"
                      required
                      defaultValue={editingMaterial?.material_name}
                      placeholder="システム英単語"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      カテゴリ *
                    </label>
                    <select
                      name="material_category"
                      required
                      defaultValue={editingMaterial?.material_category}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="">選択してください</option>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">難易度</label>
                    <select
                      name="difficulty_level"
                      defaultValue={editingMaterial?.difficulty_level || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="">選択してください</option>
                      {DIFFICULTY_OPTIONS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">章範囲</label>
                    <input
                      name="chapter_range"
                      type="text"
                      defaultValue={editingMaterial?.chapter_range || ''}
                      placeholder="1-30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">章名</label>
                    <input
                      name="chapter_name"
                      type="text"
                      defaultValue={editingMaterial?.chapter_name || ''}
                      placeholder="各章"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      推奨日数 (-1=常時)
                    </label>
                    <input
                      name="recommended_days"
                      type="number"
                      defaultValue={editingMaterial?.recommended_days || ''}
                      placeholder="14"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      標準時間/章（分）
                    </label>
                    <input
                      name="standard_minutes_per_chapter"
                      type="number"
                      defaultValue={editingMaterial?.standard_minutes_per_chapter || ''}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">総章数</label>
                    <input
                      name="total_chapters"
                      type="number"
                      defaultValue={editingMaterial?.total_chapters || ''}
                      placeholder="25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">推奨周回数</label>
                    <input
                      name="recommended_cycles"
                      type="number"
                      defaultValue={editingMaterial?.recommended_cycles || 1}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">画像URL</label>
                    <input
                      name="image_url"
                      type="url"
                      defaultValue={editingMaterial?.image_url || ''}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                    <textarea
                      name="notes"
                      rows={2}
                      defaultValue={editingMaterial?.notes || ''}
                      placeholder="教材についてのメモ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        name="is_published"
                        type="checkbox"
                        defaultChecked={editingMaterial?.is_published ?? true}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">公開する</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingMaterial(null)
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
