'use client'

import { JukuLP } from '../../juku/types'

interface Props {
  lp: JukuLP
  onUpdate: (updates: Partial<JukuLP>) => void
}

export function LPSettings({ lp, onUpdate }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* 基本情報 */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">基本情報</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LP名</label>
            <input
              type="text"
              value={lp.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">塾名</label>
            <input
              type="text"
              value={lp.juku_name}
              onChange={(e) => onUpdate({ juku_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
            <input
              type="tel"
              value={lp.phone || ''}
              onChange={(e) => onUpdate({ phone: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">通知メール</label>
            <input
              type="email"
              value={lp.email || ''}
              onChange={(e) => onUpdate({ email: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* カラー設定 */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">カラー設定</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メインカラー</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lp.primary_color}
                onChange={(e) => onUpdate({ primary_color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={lp.primary_color}
                onChange={(e) => onUpdate({ primary_color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">サブカラー</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lp.secondary_color}
                onChange={(e) => onUpdate({ secondary_color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={lp.secondary_color}
                onChange={(e) => onUpdate({ secondary_color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">アクセントカラー</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lp.accent_color}
                onChange={(e) => onUpdate({ accent_color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={lp.accent_color}
                onChange={(e) => onUpdate({ accent_color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 期間設定 */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">講習期間</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
            <input
              type="date"
              value={lp.start_date || ''}
              onChange={(e) => onUpdate({ start_date: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
            <input
              type="date"
              value={lp.end_date || ''}
              onChange={(e) => onUpdate({ end_date: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">申込締切日</label>
            <input
              type="date"
              value={lp.deadline_date || ''}
              onChange={(e) => onUpdate({ deadline_date: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 公開URL */}
      <div className="p-6">
        <h3 className="font-bold text-gray-800 mb-4">公開URL</h3>
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <span className="text-gray-500">edore-edu.com/lp/</span>
          <span className="font-mono font-medium">{lp.slug}</span>
          <a
            href={`/lp/${lp.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-blue-600 hover:underline flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            開く
          </a>
        </div>
      </div>
    </div>
  )
}
