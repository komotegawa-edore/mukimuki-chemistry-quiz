import Link from 'next/link'
import Image from 'next/image'

export default function LPFooter() {
  return (
    <footer className="bg-[#3A405A] text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/Roopy.png"
              alt="Roopy"
              width={40}
              height={40}
              className="flex-shrink-0"
            />
            <div>
              <p className="font-semibold">Roopy（るーぴー）</p>
              <p className="text-xs text-gray-300">大学受験学習アプリ</p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="hover:text-[#5DDFC3] transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#5DDFC3] transition-colors"
            >
              利用規約
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-600 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Roopy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
