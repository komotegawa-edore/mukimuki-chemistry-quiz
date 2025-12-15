'use client'

import { useState, useEffect } from 'react'
import { JukuSection, JukuSite, SectionType, sectionTypeLabels, HeroContent, FeaturesContent, PricingContent, TeachersContent, ResultsContent, AccessContent, ContactContent, GalleryContent } from '../../juku/types'
import { ImageUploader, MultiImageUploader } from './ImageUploader'

interface Props {
  section: JukuSection
  site: JukuSite
  onUpdate: (content: any) => void
}

export function SectionEditor({ section, site, onUpdate }: Props) {
  const [content, setContent] = useState<any>(section.content)

  useEffect(() => {
    setContent(section.content)
  }, [section.id])

  const handleChange = (updates: Partial<typeof content>) => {
    const newContent = { ...content, ...updates }
    setContent(newContent)
    onUpdate(newContent)
  }

  const renderEditor = () => {
    switch (section.type as SectionType) {
      case 'hero':
        return <HeroEditor content={content as HeroContent} onChange={handleChange} primaryColor={site.primary_color} siteId={site.id} />
      case 'features':
        return <FeaturesEditor content={content as FeaturesContent} onChange={handleChange} />
      case 'pricing':
        return <PricingEditor content={content as PricingContent} onChange={handleChange} />
      case 'teachers':
        return <TeachersEditor content={content as TeachersContent} onChange={handleChange} siteId={site.id} />
      case 'results':
        return <ResultsEditor content={content as ResultsContent} onChange={handleChange} />
      case 'access':
        return <AccessEditor content={content as AccessContent} onChange={handleChange} />
      case 'contact':
        return <ContactEditor content={content as ContactContent} onChange={handleChange} />
      case 'gallery':
        return <GalleryEditor content={content as GalleryContent} onChange={handleChange} siteId={site.id} />
      default:
        return <div className="text-gray-500">このセクションの編集機能は準備中です</div>
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800">
          {sectionTypeLabels[section.type as SectionType]} を編集
        </h2>
      </div>
      <div className="p-6">
        {renderEditor()}
      </div>
    </div>
  )
}

// 共通の入力コンポーネント
function InputField({ label, value, onChange, multiline, placeholder }: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  placeholder?: string
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  )
}

