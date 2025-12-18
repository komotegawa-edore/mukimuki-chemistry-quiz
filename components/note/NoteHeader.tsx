'use client'

import Link from 'next/link'
import { PenLine, Bell, Settings } from 'lucide-react'

interface NoteHeaderProps {
  title?: string
  showBack?: boolean
}

export default function NoteHeader({ title }: NoteHeaderProps) {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/note" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-lg">
            <PenLine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-800">
            {title || 'RoopyNote'}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <Link href="/note/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>
    </header>
  )
}
