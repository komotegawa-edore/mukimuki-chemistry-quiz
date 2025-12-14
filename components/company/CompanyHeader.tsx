'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const navItems = [
  { href: '#top', label: 'トップ' },
  { href: '#concept', label: 'コンセプト' },
  { href: '#services', label: 'サービス' },
  { href: '#profile', label: 'プロフィール' },
  { href: '#company', label: '会社概要' },
  { href: '#contact', label: 'お問い合わせ' },
]

export default function CompanyHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setIsMenuOpen(false)

    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    if (element) {
      const offset = 80 // ヘッダーの高さ分オフセット
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
        {/* ロゴ */}
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, '#top')}
          className="flex items-center gap-2"
        >
          <Image
            src="/edore-logo.png"
            alt="Edore"
            width={36}
            height={36}
            className={`rounded-lg transition-all ${isScrolled ? '' : 'brightness-0 invert'}`}
          />
          <span className={`text-2xl font-black transition-colors ${
            isScrolled ? 'text-[#3A405A]' : 'text-white'
          }`}>
            Edore
          </span>
        </a>

        {/* デスクトップメニュー */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`font-medium transition-colors hover:text-[#5DDFC3] ${
                isScrolled ? 'text-[#3A405A]' : 'text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* モバイルメニューボタン */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isScrolled
              ? 'text-[#3A405A] hover:bg-gray-100'
              : 'text-white hover:bg-white/10'
          }`}
          aria-label="メニュー"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* モバイルメニュー */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-xl transition-all duration-300 ${
          isMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="block text-[#3A405A] font-medium py-2 px-4 rounded-lg hover:bg-[#E0F7F1] hover:text-[#5DDFC3] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
