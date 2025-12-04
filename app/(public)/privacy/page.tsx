import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import BlogHeader from '@/components/BlogHeader'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'Roopy（るーぴー）のプライバシーポリシーについて説明します。',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}>
      <BlogHeader />

      <main className="max-w-[800px] mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <p className="text-sm opacity-70">最終更新日: 2025年1月1日</p>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">1. はじめに</h2>
            <p className="leading-relaxed">
              Edore（以下「当社」）は、Roopy（以下「本サービス」）を提供するにあたり、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーでは、当社が収集する情報、その利用方法、およびユーザーの皆様の権利について説明します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">2. 収集する情報</h2>
            <p className="leading-relaxed mb-4">当社は、以下の情報を収集することがあります。</p>

            <h3 className="font-bold mb-2">2.1 アカウント情報</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 opacity-80">
              <li>メールアドレス</li>
              <li>ユーザー名（ニックネーム）</li>
              <li>Googleアカウント情報（Googleログインを使用する場合）</li>
              <li>LINEアカウント情報（LINEログインを使用する場合）</li>
            </ul>

            <h3 className="font-bold mb-2">2.2 学習データ</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 opacity-80">
              <li>クイズの解答履歴</li>
              <li>正答率・スコア</li>
              <li>学習進捗状況</li>
              <li>獲得ポイント</li>
            </ul>

            <h3 className="font-bold mb-2">2.3 利用データ</h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>アクセス日時</li>
              <li>利用デバイス情報</li>
              <li>IPアドレス</li>
              <li>ブラウザ情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">3. 情報の利用目的</h2>
            <p className="leading-relaxed mb-4">収集した情報は、以下の目的で利用します。</p>
            <ul className="list-disc list-inside space-y-2 opacity-80">
              <li>本サービスの提供・運営</li>
              <li>ユーザー認証およびアカウント管理</li>
              <li>学習進捗の記録・表示</li>
              <li>ランキング機能の提供</li>
              <li>サービスの改善・新機能の開発</li>
              <li>お問い合わせへの対応</li>
              <li>重要なお知らせの送信</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">4. 情報の共有</h2>
            <p className="leading-relaxed mb-4">
              当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
            </p>
            <ul className="list-disc list-inside space-y-2 opacity-80">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>サービス提供に必要な業務委託先への提供（適切な管理の下で）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">5. 外部サービスの利用</h2>
            <p className="leading-relaxed mb-4">本サービスでは、以下の外部サービスを利用しています。</p>

            <h3 className="font-bold mb-2">5.1 認証サービス</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 opacity-80">
              <li>Google認証（Google LLC）</li>
              <li>LINE認証（LINEヤフー株式会社）</li>
              <li>Supabase Auth（Supabase Inc.）</li>
            </ul>

            <h3 className="font-bold mb-2">5.2 分析サービス</h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>Vercel Analytics（Vercel Inc.）</li>
            </ul>
            <p className="mt-2 text-sm opacity-70">
              これらのサービスは、それぞれのプライバシーポリシーに従って情報を取り扱います。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">6. データの保管</h2>
            <p className="leading-relaxed">
              ユーザーのデータは、Supabase（クラウドデータベース）に安全に保管されます。データは適切なセキュリティ対策の下で管理され、不正アクセス、紛失、破壊、改ざんから保護されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">7. ユーザーの権利</h2>
            <p className="leading-relaxed mb-4">ユーザーは、以下の権利を有します。</p>
            <ul className="list-disc list-inside space-y-2 opacity-80">
              <li>自己の個人情報へのアクセス</li>
              <li>個人情報の訂正・削除の請求</li>
              <li>アカウントの削除</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              これらの権利を行使する場合は、下記のお問い合わせ先までご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">8. Cookieの使用</h2>
            <p className="leading-relaxed">
              本サービスでは、ユーザー認証およびセッション管理のためにCookieを使用します。Cookieを無効にした場合、一部の機能が正常に動作しない可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">9. 未成年者のプライバシー</h2>
            <p className="leading-relaxed">
              本サービスは、主に高校生・受験生を対象としています。18歳未満のユーザーは、保護者の同意を得た上でサービスを利用することを推奨します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">10. プライバシーポリシーの変更</h2>
            <p className="leading-relaxed">
              当社は、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、本サービス上でお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">11. お問い合わせ</h2>
            <p className="leading-relaxed mb-4">
              本プライバシーポリシーに関するお問い合わせは、以下までご連絡ください。
            </p>
            <div className="bg-[#F4F9F7] rounded-xl p-4">
              <p className="font-bold mb-2">Edore（エドア）</p>
              <p className="text-sm opacity-80">
                メール: <a href="mailto:k.omotegawa@edore-edu.com" className="text-[#5DDFC3] hover:underline">k.omotegawa@edore-edu.com</a>
              </p>
              <p className="text-sm opacity-80">
                X: <a href="https://x.com/Edore_handai" target="_blank" rel="noopener noreferrer" className="text-[#5DDFC3] hover:underline">@Edore_handai</a>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/home"
            className="inline-block text-[#5DDFC3] hover:underline"
          >
            ← トップページに戻る
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0F7F1] py-8 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <Link href="/home" className="inline-flex items-center gap-2 mb-4">
            <Image
              src="/Roopy-icon.png"
              alt="Roopy"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-lg">Roopy</span>
          </Link>
          <p className="text-sm opacity-60">
            &copy; 2025 Edore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
