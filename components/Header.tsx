import Link from 'next/link'
import Image from 'next/image'

interface HeaderProps {
  title?: string
  showLogo?: boolean
  rightContent?: React.ReactNode
}

export default function Header({ title, showLogo = true, rightContent }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showLogo && (
            <Link href="/" className="flex items-center">
              <Image
                src="/Roopy-full-1.png"
                alt="Roopy"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          )}
          {title && (
            <h1 className="text-lg md:text-xl font-bold text-gray-700">
              {title}
            </h1>
          )}
        </div>
        {rightContent && (
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  )
}
