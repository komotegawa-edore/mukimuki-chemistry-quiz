'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User, Menu, X } from 'lucide-react'

interface EnglishHeaderProps {
  showLogout?: boolean
}

export default function EnglishHeader({ showLogout = true }: EnglishHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/english/login')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/english" className="flex items-center gap-2">
          <Image
            src="/english/favicon-48x48.png"
            alt="Roopy English"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-gray-800">Roopy English</span>
        </Link>

        {showLogout && (
          <>
            {/* Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/english/account"
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
              >
                <User className="w-4 h-4" />
                アカウント
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg font-medium disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? 'ログアウト中...' : 'ログアウト'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && showLogout && (
        <div className="sm:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-2 space-y-1">
            <Link
              href="/english/account"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              アカウント
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full text-left disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
