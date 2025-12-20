'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Power, PowerOff, Loader2, AlertCircle } from 'lucide-react'

interface ServiceSetting {
  id: number
  service_key: string
  is_public: boolean
  maintenance_message: string | null
  updated_at: string
}

const SERVICES = [
  { key: 'roopy_english', name: 'Roopy English', description: '英語ニュースリスニングサービス' },
]

export default function ServiceSettings() {
  const [settings, setSettings] = useState<ServiceSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('service_settings')
      .select('*')

    if (!error && data) {
      setSettings(data)
      const msgMap: Record<string, string> = {}
      data.forEach(s => {
        msgMap[s.service_key] = s.maintenance_message || ''
      })
      setMessages(msgMap)
    }
    setLoading(false)
  }

  const toggleService = async (serviceKey: string, currentStatus: boolean) => {
    setUpdating(serviceKey)
    const supabase = createClient()

    const { error } = await supabase
      .from('service_settings')
      .update({
        is_public: !currentStatus,
        maintenance_message: messages[serviceKey] || null,
        updated_at: new Date().toISOString()
      })
      .eq('service_key', serviceKey)

    if (!error) {
      setSettings(prev => prev.map(s =>
        s.service_key === serviceKey
          ? { ...s, is_public: !currentStatus, maintenance_message: messages[serviceKey] || null }
          : s
      ))
    }
    setUpdating(null)
  }

  const updateMessage = async (serviceKey: string) => {
    setUpdating(serviceKey)
    const supabase = createClient()

    const { error } = await supabase
      .from('service_settings')
      .update({
        maintenance_message: messages[serviceKey] || null,
        updated_at: new Date().toISOString()
      })
      .eq('service_key', serviceKey)

    if (!error) {
      setSettings(prev => prev.map(s =>
        s.service_key === serviceKey
          ? { ...s, maintenance_message: messages[serviceKey] || null }
          : s
      ))
    }
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-500" />
        サービス公開設定
      </h3>

      <div className="space-y-4">
        {SERVICES.map(service => {
          const setting = settings.find(s => s.service_key === service.key)
          const isPublic = setting?.is_public ?? true
          const isUpdating = updating === service.key

          return (
            <div key={service.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-black">{service.name}</h4>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
                <button
                  onClick={() => toggleService(service.key, isPublic)}
                  disabled={isUpdating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isPublic
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPublic ? (
                    <Power className="w-4 h-4" />
                  ) : (
                    <PowerOff className="w-4 h-4" />
                  )}
                  {isPublic ? '公開中' : '非公開'}
                </button>
              </div>

              {!isPublic && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メンテナンスメッセージ
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={messages[service.key] || ''}
                      onChange={(e) => setMessages(prev => ({ ...prev, [service.key]: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-black resize-none"
                      rows={2}
                      placeholder="ユーザーに表示するメッセージを入力..."
                    />
                    <button
                      onClick={() => updateMessage(service.key)}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                    >
                      保存
                    </button>
                  </div>
                </div>
              )}

              {setting && (
                <p className="text-xs text-gray-400 mt-2">
                  最終更新: {new Date(setting.updated_at).toLocaleString('ja-JP')}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
