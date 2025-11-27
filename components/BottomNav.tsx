'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, BookOpen } from 'lucide-react'

interface BottomNavProps {
  activeTab?: 'home' | 'quest' | 'drill'
  onTabChange?: (tab: 'home' | 'quest') => void
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const pathname = usePathname()

  // パスから現在のタブを判定
  const currentTab = activeTab || (pathname?.startsWith('/drill') ? 'drill' : 'home')
  const isDrillPage = pathname?.startsWith('/drill')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0F7F1] shadow-lg z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around">
          {/* ホームタブ */}
          {isDrillPage ? (
            <Link
              href="/"
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                currentTab === 'home'
                  ? 'text-[#5DDFC3]'
                  : 'text-[#3A405A] opacity-50 hover:opacity-70'
              }`}
            >
              <Home
                className="w-6 h-6 mb-1"
                fill={currentTab === 'home' ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">ホーム</span>
            </Link>
          ) : (
            <button
              onClick={() => onTabChange?.('home')}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                currentTab === 'home'
                  ? 'text-[#5DDFC3]'
                  : 'text-[#3A405A] opacity-50 hover:opacity-70'
              }`}
            >
              <Home
                className="w-6 h-6 mb-1"
                fill={currentTab === 'home' ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">ホーム</span>
            </button>
          )}

          {/* クエストタブ */}
          {isDrillPage ? (
            <Link
              href="/"
              className="flex-1 flex flex-col items-center py-3 transition-colors text-[#3A405A] opacity-50 hover:opacity-70"
            >
              <Target className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">クエスト</span>
            </Link>
          ) : (
            <button
              onClick={() => onTabChange?.('quest')}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                currentTab === 'quest'
                  ? 'text-[#5DDFC3]'
                  : 'text-[#3A405A] opacity-50 hover:opacity-70'
              }`}
            >
              <Target
                className="w-6 h-6 mb-1"
                fill={currentTab === 'quest' ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">クエスト</span>
            </button>
          )}

          {/* ドリルタブ */}
          <Link
            href="/drill"
            className={`flex-1 flex flex-col items-center py-3 transition-colors ${
              currentTab === 'drill'
                ? 'text-[#5DDFC3]'
                : 'text-[#3A405A] opacity-50 hover:opacity-70'
            }`}
          >
            <BookOpen
              className="w-6 h-6 mb-1"
              fill={currentTab === 'drill' ? 'currentColor' : 'none'}
            />
            <span className="text-xs font-medium">ドリル</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