// ヒーローエディタ
function HeroEditor({ content, onChange, primaryColor, siteId }: { content: HeroContent; onChange: (updates: Partial<HeroContent>) => void; primaryColor: string; siteId?: string }) {
  return (
    <div>
      <InputField
        label="メインタイトル"
        value={content.title}
        onChange={(title) => onChange({ title })}
        placeholder="地域で一番、生徒に寄り添う塾"
      />
      <InputField
        label="サブタイトル"
        value={content.subtitle}
        onChange={(subtitle) => onChange({ subtitle })}
        multiline
        placeholder="お子様の「わかった！」を大切にする個別指導"
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="ボタンテキスト"
          value={content.ctaText || ''}
          onChange={(ctaText) => onChange({ ctaText })}
          placeholder="無料体験を申し込む"
        />
        <InputField
          label="ボタンリンク"
          value={content.ctaLink || ''}
          onChange={(ctaLink) => onChange({ ctaLink })}
          placeholder="#contact"
        />
      </div>

      {/* 背景画像 */}
      {siteId && (
        <div className="mt-6">
          <ImageUploader
            siteId={siteId}
            label="背景画像（任意）"
            currentImage={content.backgroundImage}
            onUpload={(url) => onChange({ backgroundImage: url || undefined })}
            aspectRatio="video"
          />
          <p className="text-xs text-gray-500 mt-1">
            塾の外観や教室の写真を設定すると、より印象的なトップページになります
          </p>
        </div>
      )}

      {/* プレビュー */}
      <div
        className="mt-6 p-6 rounded-xl relative overflow-hidden"
        style={{
          backgroundColor: content.backgroundImage ? 'transparent' : `${primaryColor}10`,
          backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {content.backgroundImage && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div className="relative z-10">
          <p className="text-xs text-gray-500 mb-3">プレビュー</p>
          <h3 className={`text-2xl font-bold mb-2 ${content.backgroundImage ? 'text-white' : 'text-gray-800'}`}>
            {content.title || 'タイトルを入力'}
          </h3>
          <p className={`mb-4 ${content.backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}>
            {content.subtitle || 'サブタイトルを入力'}
          </p>
          {content.ctaText && (
            <span className="inline-block px-4 py-2 rounded-full text-white text-sm" style={{ backgroundColor: primaryColor }}>
              {content.ctaText}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// 特徴エディタ
function FeaturesEditor({ content, onChange }: { content: FeaturesContent; onChange: (updates: Partial<FeaturesContent>) => void }) {
  const iconOptions = [
    { value: 'teacher', label: '講師' },
    { value: 'book', label: '教科書' },
    { value: 'home', label: 'ホーム' },
    { value: 'chart', label: 'グラフ' },
    { value: 'clock', label: '時計' },
    { value: 'star', label: '星' },
    { value: 'heart', label: 'ハート' },
    { value: 'academic', label: '学術' },
  ]

  // itemsがundefinedの場合のガード
  const items = content.items || []

  const updateItem = (index: number, updates: Partial<FeaturesContent['items'][0]>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates }
    onChange({ items: newItems })
  }

  const addItem = () => {
    onChange({
      items: [...items, { icon: 'star', title: '', description: '' }]
    })
  }

  const removeItem = (index: number) => {
    onChange({
      items: items.filter((_, i) => i !== index)
    })
  }

  return (
    <div>
      <InputField
        label="セクションタイトル"
        value={content.title}
        onChange={(title) => onChange({ title })}
        placeholder="選ばれる3つの理由"
      />

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">特徴項目</label>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-500">項目 {index + 1}</span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">アイコン</label>
                  <select
                    value={item.icon}
                    onChange={(e) => updateItem(index, { icon: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">タイトル</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                    placeholder="完全個別指導"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">説明</label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg resize-none"
                  rows={2}
                  placeholder="一人ひとりの理解度に合わせた丁寧な指導"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          + 項目を追加
        </button>
      </div>
    </div>
  )
}

// 料金エディタ
function PricingEditor({ content, onChange }: { content: PricingContent; onChange: (updates: Partial<PricingContent>) => void }) {
  // plansがundefinedの場合のガード
  const plans = content.plans || []

  const updatePlan = (index: number, updates: Partial<PricingContent['plans'][0]>) => {
    const newPlans = [...plans]
    newPlans[index] = { ...newPlans[index], ...updates }
    onChange({ plans: newPlans })
  }

  const addPlan = () => {
    onChange({
      plans: [...plans, { name: '', target: '', price: '', period: '', features: [], isPopular: false }]
    })
  }

  const removePlan = (index: number) => {
    onChange({
      plans: plans.filter((_, i) => i !== index)
    })
  }

  return (
    <div>
      <InputField
        label="セクションタイトル"
        value={content.title}
        onChange={(title) => onChange({ title })}
        placeholder="料金・コース"
      />

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">コース一覧</label>
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">コース {index + 1}</span>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={plan.isPopular || false}
                      onChange={(e) => updatePlan(index, { isPopular: e.target.checked })}
                      className="rounded"
                    />
                    人気
                  </label>
                </div>
                {plans.length > 1 && (
                  <button
                    onClick={() => removePlan(index)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">コース名</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updatePlan(index, { name: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                    placeholder="中学生コース"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">対象</label>
                  <input
                    type="text"
                    value={plan.target}
                    onChange={(e) => updatePlan(index, { target: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                    placeholder="中1〜中3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">料金（数字のみ）</label>
                  <input
                    type="text"
                    value={plan.price}
                    onChange={(e) => updatePlan(index, { price: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">期間</label>
                  <input
                    type="text"
                    value={plan.period}
                    onChange={(e) => updatePlan(index, { period: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                    placeholder="月8回（週2回）"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">特徴（改行区切り）</label>
                <textarea
                  value={plan.features.join('\n')}
                  onChange={(e) => updatePlan(index, { features: e.target.value.split('\n').filter(f => f.trim()) })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg resize-none"
                  rows={3}
                  placeholder="5教科対応&#10;定期テスト対策&#10;高校受験対策"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addPlan}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          + コースを追加
        </button>
      </div>

      <div className="mt-4">
        <InputField
          label="注意書き"
          value={content.note || ''}
          onChange={(note) => onChange({ note })}
          placeholder="※料金は税込です。教材費は別途かかります。"
        />
      </div>
    </div>
  )
}

// 講師エディタ
function TeachersEditor({ content, onChange, siteId }: { content: TeachersContent; onChange: (updates: Partial<TeachersContent>) => void; siteId: string }) {
  // teachersがundefinedの場合のガード
  const teachers = content.teachers || []

  const updateTeacher = (index: number, updates: Partial<TeachersContent['teachers'][0]>) => {
    const newTeachers = [...teachers]
    newTeachers[index] = { ...newTeachers[index], ...updates }
    onChange({ teachers: newTeachers })
  }

  const addTeacher = () => {
    onChange({
      teachers: [...teachers, { name: '', role: '', subjects: [], message: '' }]
    })
  }

  const removeTeacher = (index: number) => {
    onChange({
      teachers: teachers.filter((_, i) => i !== index)
    })
  }

  return (
    <div>
      <InputField
        label="セクションタイトル"
        value={content.title}
        onChange={(title) => onChange({ title })}
        placeholder="講師紹介"
      />

      {/* レイアウト選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">レイアウト</label>
        <div className="flex gap-3">
          {[
            { value: 'grid', label: 'グリッド' },
            { value: 'carousel', label: 'カルーセル（横スライド）' },
          ].map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => onChange({ layout: layout.value as TeachersContent['layout'] })}
              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all text-sm ${
                (content.layout || 'grid') === layout.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {layout.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">講師一覧</label>
        <div className="space-y-4">
          {teachers.map((teacher, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-500">講師 {index + 1}</span>
                <button
                  onClick={() => removeTeacher(index)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  削除
                </button>
              </div>

              {/* 写真アップロード */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">写真</label>
                <ImageUploader
                  siteId={siteId}
                  currentImage={teacher.photo}
                  onUpload={(url) => updateTeacher(index, { photo: url || undefined })}
                  aspectRatio="square"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">名前</label>
                  <input
                    type="text"
                    value={teacher.name}
                    onChange={(e) => updateTeacher(index, { name: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">役職</label>
                  <input
                    type="text"
                    value={teacher.role}
                    onChange={(e) => updateTeacher(index, { role: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                    placeholder="塾長"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">担当科目（カンマ区切り）</label>
                <input
                  type="text"
                  value={teacher.subjects.join(', ')}
                  onChange={(e) => updateTeacher(index, { subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                  placeholder="数学, 理科, 英語"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">メッセージ</label>
                <textarea
                  value={teacher.message}
                  onChange={(e) => updateTeacher(index, { message: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg resize-none"
                  rows={2}
                  placeholder="「わかる」から「できる」まで、一緒に頑張りましょう！"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addTeacher}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          + 講師を追加
        </button>
      </div>
    </div>
  )
}

// 合格実績エディタ
function ResultsEditor({ content, onChange }: { content: ResultsContent; onChange: (updates: Partial<ResultsContent>) => void }) {
  // itemsがundefinedの場合のガード
  const items = content.items || []

  const updateItem = (index: number, updates: Partial<ResultsContent['items'][0]>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates }
    onChange({ items: newItems })
  }

  const addItem = () => {
    onChange({
      items: [...items, { year: new Date().getFullYear().toString(), school: '', count: 0 }]
    })
  }

  const removeItem = (index: number) => {
    onChange({
      items: items.filter((_, i) => i !== index)
    })
  }

  return (
    <div>
      <InputField
        label="セクションタイトル"
        value={content.title}
        onChange={(title) => onChange({ title })}
        placeholder="合格実績"
      />
      <InputField
        label="年度（サブタイトル）"
        value={content.subtitle || ''}
        onChange={(subtitle) => onChange({ subtitle })}
        placeholder="2024年度"
      />

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">合格校一覧</label>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={item.school}
                onChange={(e) => updateItem(index, { school: e.target.value })}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                placeholder="〇〇高校"
              />
              <input
                type="number"
                value={item.count}
                onChange={(e) => updateItem(index, { count: parseInt(e.target.value) || 0 })}
                className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center"
                placeholder="0"
              />
              <span className="text-sm text-gray-500">名</span>
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          + 学校を追加
        </button>
      </div>
    </div>
  )
}

// アクセスエディタ
function AccessEditor({ content, onChange }: { content: AccessContent; onChange: (updates: Partial<AccessContent>) => void }) {
  return (
    <div>
      <InputField
        label="セクションタイトル"
        value={content.title}
        onChange={(title) => onChange({ title })}
        placeholder="アクセス"
      />
      <InputField
        label="住所"
        value={content.address}
        onChange={(address) => onChange({ address })}
        placeholder="〒000-0000 東京都〇〇区〇〇1-2-3"
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="電話番号"
          value={content.phone}
          onChange={(phone) => onChange({ phone })}
          placeholder="03-0000-0000"
        />
        <InputField
          label="メールアドレス"
          value={content.email || ''}
          onChange={(email) => onChange({ email })}
          placeholder="info@example.com"
        />
      </div>
      <InputField
        label="営業時間"
        value={content.businessHours}
        onChange={(businessHours) => onChange({ businessHours })}
        multiline
        placeholder="平日 15:00〜22:00&#10;土曜 10:00〜18:00"
      />
      <InputField
        label="最寄り駅"
        value={content.nearestStation || ''}
        onChange={(nearestStation) => onChange({ nearestStation })}
        placeholder="〇〇駅より徒歩5分"
      />
      <InputField
        label="駐車場情報"
        value={content.parkingInfo || ''}
        onChange={(parkingInfo) => onChange({ parkingInfo })}
        placeholder="近隣にコインパーキングあり"
      />
      <InputField
        label="Google Map 埋め込みコード"
        value={content.mapEmbed || ''}
        onChange={(mapEmbed) => onChange({ mapEmbed })}
        multiline
        placeholder="<iframe src=&quot;...&quot;></iframe>"
      />
    </div>
  )
}

// お問い合わせエディタ
function ContactEditor({ content, onChange }: { content: ContactContent; onChange: (updates: Partial<ContactContent>) => void }) {
  // formFieldsがundefinedの場合のガード
  const formFields = content.formFields || []

  return (
    <div>
      <InputField
        label="セクションタイトル"
        value={content.title || ''}
        onChange={(title) => onChange({ title })}
        placeholder="お問い合わせ・無料体験"
      />
      <InputField
        label="サブタイトル"
        value={content.subtitle || ''}
        onChange={(subtitle) => onChange({ subtitle })}
        placeholder="まずはお気軽にご相談ください"
      />
      <InputField
        label="送信ボタンテキスト"
        value={content.submitText || ''}
        onChange={(submitText) => onChange({ submitText })}
        placeholder="送信する"
      />

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">表示するフォーム項目</label>
        <div className="space-y-2">
          {['name', 'email', 'phone', 'grade', 'message'].map((field) => {
            const labels: Record<string, string> = {
              name: 'お名前',
              email: 'メールアドレス',
              phone: '電話番号',
              grade: 'お子様の学年',
              message: 'お問い合わせ内容',
            }
            return (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formFields.includes(field as any)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange({ formFields: [...formFields, field as any] })
                    } else {
                      onChange({ formFields: formFields.filter(f => f !== field) })
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{labels[field]}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ギャラリーエディタ
function GalleryEditor({ content, onChange, siteId }: { content: GalleryContent; onChange: (updates: Partial<GalleryContent>) => void; siteId: string }) {
  return (
    <div>
      <InputField
        label="セクションタイトル"
        value={content.title}
        onChange={(title) => onChange({ title })}
        placeholder="塾内の様子"
      />
      <InputField
        label="サブタイトル"
        value={content.subtitle || ''}
        onChange={(subtitle) => onChange({ subtitle })}
        placeholder="明るく清潔な学習環境をご覧ください"
      />

      {/* レイアウト選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">レイアウト</label>
        <div className="flex gap-3">
          {[
            { value: 'grid', label: 'グリッド', icon: '▦' },
            { value: 'masonry', label: 'メイソンリー', icon: '▥' },
            { value: 'slider', label: 'スライダー', icon: '◂▸' },
          ].map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => onChange({ layout: layout.value as GalleryContent['layout'] })}
              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                content.layout === layout.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">{layout.icon}</div>
              <div className="text-sm">{layout.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 画像アップロード */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">画像</label>
        <MultiImageUploader
          siteId={siteId}
          images={content.images}
          onChange={(images) => onChange({ images })}
        />
        <p className="text-xs text-gray-500 mt-2">
          教室、自習室、ロビーなど塾内の写真をアップロードしてください（5MBまで/枚）
        </p>
      </div>
    </div>
  )
}
