import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/english"
          className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          ホームへ戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">プライバシーポリシー</h1>

        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. はじめに</h2>
            <p>
              Edore（以下「当社」）は、「Roopy English」（以下「本サービス」）において、
              ユーザーの個人情報を適切に取り扱うことを重要な責務と考えています。
              本プライバシーポリシーでは、収集する情報とその利用方法について説明します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. 収集する情報</h2>
            <p className="mb-3">本サービスでは、以下の情報を収集することがあります：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>メールアドレス（会員登録・ログイン用）</li>
              <li>お支払い情報（Stripe経由で処理、当社では保存しません）</li>
              <li>サービスの利用履歴（視聴した記事、学習進捗など）</li>
              <li>デバイス情報（ブラウザ種類、OS等）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. 情報の利用目的</h2>
            <p className="mb-3">収集した情報は以下の目的で利用します：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>サービスの提供・運営</li>
              <li>ユーザー認証とアカウント管理</li>
              <li>お支払いの処理</li>
              <li>サービス改善のための分析</li>
              <li>お問い合わせへの対応</li>
              <li>重要なお知らせの送信</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. 情報の第三者提供</h2>
            <p>
              当社は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
              ただし、決済処理のためStripe社にお支払い情報が送信されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Cookieの使用</h2>
            <p>
              本サービスでは、ログイン状態の維持やサービス改善のためにCookieを使用しています。
              ブラウザの設定でCookieを無効にすることもできますが、
              一部の機能が正常に動作しなくなる可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">6. データの保護</h2>
            <p>
              当社は、個人情報への不正アクセス、紛失、破壊、改ざん、漏洩を防ぐため、
              適切なセキュリティ対策を講じています。データは暗号化された通信で送受信され、
              安全なサーバーに保存されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">7. ユーザーの権利</h2>
            <p className="mb-3">ユーザーは以下の権利を有します：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>個人情報の開示請求</li>
              <li>個人情報の訂正・削除の請求</li>
              <li>アカウントの削除</li>
            </ul>
            <p className="mt-3">
              これらの請求は、お問い合わせ窓口（k.omotegawa@edore-edu.com）までご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">8. お子様のプライバシー</h2>
            <p>
              本サービスは13歳未満のお子様を対象としておりません。
              13歳未満のお子様からの個人情報を意図的に収集することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">9. ポリシーの変更</h2>
            <p>
              当社は、必要に応じて本ポリシーを変更することがあります。
              重要な変更がある場合は、サービス内またはメールにてお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">10. お問い合わせ</h2>
            <p>
              プライバシーに関するご質問やご要望は、以下までお問い合わせください：
            </p>
            <p className="mt-2">
              <a
                href="mailto:k.omotegawa@edore-edu.com"
                className="text-blue-600 hover:text-blue-700"
              >
                k.omotegawa@edore-edu.com
              </a>
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>制定日: 2024年12月1日</p>
            <p>最終更新日: 2024年12月13日</p>
          </div>
        </div>
      </div>
    </div>
  )
}
