import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Roopy Korean | 韓国語リスニングクイズ',
    template: '%s | Roopy Korean',
  },
  description: '韓国語フレーズを聞いて日本語の意味を当てよう。楽しく韓国語リスニング力を鍛えるクイズアプリ。',
  metadataBase: new URL('https://korean.edore-edu.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Roopy Korean | 韓国語リスニングクイズ',
    description: '韓国語フレーズを聞いて日本語の意味を当てよう。楽しく韓国語リスニング力を鍛えるクイズアプリ。',
    url: 'https://korean.edore-edu.com',
    siteName: 'Roopy Korean',
    images: [
      {
        url: '/korean/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Roopy Korean',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roopy Korean | 韓国語リスニングクイズ',
    description: '韓国語フレーズを聞いて日本語の意味を当てよう',
    images: ['/korean/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/korean/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/korean/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/korean/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/korean/favicon-96x96.png',
    apple: [
      { url: '/korean/favicon-192x192.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/korean/manifest.json',
  appleWebApp: {
    statusBarStyle: 'default',
    title: 'Roopy Korean',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF6B9D',  // ピンク
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function KoreanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
