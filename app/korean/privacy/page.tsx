import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { ChevronLeft } from 'lucide-react'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'プライバシーポリシー | Roopy Korean',
  description: 'Roopy Koreanのプライバシーポリシー',
}

export default function PrivacyPolicyPage() {
  return (
    <div className={`min-h-screen bg-gray-50 ${notoSansJP.className}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/korean" className="text-gray-600 hover:text-pink-500 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/korean/Roopy-Korean-icon.png"
              alt="Roopy Korean"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-gray-800">Roopy Korean</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">プライバシーポリシー</h1>
          <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年1月3日</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">1. はじめに</h2>
              <p className="text-gray-600 leading-relaxed">
                Roopy Korean（以下「本サービス」）は、株式会社Edore（以下「当社」）が運営する韓国語学習サービスです。
                本プライバシーポリシーは、本サービスにおける利用者の個人情報の取り扱いについて定めるものです。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">2. 収集する情報</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                本サービスでは、以下の情報を収集する場合があります。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
                <li>Cookie情報</li>
                <li>学習進捗データ（ローカルストレージに保存、サーバーには送信しません）</li>
                <li>広告配信に必要な情報（広告識別子など）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">3. 情報の利用目的</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                収集した情報は、以下の目的で利用します。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービスの提供・運営</li>
                <li>サービスの改善・新機能の開発</li>
                <li>利用状況の分析・統計</li>
                <li>広告の配信・効果測定</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">4. 広告について</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                本サービスでは、第三者配信の広告サービス（Google AdSense）を利用しています。
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
                Cookieを無効にする方法や、Google広告に関する詳細については、
                <a
                  href="https://policies.google.com/technologies/ads?hl=ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:underline"
                >
                  Google広告に関するポリシー
                </a>
                をご確認ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">5. アクセス解析ツールについて</h2>
              <p className="text-gray-600 leading-relaxed">
                本サービスでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
                Googleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。
                このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
                詳細は
                <a
                  href="https://policies.google.com/privacy?hl=ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:underline"
                >
                  Googleプライバシーポリシー
                </a>
                をご確認ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">6. Cookieについて</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                本サービスでは、以下の目的でCookieを使用しています。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>サービスの利便性向上</li>
                <li>アクセス解析</li>
                <li>広告配信の最適化</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                ブラウザの設定によりCookieを無効にすることができますが、
                その場合、一部の機能が正常に動作しない可能性があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">7. 第三者への情報提供</h2>
              <p className="text-gray-600 leading-relaxed">
                当社は、法令に基づく場合を除き、利用者の同意なく個人情報を第三者に提供することはありません。
                ただし、広告配信やアクセス解析のために、前述の第三者サービスに情報が送信される場合があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">8. データの保護</h2>
              <p className="text-gray-600 leading-relaxed">
                当社は、収集した情報の漏洩、滅失、毀損の防止のため、
                適切なセキュリティ対策を講じています。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">9. プライバシーポリシーの変更</h2>
              <p className="text-gray-600 leading-relaxed">
                本プライバシーポリシーは、必要に応じて変更されることがあります。
                重要な変更がある場合は、本サービス上でお知らせします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3">10. お問い合わせ</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                本プライバシーポリシーに関するお問い合わせは、以下までご連絡ください。
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 font-medium">株式会社Edore</p>
                <p className="text-gray-600 text-sm mt-1">
                  メール:
                  <a href="mailto:k.omotegawa@edore-edu.com" className="text-pink-500 hover:underline ml-1">
                    k.omotegawa@edore-edu.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <Link href="/korean" className="text-pink-500 hover:underline text-sm">
            Roopy Koreanに戻る
          </Link>
        </div>
      </main>
    </div>
  )
}
