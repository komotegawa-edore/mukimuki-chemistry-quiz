'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Download, Share } from 'lucide-react'

export default function EnglishInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // インストール済みまたは非表示設定の場合は表示しない
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    const isDismissed = localStorage.getItem('englishInstallPromptDismissed')

    if (isInstalled || isDismissed) {
      return
    }

    // iOS判定
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iOS = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(iOS)

    if (iOS) {
      // iOSの場合は手動インストール案内を表示
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // 3秒後に表示
      return () => clearTimeout(timer)
    }

    // Android等のbeforeinstallpromptイベント
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('englishInstallPromptDismissed', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 animate-slide-in-up">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#4FC3F7] p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-[#3A405A] opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <Image
            src="/english/favicon-192x192.png"
            alt="Roopy English"
            width={48}
            height={48}
            className="rounded-lg flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="font-bold text-[#3A405A] mb-1">
              Roopy Englishをアプリとして使おう！
            </h3>
            {isIOS ? (
              <>
                <p className="text-sm text-[#3A405A] opacity-70 mb-3">
                  ホーム画面に追加すると、毎朝のリスニングが習慣に
                </p>
                <div className="bg-[#E0F7FA] rounded-lg p-3 text-xs text-[#3A405A] space-y-2">
                  <div className="flex items-center gap-2">
                    <Share className="w-4 h-4 text-[#4FC3F7]" />
                    <span>1. 画面下部の「共有」ボタンをタップ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#4FC3F7]" />
                    <span>2. 「ホーム画面に追加」を選択</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-[#3A405A] opacity-70 mb-3">
                  ホーム画面に追加して、毎朝の英語習慣を
                </p>
                <button
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-[#4FC3F7] to-[#29B6F6] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  インストール
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
