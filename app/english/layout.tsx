import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Roopy English | 英語ニュースリスニング',
    template: '%s | Roopy English',
  },
  description: '毎朝の英語ニュースでリスニング力を鍛える。AIが生成した最新ニュースで、自然な英語を毎日聴こう。',
  metadataBase: new URL('https://edore-edu.com'),
  alternates: {
    canonical: '/english',
  },
  openGraph: {
    title: 'Roopy English | 英語ニュースリスニング',
    description: '毎朝の英語ニュースでリスニング力を鍛える。AIが生成した最新ニュースで、自然な英語を毎日聴こう。',
    url: 'https://edore-edu.com/english',
    siteName: 'Roopy English',
    images: [
      {
        url: '/english/favicon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Roopy English',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Roopy English | 英語ニュースリスニング',
    description: '毎朝の英語ニュースでリスニング力を鍛える',
    images: ['/english/favicon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/english/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/english/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/english/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/english/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/english/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/english/favicon-96x96.png',
    apple: [
      { url: '/english/favicon-192x192.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/english/manifest.json',
  appleWebApp: {
    statusBarStyle: 'default',
    title: 'Roopy English',
  },
}

export const viewport: Viewport = {
  themeColor: '#4FC3F7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
