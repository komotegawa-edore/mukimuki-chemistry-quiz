'use client'

import { useEffect, useState } from 'react'
import { Gift, Save, Calendar, FileText, ToggleLeft, ToggleRight } from 'lucide-react'

interface CampaignSettings {
  referral_enabled: boolean
  referral_valid_until: string
  referral_campaign_title: string
  referral_campaign_description: string
}

export default function ReferralCampaignSettings() {
  const [settings, setSettings] = useState<CampaignSettings>({
    referral_enabled: false,
    referral_valid_until: '',
    referral_campaign_title: '',
    referral_campaign_description: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const keys = [
        'referral_enabled',
        'referral_valid_until',
        'referral_campaign_title',
        'referral_campaign_description'
      ]

      const responses = await Promise.all(
        keys.map(key => fetch(`/api/settings?key=${key}`))
      )

      const data = await Promise.all(responses.map(r => r.ok ? r.json() : null))

      const newSettings: CampaignSettings = {
        referral_enabled: false,
        referral_valid_until: '',
        referral_campaign_title: '',
        referral_campaign_description: '',
      }

      data.forEach((d, i) => {
        if (d?.settings?.setting_value) {
          const key = keys[i] as keyof CampaignSettings
          if (key === 'referral_enabled') {
            newSettings[key] = d.settings.setting_value === 'true'
          } else {
            newSettings[key] = d.settings.setting_value
          }
        }
      })

      setSettings(newSettings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const updates = [
        { setting_key: 'referral_enabled', setting_value: settings.referral_enabled.toString() },
        { setting_key: 'referral_valid_until', setting_value: settings.referral_valid_until },
        { setting_key: 'referral_campaign_title', setting_value: settings.referral_campaign_title },
        { setting_key: 'referral_campaign_description', setting_value: settings.referral_campaign_description },
      ]

      await Promise.all(
        updates.map(update =>
          fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update),
          })
        )
      )

      setMessage({ type: 'success', text: '保存しました' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: '保存に失敗しました' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Gift className="w-5 h-5 text-orange-500" />
          招待キャンペーン設定
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* 有効/無効 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">招待機能を有効にする</p>
            <p className="text-sm text-gray-500">無効にすると招待カードが非表示になります</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, referral_enabled: !settings.referral_enabled })}
            className={`p-2 rounded-lg transition-colors ${
              settings.referral_enabled ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {settings.referral_enabled ? (
              <ToggleRight className="w-8 h-8" />
            ) : (
              <ToggleLeft className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* キャンペーン期限 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            キャンペーン期限
          </label>
          <input
            type="date"
            value={settings.referral_valid_until}
            onChange={(e) => setSettings({ ...settings, referral_valid_until: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            この日付を過ぎると招待機能が自動的に非表示になります
          </p>
        </div>

        {/* キャンペーンタイトル */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            キャンペーンタイトル
          </label>
          <input
            type="text"
            value={settings.referral_campaign_title}
            onChange={(e) => setSettings({ ...settings, referral_campaign_title: e.target.value })}
            placeholder="例: 友達紹介でAmazonギフト券プレゼント！"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            カードの上部に目立つように表示されます
          </p>
        </div>

        {/* キャンペーン説明 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            キャンペーン説明
          </label>
          <textarea
            value={settings.referral_campaign_description}
            onChange={(e) => setSettings({ ...settings, referral_campaign_description: e.target.value })}
            placeholder="例: 友達を1人紹介するごとに抽選でAmazonギフト券500円分が当たる！"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            プレゼント企画の詳細などを記載してください
          </p>
        </div>

        {/* プレビュー */}
        {(settings.referral_campaign_title || settings.referral_campaign_description) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">プレビュー</p>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-sm">
              {settings.referral_campaign_title && (
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
                  <h3 className="text-lg font-bold text-white">{settings.referral_campaign_title}</h3>
                  {settings.referral_valid_until && (
                    <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(settings.referral_valid_until).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} まで
                      </span>
                    </div>
                  )}
                </div>
              )}
              {settings.referral_campaign_description && (
                <div className="p-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                    {settings.referral_campaign_description}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
