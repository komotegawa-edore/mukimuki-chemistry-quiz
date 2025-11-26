import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F4F9F7]">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#5DDFC3] hover:text-[#4ECFB3] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="mb-8 text-center">
            <Image
              src="/Roopy-full-1.png"
              alt="Roopy（るーぴー）"
              width={200}
              height={67}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-[#3A405A] mb-2">
              プライバシーポリシー
            </h1>
            <p className="text-sm text-gray-600">
              最終更新日: {new Date().toLocaleDateString('ja-JP')}
            </p>
          </div>

          <div className="prose prose-sm md:prose-base max-w-none space-y-6 text-[#3A405A]">
            <section>
              <h2 className="text-xl font-bold mb-3">1. はじめに</h2>
              <p className="leading-relaxed">
                Roopy（以下「当アプリ」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーは、当アプリがどのような情報を収集し、どのように利用するかを説明するものです。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. 収集する情報</h2>
              <h3 className="text-lg font-semibold mb-2">2.1 ユーザーが提供する情報</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>お名前</li>
                <li>メールアドレス</li>
                <li>パスワード（暗号化して保存）</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">2.2 自動的に収集される情報</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>学習履歴（解答結果、スコア、クリア状況）</li>
                <li>ログイン履歴</li>
                <li>獲得ポイント・バッジ情報</li>
                <li>デバイス情報（ブラウザの種類、OS等）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. 情報の利用目的</h2>
              <p className="leading-relaxed mb-2">収集した情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>アカウントの作成・管理</li>
                <li>サービスの提供・改善</li>
                <li>学習進捗の記録・表示</li>
                <li>ランキング機能の提供</li>
                <li>ユーザーサポート</li>
                <li>重要なお知らせの配信</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. 情報の共有</h2>
              <p className="leading-relaxed">
                当アプリは、以下の場合を除き、ユーザーの個人情報を第三者と共有することはありません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>サービス提供に必要な範囲で、業務委託先に提供する場合（適切な管理のもと）</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>ランキング機能について：</strong> ランキング機能では、ユーザー名とポイント数が他のユーザーに表示されます。メールアドレスなどの連絡先情報は公開されません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. 情報の管理</h2>
              <p className="leading-relaxed">
                当アプリは、ユーザーの個人情報を適切に管理し、不正アクセス、紛失、破損、改ざん、漏洩などを防止するため、合理的な安全対策を講じています。個人情報は暗号化され、安全なデータベース（Supabase）に保管されています。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Cookieの使用</h2>
              <p className="leading-relaxed">
                当アプリは、ユーザーのログイン状態を維持するためにCookieを使用します。Cookieの使用を希望されない場合は、ブラウザの設定で無効化できますが、一部の機能が利用できなくなる可能性があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. 外部サービスの利用</h2>
              <p className="leading-relaxed mb-2">当アプリは、以下の外部サービスを利用しています：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Supabase：</strong> データベース、認証機能
                </li>
                <li>
                  <strong>Google OAuth：</strong> Googleアカウントでのログイン機能
                </li>
              </ul>
              <p className="leading-relaxed mt-3">
                これらのサービスには独自のプライバシーポリシーがあり、当アプリはそれに従って運用されています。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. ユーザーの権利</h2>
              <p className="leading-relaxed mb-2">ユーザーは、以下の権利を有します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>自己の個人情報の開示を請求する権利</li>
                <li>個人情報の訂正・削除を請求する権利</li>
                <li>アカウントの削除を請求する権利</li>
              </ul>
              <p className="leading-relaxed mt-3">
                これらの権利を行使したい場合は、アプリ内の設定またはお問い合わせからご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. 未成年者の利用</h2>
              <p className="leading-relaxed">
                当アプリは、未成年者の利用を想定しています。未成年者が利用される場合は、保護者の同意を得た上でご利用ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. プライバシーポリシーの変更</h2>
              <p className="leading-relaxed">
                当アプリは、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、アプリ内のお知らせ機能などで通知します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">11. お問い合わせ</h2>
              <p className="leading-relaxed">
                本プライバシーポリシーに関するご質問やご意見がございましたら、アプリ内のお問い合わせフォームからご連絡ください。
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#5DDFC3] text-white rounded-lg font-semibold hover:bg-[#4ECFB3] transition-colors"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
