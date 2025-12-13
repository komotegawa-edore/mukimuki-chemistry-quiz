import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/lp/english"
          className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          ホームへ戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">利用規約</h1>

        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">第1条（適用）</h2>
            <p>
              本規約は、Edore（以下「当社」）が提供する「Roopy English」（以下「本サービス」）の利用に関する条件を定めるものです。
              ユーザーは本規約に同意の上、本サービスを利用するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">第2条（サービス内容）</h2>
            <p>
              本サービスは、英語学習を目的としたニュースリスニング教材の提供を行います。
              コンテンツは毎日更新され、英語音声・字幕・重要単語リストを含みます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">第3条（利用登録）</h2>
            <p>
              本サービスの利用には会員登録が必要です。
              登録情報は正確かつ最新の情報を提供してください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">第4条（料金・支払い）</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>月額プラン: 980円（税込）</li>
              <li>年間プラン: 9,800円（税込）</li>
              <li>支払いはクレジットカードによる自動課金となります</li>
              <li>解約は次回更新日の前日まで可能です</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">第5条（解約・返金）</h2>
            <p>
              解約後も契約期間終了まで本サービスをご利用いただけます。
              契約期間途中での返金は原則として行いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">第6条（禁止事項）</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>コンテンツの無断転載・複製・再配布</li>
              <li>不正アクセスやサービスへの攻撃</li>
              <li>他のユーザーへの迷惑行為</li>
              <li>法令または公序良俗に反する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">第7条（免責事項）</h2>
            <p>
              本サービスのコンテンツは学習目的で提供されており、情報の正確性を保証するものではありません。
              ニュースの内容については元記事をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">第8条（規約の変更）</h2>
            <p>
              当社は必要に応じて本規約を変更することがあります。
              変更後の規約は本ページに掲載した時点で効力を生じます。
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
