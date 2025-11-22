import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MUKIMUKI',
  description: '大学受験向け学習アプリ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50 text-black">{children}</body>
    </html>
  )
}
