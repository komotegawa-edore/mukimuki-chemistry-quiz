import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JUKUBA（ジュクバ）| 自分で更新できる塾専用ホームページ',
  description: '月額2,980円〜で始められる塾専用ホームページ作成サービス。10種類のテンプレートから選んで、専門知識不要で自分で更新できます。関西圏限定で対面サポート対応。',
  keywords: ['塾 ホームページ', '塾 HP作成', '塾 ウェブサイト', '個人塾 ホームページ', '学習塾 サイト制作'],
  openGraph: {
    title: 'JUKUBA（ジュクバ）| 自分で更新できる塾専用ホームページ',
    description: '月額2,980円〜。10種類のテンプレートから選んで自分で更新できる塾専用HP。',
    type: 'website',
    images: ['/images/jukuba-ogp.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JUKUBA | 塾専用ホームページ',
    description: '月額2,980円〜で自分で更新できる塾専用HP',
  },
}

export default function JukubaLPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
