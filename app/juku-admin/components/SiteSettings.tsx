'use client'

import { useState } from 'react'
import { JukuSite } from '../../juku/types'
import { ImageUploader } from './ImageUploader'

interface Props {
  site: JukuSite
  onUpdate: (updates: Partial<JukuSite>) => void
}

const colorPresets = [
  { name: 'エメラルド', primary: '#10b981', secondary: '#f59e0b' },
  { name: 'ブルー', primary: '#3b82f6', secondary: '#f97316' },
  { name: 'パープル', primary: '#8b5cf6', secondary: '#ec4899' },
  { name: 'レッド', primary: '#ef4444', secondary: '#f59e0b' },
  { name: 'ティール', primary: '#14b8a6', secondary: '#f59e0b' },
  { name: 'インディゴ', primary: '#6366f1', secondary: '#f97316' },
]

export function SiteSettings({ site, onUpdate }: Props) {
  const [formData, setFormData] = useState({
    name: site.name,
    slug: site.slug,
    tagline: site.tagline || '',
    phone: site.phone || '',
    email: site.email || '',
    address: site.address || '',
    business_hours: site.business_hours || '',
    primary_color: site.primary_color,
    secondary_color: site.secondary_color,
    logo_url: site.logo_url || '',
    line_url: site.line_url || '',
    instagram_url: site.instagram_url || '',
    twitter_url: site.twitter_url || '',
    custom_domain: site.custom_domain || '',
  })

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value })
  }

  const handleSave = () => {
    onUpdate(formData)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm">
        {/* 基本情報 */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">基本情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">塾名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                URL（スラッグ）
                <span className="text-gray-400 font-normal ml-2">edore-edu.com/juku/{formData.slug}</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">キャッチコピー</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="お子様の「わかった！」を大切にする個別指導塾"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ロゴ */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">ロゴ</h3>
          <p className="text-sm text-gray-500 mb-4">ロゴ画像をアップロードすると、ヘッダーとfaviconに表示されます。</p>
          <ImageUploader
            siteId={site.id}
            currentImage={formData.logo_url}
            onUpload={(url) => handleChange('logo_url', url)}
            aspectRatio="free"
            label=""
          />
        </div>

        {/* 連絡先 */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">連絡先</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">電話番号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="03-0000-0000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="info@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">住所</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="〒000-0000 東京都〇〇区〇〇1-2-3"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">営業時間</label>
              <textarea
                value={formData.business_hours}
                onChange={(e) => handleChange('business_hours', e.target.value)}
                placeholder="平日 15:00〜22:00&#10;土曜 10:00〜18:00"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* テーマカラー */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">テーマカラー</h3>

          {/* プリセット */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">プリセット</label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    handleChange('primary_color', preset.primary)
                    handleChange('secondary_color', preset.secondary)
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    formData.primary_color === preset.primary
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="text-sm">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* カスタム */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">メインカラー</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">アクセントカラー</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* プレビュー */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-3">プレビュー</p>
            <div className="flex items-center gap-4">
              <button
                className="px-4 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: formData.primary_color }}
              >
                ボタン
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: formData.secondary_color }}
              >
                アクセント
              </button>
              <span
                className="text-sm font-medium"
                style={{ color: formData.primary_color }}
              >
                リンクテキスト
              </span>
            </div>
          </div>
        </div>

        {/* SNS */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">SNS</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">LINE URL</label>
              <input
                type="url"
                value={formData.line_url}
                onChange={(e) => handleChange('line_url', e.target.value)}
                placeholder="https://line.me/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram URL</label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">X (Twitter) URL</label>
              <input
                type="url"
                value={formData.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://x.com/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* カスタムドメイン */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">カスタムドメイン</h3>
          <p className="text-sm text-gray-500 mb-4">
            独自ドメインでサイトを公開できます。設定後、DNS設定が必要です。
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ドメイン名</label>
              <input
                type="text"
                value={formData.custom_domain}
                onChange={(e) => handleChange('custom_domain', e.target.value.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''))}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                「https://」や「www.」は不要です
              </p>
            </div>

            {formData.custom_domain && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  DNS設定が必要です
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  ドメイン管理画面で以下のレコードを追加してください：
                </p>
                <div className="bg-white rounded-lg p-3 font-mono text-sm">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-blue-100">
                    <span className="text-gray-500">タイプ</span>
                    <span className="font-bold">CNAME</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-blue-100">
                    <span className="text-gray-500">ホスト名</span>
                    <span className="font-bold">@</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">値</span>
                    <span className="font-bold text-blue-600">cname.vercel-dns.com</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  ※ 設定後、反映まで最大48時間かかる場合があります
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="p-6">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
          >
            設定を保存
          </button>
        </div>
      </div>
    </div>
  )
}
