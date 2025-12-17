'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Target, BarChart3, User } from 'lucide-react'

const navItems = [
  { href: '/note', icon: Home, label: 'ホーム' },
  { href: '/note/diary', icon: BookOpen, label: '記録' },
  { href: '/note/goals', icon: Target, label: '目標' },
  { href: '/note/stats', icon: BarChart3, label: '統計' },
  { href: '/note/profile', icon: User, label: 'マイページ' },
]

export default function NoteBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/note' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-amber-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
