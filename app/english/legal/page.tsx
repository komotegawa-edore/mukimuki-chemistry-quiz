import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/english"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">特定商取引法に基づく表記</h1>

        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm text-gray-700">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top w-1/3">
                  販売事業者
                </th>
                <td className="py-4">Edore</td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  運営責任者
                </th>
                <td className="py-4">表川 和</td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  所在地
                </th>
                <td className="py-4">
                  請求があった場合は遅滞なく開示いたします
                </td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  電話番号
                </th>
                <td className="py-4">
                  請求があった場合は遅滞なく開示いたします
                </td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  メールアドレス
                </th>
                <td className="py-4">
                  <a
                    href="mailto:k.omotegawa@edore-edu.com"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    k.omotegawa@edore-edu.com
                  </a>
                </td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  サービス名
                </th>
                <td className="py-4">Roopy English</td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  販売価格
                </th>
                <td className="py-4">
                  <ul className="space-y-1">
                    <li>月額プラン: 980円（税込）</li>
                    <li>年間プラン: 9,800円（税込）</li>
                  </ul>
                </td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  支払方法
                </th>
                <td className="py-4">クレジットカード（Stripe決済）</td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  支払時期
                </th>
                <td className="py-4">
                  購入時に即時決済。以降は契約更新日に自動課金されます。
                </td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  サービス提供時期
                </th>
                <td className="py-4">
                  決済完了後、即時ご利用いただけます。
                </td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  返品・キャンセル
                </th>
                <td className="py-4">
                  <p>デジタルコンテンツという性質上、購入後の返金は原則として行っておりません。</p>
                  <p className="mt-2">
                    解約は次回更新日の前日まで可能です。解約後も契約期間終了までサービスをご利用いただけます。
                  </p>
                </td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  動作環境
                </th>
                <td className="py-4">
                  <ul className="space-y-1">
                    <li>対応ブラウザ: Chrome、Safari、Firefox、Edge（最新版）</li>
                    <li>インターネット接続環境が必要です</li>
                  </ul>
                </td>
              </tr>

              <tr>
                <th className="py-4 pr-4 text-left font-bold text-gray-800 align-top">
                  その他の費用
                </th>
                <td className="py-4">
                  サービス利用に必要なインターネット通信費はお客様のご負担となります。
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>最終更新日: 2024年12月13日</p>
          </div>
        </div>
      </div>
    </div>
  )
}
