'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function EnglishFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <Image
              src="/english/favicon-48x48.png"
              alt="Roopy English"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold">Roopy English</span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/english/terms"
              className="text-gray-400 hover:text-white transition-colors"
            >
              利用規約
            </Link>
            <Link
              href="/english/privacy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/english/legal"
              className="text-gray-400 hover:text-white transition-colors"
            >
              特定商取引法に基づく表記
            </Link>
            <a
              href="mailto:k.omotegawa@edore-edu.com"
              className="text-gray-400 hover:text-white transition-colors"
            >
              お問い合わせ
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Edore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
