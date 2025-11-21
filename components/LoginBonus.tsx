'use client'

import { useEffect, useState } from 'react'

export default function LoginBonus() {
  const [bonusAwarded, setBonusAwarded] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

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

  if (!showNotification) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-8 h-8 animate-bounce"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p className="font-bold text-lg">ログインボーナス！</p>
          <p className="text-sm">+3pt 獲得しました</p>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="ml-2 text-white hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
