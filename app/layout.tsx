import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '無機化学小テストアプリ',
  description: '大学受験向け無機化学知識確認アプリ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  )
}
