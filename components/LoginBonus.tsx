'use client'

import { useEffect, useState } from 'react'
import BadgeNotification from './BadgeNotification'
import { Coins, Flame, PartyPopper, X } from 'lucide-react'

interface Badge {
  badge_name: string
  badge_icon: string
  badge_description: string
}

export default function LoginBonus() {
  const [bonusAwarded, setBonusAwarded] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [newBadges, setNewBadges] = useState<Badge[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)

  useEffect(() => {
    const claimLoginBonus = async () => {
      try {
        const response = await fetch('/api/login-bonus', {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.awarded) {
            setBonusAwarded(true)
            setShowNotification(true)
            setNewBadges(data.newBadges || [])
            setCurrentStreak(data.streak?.current || 0)
            setIsNewRecord(data.streak?.isNewRecord || false)

            // 5秒後に通知を非表示
            setTimeout(() => {
              setShowNotification(false)
            }, 5000)
          }
        }
      } catch (error) {
        console.error('Failed to claim login bonus:', error)
      }
    }

    claimLoginBonus()
  }, [])

  if (!showNotification && newBadges.length === 0) {
    return null
  }

  return (
    <>
      <BadgeNotification badges={newBadges} />
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 border-2 border-white">
            <div className="flex-shrink-0 bg-white/20 p-2 rounded-full">
              <Coins className="w-8 h-8 animate-bounce text-[#FFD700]" />
            </div>
            <div>
              <p className="font-bold text-lg">ログインボーナス！</p>
              <p className="text-sm">+3pt 獲得しました</p>
              {currentStreak > 0 && (
                <p className="text-xs mt-1 opacity-90 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {currentStreak}日連続ログイン
                  {isNewRecord && (
                    <>
                      <PartyPopper className="w-3 h-3 ml-1" />
                      新記録！
                    </>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
