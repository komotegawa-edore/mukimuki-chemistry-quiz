'use client'

import { useEffect, useState } from 'react'

interface Badge {
  badge_name: string
  badge_icon: string
  badge_description: string
}

interface BadgeNotificationProps {
  badges: Badge[]
}

export default function BadgeNotification({ badges }: BadgeNotificationProps) {
  const [show, setShow] = useState(false)
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0)

  useEffect(() => {
    if (badges.length > 0) {
      setShow(true)
      const timer = setTimeout(() => {
        if (currentBadgeIndex < badges.length - 1) {
          setCurrentBadgeIndex(currentBadgeIndex + 1)
        } else {
          setShow(false)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [badges, currentBadgeIndex])

  if (!show || badges.length === 0) {
    return null
  }

  const currentBadge = badges[currentBadgeIndex]

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-2xl p-6 max-w-sm">
        <div className="flex items-center gap-4">
          <div className="text-6xl">{currentBadge.badge_icon}</div>
          <div className="text-white">
            <p className="font-bold text-lg mb-1">🎉 バッジ獲得！</p>
            <p className="text-xl font-bold">{currentBadge.badge_name}</p>
            <p className="text-sm opacity-90">{currentBadge.badge_description}</p>
            {badges.length > 1 && (
              <p className="text-xs opacity-75 mt-2">
                {currentBadgeIndex + 1} / {badges.length}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
