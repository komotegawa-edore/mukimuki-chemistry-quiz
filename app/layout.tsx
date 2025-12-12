import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Roopy（るーぴー）| 大学受験学習アプリ',
    template: '%s | Roopy',
  },
  description: '大学受験を"毎日つづけられる"ゲームにする。無機化学・英単語・古文単語のクイズで毎日の学習をサポート。',
  metadataBase: new URL('https://edore-edu.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Roopy（るーぴー）| 大学受験学習アプリ',
    description: '大学受験を"毎日つづけられる"ゲームにする。無機化学・英単語・古文単語のクイズで毎日の学習をサポート。',
    url: 'https://edore-edu.com',
    siteName: 'Roopy',
    images: [
      {
        url: '/Roopy-full-1.png',
        width: 1200,
        height: 630,
        alt: 'Roopy - 大学受験学習アプリ',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roopy（るーぴー）| 大学受験学習アプリ',
    description: '大学受験を"毎日つづけられる"ゲームにする。大学受験学習アプリ。',
    images: ['/Roopy-full-1.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-96x96.png',
    apple: [
      { url: '/favicon-192x192.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    statusBarStyle: 'default',
    title: 'Roopy',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#5DDFC3',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50 text-black">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
