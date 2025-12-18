'use client'

import { useState } from 'react'
import { JukuLPSection, JukuLP, LPSectionType, lpSectionTypeLabels } from '../../juku/types'
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react'

interface Props {
  section: JukuLPSection
  lp: JukuLP
  onUpdate: (content: Record<string, unknown>) => void
}

export function LPSectionEditor({ section, lp, onUpdate }: Props) {
  const content = section.content as unknown as Record<string, unknown>

  const renderTextInput = (key: string, label: string, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={(content[key] as string) || ''}
        onChange={(e) => onUpdate({ ...content, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )

  const renderTextarea = (key: string, label: string, rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={(content[key] as string) || ''}
        onChange={(e) => onUpdate({ ...content, [key]: e.target.value })}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800">
          {lpSectionTypeLabels[section.type as LPSectionType]}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          セクションの内容を編集
        </p>
      </div>

      {/* コンテンツ */}
      <div className="p-6 space-y-6">
        {/* 共通: タイトル・サブタイトル */}
        {content.title !== undefined && renderTextInput('title', 'タイトル')}
        {content.subtitle !== undefined && renderTextInput('subtitle', 'サブタイトル')}

        {/* ヒーローセクション */}
        {section.type === 'lp_hero' && (
          <>
            {renderTextInput('badge', 'バッジ', '残り10名')}
            {renderTextInput('ctaText', 'ボタンテキスト', '今すぐ申し込む')}
            {renderTextInput('ctaLink', 'ボタンリンク', '#contact')}
            {renderTextInput('backgroundImage', '背景画像URL')}
          </>
        )}

        {/* カウントダウン */}
        {section.type === 'countdown' && (
          <>
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
                  onUpdate({ ...content, targetDate: new Date(e.target.value).toISOString() })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {renderTextInput('expiredMessage', '終了後メッセージ', '受付終了しました')}
          </>
        )}

        {/* キャンペーン */}
        {section.type === 'campaign' && (
          <>
            {renderTextInput('deadline', '締切テキスト', '12/15(日)まで')}
            <CampaignItemsEditor
              items={(content.items as Array<{ icon: string; title: string; description: string; originalPrice?: string; campaignPrice?: string }>) || []}
              onUpdate={(items) => onUpdate({ ...content, items })}
            />
          </>
        )}

        {/* カリキュラム */}
        {section.type === 'curriculum' && (
          <>
            {renderTextInput('note', '注意書き')}
            {renderTextInput('sideImage', 'サイド画像URL')}
            <CurriculumDaysEditor
              days={(content.days as Array<{ date: string; time: string; content: string; target?: string }>) || []}
              onUpdate={(days) => onUpdate({ ...content, days })}
            />
          </>
        )}

        {/* 実績 */}
        {section.type === 'testimonials' && (
          <TestimonialsEditor
            items={(content.items as Array<{ name: string; photo?: string; text: string; result?: string; school?: string }>) || []}
            onUpdate={(items) => onUpdate({ ...content, items })}
          />
        )}

        {/* ビフォーアフター */}
        {section.type === 'before_after' && (
          <>
            {renderTextInput('backgroundImage', '背景画像URL')}
            <BeforeAfterEditor
              items={(content.items as Array<{ label: string; before: string; after: string; period?: string }>) || []}
              onUpdate={(items) => onUpdate({ ...content, items })}
            />
          </>
        )}

        {/* 料金 */}
        {section.type === 'lp_pricing' && (
          <>
            {renderTextInput('deadline', '締切テキスト', '早期割引: 12/15まで')}
            {renderTextInput('note', '注意書き')}
            <PricingPlansEditor
              plans={(content.plans as Array<{ name: string; target: string; originalPrice: string; price: string; features: string[]; isRecommended?: boolean; remainingSeats?: number }>) || []}
              onUpdate={(plans) => onUpdate({ ...content, plans })}
            />
          </>
        )}

        {/* FAQ */}
        {section.type === 'lp_faq' && (
          <FAQEditor
            items={(content.items as Array<{ question: string; answer: string }>) || []}
            onUpdate={(items) => onUpdate({ ...content, items })}
          />
        )}

        {/* CTA */}
        {section.type === 'lp_cta' && (
          <>
            {renderTextInput('buttonText', 'ボタンテキスト')}
            {renderTextInput('buttonLink', 'ボタンリンク', '#contact')}
            {renderTextInput('phone', '電話番号')}
            {renderTextInput('backgroundImage', '背景画像URL')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">スタイル</label>
              <select
                value={(content.style as string) || 'simple'}
                onChange={(e) => onUpdate({ ...content, style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="simple">シンプル</option>
                <option value="urgent">緊急感あり</option>
              </select>
            </div>
          </>
        )}

        {/* 申込フォーム */}
        {section.type === 'lp_contact' && (
          <>
            {renderTextInput('submitText', '送信ボタンテキスト')}
            {renderTextInput('successMessage', '送信完了メッセージ')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">コース選択肢</label>
              <textarea
                value={((content.courseOptions as string[]) || []).join('\n')}
                onChange={(e) => onUpdate({ ...content, courseOptions: e.target.value.split('\n').filter(Boolean) })}
                rows={3}
                placeholder="1行に1つずつ入力"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </>
        )}

        {/* ギャラリー */}
        {section.type === 'lp_gallery' && (
          <GalleryEditor
            images={(content.images as Array<{ url: string; caption?: string; category?: string }>) || []}
            onUpdate={(images) => onUpdate({ ...content, images })}
          />
        )}
      </div>
    </div>
  )
}

// キャンペーンアイテムエディター
function CampaignItemsEditor({
  items,
  onUpdate,
}: {
  items: Array<{ icon: string; title: string; description: string; originalPrice?: string; campaignPrice?: string }>
  onUpdate: (items: Array<{ icon: string; title: string; description: string; originalPrice?: string; campaignPrice?: string }>) => void
}) {
  const addItem = () => {
    onUpdate([...items, { icon: 'gift', title: '', description: '' }])
  }

  const updateItem = (index: number, updates: Partial<typeof items[0]>) => {
    onUpdate(items.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">キャンペーン特典</label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="特典タイトル"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              placeholder="説明"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={item.originalPrice || ''}
                onChange={(e) => updateItem(index, { originalPrice: e.target.value })}
                placeholder="通常価格"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                value={item.campaignPrice || ''}
                onChange={(e) => updateItem(index, { campaignPrice: e.target.value })}
                placeholder="キャンペーン価格"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" /> 特典を追加
        </button>
      </div>
    </div>
  )
}

// カリキュラム日程エディター
function CurriculumDaysEditor({
  days,
  onUpdate,
}: {
  days: Array<{ date: string; time: string; content: string; target?: string }>
  onUpdate: (days: Array<{ date: string; time: string; content: string; target?: string }>) => void
}) {
  const addDay = () => {
    onUpdate([...days, { date: '', time: '', content: '' }])
  }

  const updateDay = (index: number, updates: Partial<typeof days[0]>) => {
    onUpdate(days.map((day, i) => (i === index ? { ...day, ...updates } : day)))
  }

  const removeDay = (index: number) => {
    onUpdate(days.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">日程</label>
      <div className="space-y-3">
        {days.map((day, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={day.date}
                onChange={(e) => updateDay(index, { date: e.target.value })}
                placeholder="日付 (例: 12/26)"
                className="w-28 px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                value={day.time}
                onChange={(e) => updateDay(index, { time: e.target.value })}
                placeholder="時間 (例: 13:00-17:00)"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <button onClick={() => removeDay(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={day.content}
              onChange={(e) => updateDay(index, { content: e.target.value })}
              placeholder="内容"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <input
              type="text"
              value={day.target || ''}
              onChange={(e) => updateDay(index, { target: e.target.value })}
              placeholder="対象 (例: 中3生)"
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        ))}
        <button
          onClick={addDay}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" /> 日程を追加
        </button>
      </div>
    </div>
  )
}

// 実績エディター
function TestimonialsEditor({
  items,
  onUpdate,
}: {
  items: Array<{ name: string; photo?: string; text: string; result?: string; school?: string }>
  onUpdate: (items: Array<{ name: string; photo?: string; text: string; result?: string; school?: string }>) => void
}) {
  const addItem = () => {
    onUpdate([...items, { name: '', text: '' }])
  }

  const updateItem = (index: number, updates: Partial<typeof items[0]>) => {
    onUpdate(items.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">受講生の声</label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                placeholder="名前 (例: Aさん（中3）)"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={item.text}
              onChange={(e) => updateItem(index, { text: e.target.value })}
              placeholder="感想"
              rows={2}
              className="w-full px-2 py-1 border rounded text-sm resize-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={item.result || ''}
                onChange={(e) => updateItem(index, { result: e.target.value })}
                placeholder="結果 (例: 偏差値12UP)"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                value={item.school || ''}
                onChange={(e) => updateItem(index, { school: e.target.value })}
                placeholder="合格校"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
            </div>
            <input
              type="text"
              value={item.photo || ''}
              onChange={(e) => updateItem(index, { photo: e.target.value })}
              placeholder="写真URL"
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" /> 声を追加
        </button>
      </div>
    </div>
  )
}

// ビフォーアフターエディター
function BeforeAfterEditor({
  items,
  onUpdate,
}: {
  items: Array<{ label: string; before: string; after: string; period?: string }>
  onUpdate: (items: Array<{ label: string; before: string; after: string; period?: string }>) => void
}) {
  const addItem = () => {
    onUpdate([...items, { label: '', before: '', after: '' }])
  }

  const updateItem = (index: number, updates: Partial<typeof items[0]>) => {
    onUpdate(items.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">成績変化</label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                placeholder="項目 (例: 数学)"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={item.before}
                onChange={(e) => updateItem(index, { before: e.target.value })}
                placeholder="Before (例: 42点)"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                value={item.after}
                onChange={(e) => updateItem(index, { after: e.target.value })}
                placeholder="After (例: 78点)"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                value={item.period || ''}
                onChange={(e) => updateItem(index, { period: e.target.value })}
                placeholder="期間"
                className="w-24 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" /> 項目を追加
        </button>
      </div>
    </div>
  )
}

// 料金プランエディター
function PricingPlansEditor({
  plans,
  onUpdate,
}: {
  plans: Array<{ name: string; target: string; originalPrice: string; price: string; features: string[]; isRecommended?: boolean; remainingSeats?: number }>
  onUpdate: (plans: Array<{ name: string; target: string; originalPrice: string; price: string; features: string[]; isRecommended?: boolean; remainingSeats?: number }>) => void
}) {
  const addPlan = () => {
    onUpdate([...plans, { name: '', target: '', originalPrice: '', price: '', features: [] }])
  }

  const updatePlan = (index: number, updates: Partial<typeof plans[0]>) => {
    onUpdate(plans.map((plan, i) => (i === index ? { ...plan, ...updates } : plan)))
  }

  const removePlan = (index: number) => {
    onUpdate(plans.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">料金プラン</label>
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={plan.name}
                onChange={(e) => updatePlan(index, { name: e.target.value })}
                placeholder="プラン名"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={plan.isRecommended || false}
                  onChange={(e) => updatePlan(index, { isRecommended: e.target.checked })}
                />
                おすすめ
              </label>
              <button onClick={() => removePlan(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={plan.target}
              onChange={(e) => updatePlan(index, { target: e.target.value })}
              placeholder="対象 (例: 中学3年生)"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={plan.originalPrice}
                onChange={(e) => updatePlan(index, { originalPrice: e.target.value })}
                placeholder="通常価格"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                value={plan.price}
                onChange={(e) => updatePlan(index, { price: e.target.value })}
                placeholder="キャンペーン価格"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <input
                type="number"
                value={plan.remainingSeats || ''}
                onChange={(e) => updatePlan(index, { remainingSeats: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="残席"
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            </div>
            <textarea
              value={plan.features.join('\n')}
              onChange={(e) => updatePlan(index, { features: e.target.value.split('\n').filter(Boolean) })}
              placeholder="特徴（1行に1つ）"
              rows={3}
              className="w-full px-2 py-1 border rounded text-sm resize-none"
            />
          </div>
        ))}
        <button
          onClick={addPlan}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" /> プランを追加
        </button>
      </div>
    </div>
  )
}

// FAQエディター
function FAQEditor({
  items,
  onUpdate,
}: {
  items: Array<{ question: string; answer: string }>
  onUpdate: (items: Array<{ question: string; answer: string }>) => void
}) {
  const addItem = () => {
    onUpdate([...items, { question: '', answer: '' }])
  }

  const updateItem = (index: number, updates: Partial<typeof items[0]>) => {
    onUpdate(items.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">よくある質問</label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateItem(index, { question: e.target.value })}
                placeholder="質問"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(index, { answer: e.target.value })}
              placeholder="回答"
              rows={2}
              className="w-full px-2 py-1 border rounded text-sm resize-none"
            />
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" /> Q&Aを追加
        </button>
      </div>
    </div>
  )
}

// ギャラリーエディター
function GalleryEditor({
  images,
  onUpdate,
}: {
  images: Array<{ url: string; caption?: string; category?: string }>
  onUpdate: (images: Array<{ url: string; caption?: string; category?: string }>) => void
}) {
  const [newUrl, setNewUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const addImage = () => {
    if (!newUrl.trim()) return
    onUpdate([
      ...images,
      { url: newUrl.trim(), caption: newCaption.trim() || undefined, category: newCategory.trim() || undefined },
    ])
    setNewUrl('')
    setNewCaption('')
    setNewCategory('')
  }

  const removeImage = (index: number) => {
    onUpdate(images.filter((_, i) => i !== index))
  }

  const updateImage = (index: number, updates: Partial<typeof images[0]>) => {
    onUpdate(images.map((img, i) => (i === index ? { ...img, ...updates } : img)))
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) return
    const newImages = [...images]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
    onUpdate(newImages)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">塾の様子（写真）</label>

      {/* 既存画像 */}
      {images.length > 0 && (
        <div className="space-y-3 mb-4">
          {images.map((image, index) => (
            <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
              <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                <img src={image.url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={image.url}
                  onChange={(e) => updateImage(index, { url: e.target.value })}
                  placeholder="画像URL"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => updateImage(index, { caption: e.target.value })}
                    placeholder="キャプション"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="text"
                    value={image.category || ''}
                    onChange={(e) => updateImage(index, { category: e.target.value })}
                    placeholder="カテゴリ"
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => moveImage(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => removeImage(index)} className="p-1 hover:bg-red-100 rounded text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新規追加 */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <p className="text-sm font-medium text-blue-800">新しい画像を追加</p>
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="画像URL"
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="キャプション（任意）"
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="カテゴリ"
            className="w-28 px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <button
          onClick={addImage}
          disabled={!newUrl.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" /> 画像を追加
        </button>
      </div>
    </div>
  )
}
