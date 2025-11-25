'use client'

import { useEffect, useState } from 'react'
import { Bell, AlertCircle, Calendar, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react'

interface Announcement {
  id: number
  title: string
  content: string
  priority: 'normal' | 'important' | 'urgent'
  valid_from: string
  valid_until: string | null
  created_at: string
}

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/announcements')

      if (!response.ok) {
        throw new Error('お知らせの取得に失敗しました')
      }

      const data = await response.json()
      const filteredAnnouncements: Announcement[] = data.announcements || []
      setAnnouncements(filteredAnnouncements)

      // 緊急・重要なお知らせは自動展開
      const autoExpandIds = new Set<number>(
        filteredAnnouncements
          .filter((a) => a.priority === 'urgent' || a.priority === 'important')
          .map((a) => a.id)
      )
      setExpandedIds(autoExpandIds)
    } catch (err) {
      console.error('Failed to fetch announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-100 text-red-800',
          badgeText: '緊急',
          BadgeIcon: AlertCircle
        }
      case 'important':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-900',
          iconColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          badgeText: '重要',
          BadgeIcon: AlertTriangle
        }
      default:
        return {
          bgColor: 'bg-white border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800',
          badgeText: 'お知らせ',
          BadgeIcon: Info
        }
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-[#E0F7F1]">
        <div className="flex items-center gap-2 text-[#3A405A]">
          <Bell className="h-5 w-5" />
          <span className="text-sm">読み込み中...</span>
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return null // お知らせがない場合は非表示
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[#3A405A]">
        <Bell className="h-5 w-5 text-[#5DDFC3]" />
        <h2 className="font-semibold text-lg">お知らせ</h2>
      </div>

      <div className="space-y-3">
        {announcements.map((announcement) => {
          const style = getPriorityStyle(announcement.priority)
          const isExpanded = expandedIds.has(announcement.id)

          return (
            <div
              key={announcement.id}
              className={`rounded-xl shadow-sm border-2 overflow-hidden transition-all ${style.bgColor}`}
            >
              <button
                onClick={() => toggleExpanded(announcement.id)}
                className="w-full p-4 text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${style.badgeColor}`}>
                        <style.BadgeIcon className="h-3 w-3" />
                        {style.badgeText}
                      </span>
                      {announcement.valid_until && (
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(announcement.valid_until).toLocaleDateString('ja-JP')}まで
                        </span>
                      )}
                    </div>
                    <h3 className={`font-semibold text-base ${style.textColor} truncate`}>
                      {announcement.title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className={`h-5 w-5 ${style.iconColor}`} />
                    ) : (
                      <ChevronDown className={`h-5 w-5 ${style.iconColor}`} />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className={`${style.textColor} text-sm whitespace-pre-wrap leading-relaxed`}>
                    {announcement.content}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
