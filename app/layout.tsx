import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roopy（るーぴー）',
  description: '大学受験を"毎日つづけられる"ゲームにする',
  icons: {
    icon: '/Roopy-icon.png',
    apple: '/Roopy-icon.png',
  },
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
