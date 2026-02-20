'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export default function BlogHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-[#E0F7F1] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Roopy-icon.png"
            alt="Roopy"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="font-bold text-xl text-[#3A405A]">Roopy</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/blog"
            className="text-[#5DDFC3] font-medium"
          >
            ブログ
          </Link>
          <Link
            href="/login"
            className="text-[#3A405A] hover:text-[#5DDFC3] font-medium transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/signup?ref=blog"
            className="bg-[#5DDFC3] text-white px-6 py-2 rounded-full font-bold hover:bg-[#4ECFB3] transition-colors"
          >
            無料で始める
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-[#3A405A] hover:text-[#5DDFC3] transition-colors"
          aria-label="メニュー"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Menu */}
          <div className="md:hidden fixed top-[73px] left-0 right-0 bg-white shadow-lg z-50 px-4 py-4 space-y-4 animate-slide-in-up">
            <Link
              href="/blog"
              className="block text-[#5DDFC3] font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              ブログ
            </Link>
            <Link
              href="/login"
              className="block text-[#3A405A] hover:text-[#5DDFC3] font-medium py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ログイン
            </Link>
            <Link
              href="/signup?ref=blog"
              className="block bg-[#5DDFC3] text-white px-6 py-3 rounded-full font-bold text-center hover:bg-[#4ECFB3] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              無料で始める
            </Link>
          </div>
        </>
      )}
    </nav>
  )
}
