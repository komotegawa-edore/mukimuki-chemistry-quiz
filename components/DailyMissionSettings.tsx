'use client'

import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'

export default function DailyMissionSettings() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings?key=daily_mission_enabled')
      if (response.ok) {
        const data = await response.json()
        setEnabled(data.settings.setting_value === 'true')
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setSaving(true)
    try {
      const newValue = !enabled
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: 'daily_mission_enabled',
          setting_value: newValue ? 'true' : 'false',
        }),
      })

      if (response.ok) {
        setEnabled(newValue)
      } else {
        alert('設定の更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
      alert('設定の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[#3A405A]">デイリーミッション機能</h3>
            <p className="text-sm text-[#3A405A] opacity-70">
              {enabled
                ? '生徒に毎日ランダムな章のミッションが表示されます'
                : 'デイリーミッションが無効になっています'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            enabled ? 'bg-[#5DDFC3]' : 'bg-gray-300'
          } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-[#3A405A] opacity-70 mb-1">制限時間</span>
              <span className="font-semibold text-[#3A405A]">5分</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#3A405A] opacity-70 mb-1">ボーナスポイント</span>
              <span className="font-semibold text-[#3A405A]">+3pt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#3A405A] opacity-70 mb-1">対象</span>
              <span className="font-semibold text-[#3A405A]">公開中の全章からランダム</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
