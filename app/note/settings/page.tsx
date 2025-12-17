'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NoteHeader from '@/components/note/NoteHeader'
import NoteBottomNav from '@/components/note/NoteBottomNav'
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function NoteSettingsPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/note/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="flex items-center h-14 px-4">
          <Link href="/note/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-bold text-gray-800 ml-2">設定</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* アカウント */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
            アカウント
          </h2>
          <Link
            href="/note/profile/edit"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-800">プロフィール編集</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* 通知 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
            通知
          </h2>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="text-gray-800">プッシュ通知</span>
            </div>
            <span className="text-xs text-gray-400">準備中</span>
          </div>
        </div>

        {/* プライバシー */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
            プライバシー
          </h2>
          <Link
            href="/privacy"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-gray-800">プライバシーポリシー</span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-t"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-gray-800">利用規約</span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        {/* サポート */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
            サポート
          </h2>
          <a
            href="mailto:support@edore-edu.com"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-gray-500" />
              <span className="text-gray-800">お問い合わせ</span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>

        {/* バージョン */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-gray-500">バージョン</span>
            <span className="text-gray-400">1.0.0</span>
          </div>
        </div>

        {/* ログアウト */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          <span>{isLoggingOut ? 'ログアウト中...' : 'ログアウト'}</span>
        </button>
      </main>

      <NoteBottomNav />
    </div>
  )
}
