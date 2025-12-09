import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Noto_Sans_JP } from 'next/font/google'
import { typeResults, isValidMBTIType } from '@/lib/mbti-data'
import { ArrowRight } from 'lucide-react'
import ShareButtons from './ShareButtons'
import TypeIcon from './TypeIcon'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

interface PageProps {
  params: Promise<{ type: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { type } = await params
  const upperType = type.toUpperCase()

  if (!isValidMBTIType(upperType)) {
    return {
      title: '受験生タイプ診断 | Roopy',
    }
  }

  const typeData = typeResults[upperType]

  return {
    title: `${upperType} ${typeData.title} | 受験生タイプ診断`,
    description: typeData.description,
    openGraph: {
      title: `${upperType} ${typeData.title} | 受験生タイプ診断`,
      description: typeData.description,
      images: [
        {
          url: `/api/og/mbti?type=${upperType}`,
          width: 1200,
          height: 630,
          alt: `${upperType} - ${typeData.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${upperType} ${typeData.title} | 受験生タイプ診断`,
      description: typeData.description,
      images: [`/api/og/mbti?type=${upperType}`],
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(typeResults).map((type) => ({
    type: type.toLowerCase(),
  }))
}

export default async function MBTIResultPage({ params }: PageProps) {
  const { type } = await params
  const upperType = type.toUpperCase()

  if (!isValidMBTIType(upperType)) {
    notFound()
  }

  const typeData = typeResults[upperType]

  return (
    <div
      className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}
    >
      {/* Navigation Header */}
      <nav className="bg-white border-b border-[#E0F7F1] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-xl text-[#3A405A]">Roopy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[#3A405A] hover:text-[#5DDFC3] font-medium transition-colors"
            >
              ログイン
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            受験生タイプ診断結果
          </h1>
        </div>

        {/* Result Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Type Header */}
          <div
            className="p-8 text-white text-center"
            style={{
              background: `linear-gradient(135deg, ${typeData.color} 0%, ${typeData.color}dd 100%)`,
            }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TypeIcon iconName={typeData.icon} className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold mb-1">{upperType}</div>
            <div className="text-xl">{typeData.title}</div>
          </div>

          {/* Description */}
          <div className="p-6">
            <p className="text-[#3A405A] leading-relaxed mb-6">
              {typeData.description}
            </p>

            {/* Strengths */}
            <div className="mb-6">
              <h3 className="font-bold text-[#5DDFC3] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#E0F7F1] rounded-full flex items-center justify-center text-sm">💪</span>
                強み
              </h3>
              <div className="flex flex-wrap gap-2">
                {typeData.strengths.map((strength, index) => (
                  <span
                    key={index}
                    className="bg-[#E0F7F1] text-[#3A405A] px-3 py-1 rounded-full text-sm"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="mb-6">
              <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-50 rounded-full flex items-center justify-center text-sm">⚠️</span>
                気をつけたいこと
              </h3>
              <div className="flex flex-wrap gap-2">
                {typeData.weaknesses.map((weakness, index) => (
                  <span
                    key={index}
                    className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm"
                  >
                    {weakness}
                  </span>
                ))}
              </div>
            </div>

            {/* Study Tips */}
            <div className="mb-6">
              <h3 className="font-bold text-[#3A405A] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-sm">📚</span>
                おすすめ勉強法
              </h3>
              <ul className="space-y-2">
                {typeData.studyTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#5DDFC3] mt-1">•</span>
                    <span className="text-sm text-[#3A405A]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compatible Types */}
            <div className="bg-[#F4F9F7] rounded-xl p-4">
              <h3 className="font-bold text-[#3A405A] mb-2 text-sm flex items-center gap-2">
                <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs">🤝</span>
                相性の良いタイプ
              </h3>
              <div className="flex gap-2">
                {typeData.compatibleTypes.map((compatType, index) => (
                  <Link
                    key={index}
                    href={`/mbti/result/${compatType.toLowerCase()}`}
                    className="bg-white text-[#5DDFC3] font-bold px-3 py-1 rounded-lg text-sm shadow-sm hover:shadow-md transition-shadow"
                  >
                    {compatType}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <ShareButtons type={upperType} typeData={typeData} />

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            Roopyで受験勉強を
            <br />
            ゲームにしよう
          </h3>
          <p className="text-sm opacity-90 mb-4">
            あなた専用の学習ロードマップを作成。
            <br />
            毎日の勉強が続く仕組みを提供します。
          </p>
          <Link
            href="/roopy-roadmap"
            className="inline-flex items-center gap-2 bg-white text-[#5DDFC3] font-bold py-3 px-6 rounded-full hover:bg-gray-50 transition-colors"
          >
            詳しく見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0F7F1] py-8 px-4 mt-12">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-lg text-[#3A405A]">Roopy</span>
          </div>
          <p className="text-sm text-[#3A405A] opacity-70 mb-4">
            大学受験を"毎日つづけられる"ゲームにする
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="text-[#3A405A] opacity-70 hover:text-[#5DDFC3] hover:opacity-100 transition-colors"
            >
              利用規約
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#3A405A] opacity-50">
            &copy; 2025 Edore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
