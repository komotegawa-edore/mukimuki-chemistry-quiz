'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Newspaper, Calendar, BookOpen } from 'lucide-react'

export default function EnglishBottomNav() {
  const pathname = usePathname()

  // 現在のタブを判定
  const getActiveTab = () => {
    if (pathname === '/english') return 'home'
    if (pathname?.startsWith('/english/news')) return 'news'
    return 'home'
  }

  const currentTab = getActiveTab()

  const navItems = [
    {
      id: 'home',
      href: '/english',
      icon: Home,
      label: 'ホーム',
    },
    {
      id: 'news',
      href: '/english/news',
      icon: Newspaper,
      label: 'ニュース',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 shadow-lg z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                  isActive
                    ? 'text-blue-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon
                  className="w-6 h-6 mb-1"
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
