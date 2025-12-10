import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '受験生タイプ診断 | Roopy',
  description:
    '12問の質問に答えるだけで、あなたの受験生タイプがわかる！自分に合った勉強法を見つけよう。',
  openGraph: {
    title: '受験生タイプ診断 | Roopy',
    description:
      '12問の質問に答えるだけで、あなたの受験生タイプがわかる！自分に合った勉強法を見つけよう。',
    images: [
      {
        url: '/og/mbti-top.png',
        width: 1200,
        height: 630,
        alt: '受験生タイプ診断',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '受験生タイプ診断 | Roopy',
    description:
      '12問の質問に答えるだけで、あなたの受験生タイプがわかる！自分に合った勉強法を見つけよう。',
    images: ['/og/mbti-top.png'],
  },
}

export default function MBTILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
