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
  title: '利用規約',
  description: 'Roopy（るーぴー）の利用規約について説明します。',
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}>
      <BlogHeader />

      <main className="max-w-[800px] mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <p className="text-sm opacity-70">最終更新日: 2025年1月1日</p>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第1条（適用）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>本規約は、Edore（以下「当社」）が提供するRoopy（以下「本サービス」）の利用に関する条件を定めるものです。</li>
              <li>ユーザーは、本規約に同意した上で本サービスを利用するものとします。</li>
              <li>本サービスを利用した時点で、ユーザーは本規約に同意したものとみなします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第2条（定義）</h2>
            <p className="leading-relaxed opacity-80">本規約において使用する用語の定義は以下のとおりとします。</p>
            <ul className="list-disc list-inside space-y-2 mt-4 opacity-80">
              <li>「ユーザー」とは、本サービスを利用するすべての方を指します。</li>
              <li>「コンテンツ」とは、本サービス上で提供されるクイズ、問題、テキスト、画像等のすべての情報を指します。</li>
              <li>「アカウント」とは、ユーザーが本サービスを利用するために作成する利用権を指します。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第3条（アカウント登録）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>ユーザーは、当社が定める方法によりアカウント登録を行うことで、本サービスを利用できます。</li>
              <li>ユーザーは、登録情報について正確かつ最新の情報を提供するものとします。</li>
              <li>ユーザーは、自己のアカウント情報を適切に管理する責任を負い、第三者に利用させたり、譲渡・貸与してはなりません。</li>
              <li>アカウントの不正使用により生じた損害について、当社は一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第4条（サービスの内容）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>本サービスは、大学受験に向けた学習支援を目的としたWebアプリケーションです。</li>
              <li>本サービスは無料で提供されますが、当社は予告なく有料サービスを追加する場合があります。</li>
              <li>本サービスの内容は、予告なく変更・追加・削除される場合があります。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第5条（禁止事項）</h2>
            <p className="leading-relaxed mb-4 opacity-80">ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利を侵害する行為</li>
              <li>本サービスのサーバーまたはネットワークに過度の負荷をかける行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセスを試みる行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>本サービスのコンテンツを無断で複製、転載、販売する行為</li>
              <li>反社会的勢力に対する利益供与その他の協力行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第6条（サービスの停止・中断）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>当社は、以下の場合、事前の通知なく本サービスの全部または一部を停止・中断できるものとします。
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>システムの保守・点検を行う場合</li>
                  <li>地震、落雷、火災等の不可抗力により運営が困難な場合</li>
                  <li>その他、当社がやむを得ないと判断した場合</li>
                </ul>
              </li>
              <li>当社は、サービスの停止・中断によりユーザーに生じた損害について、一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第7条（知的財産権）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>本サービスに関する著作権、商標権その他の知的財産権は、当社または正当な権利者に帰属します。</li>
              <li>ユーザーは、当社の事前の書面による承諾なく、本サービスのコンテンツを複製、転載、改変、販売等してはなりません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第8条（免責事項）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>当社は、本サービスの内容の正確性、完全性、有用性等について、いかなる保証も行いません。</li>
              <li>本サービスは学習支援を目的としたものであり、合格を保証するものではありません。</li>
              <li>ユーザーが本サービスを利用することにより生じた損害について、当社は一切の責任を負いません。</li>
              <li>当社は、ユーザー間またはユーザーと第三者との間で生じた紛争について、一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第9条（アカウントの削除）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>ユーザーは、当社所定の方法により、いつでもアカウントを削除することができます。</li>
              <li>当社は、ユーザーが本規約に違反した場合、事前の通知なくアカウントを削除できるものとします。</li>
              <li>アカウント削除後、ユーザーの学習データは復元できません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第10条（規約の変更）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>当社は、必要に応じて本規約を変更することができます。</li>
              <li>規約変更後に本サービスを利用した場合、ユーザーは変更後の規約に同意したものとみなします。</li>
              <li>重要な変更がある場合は、本サービス上で通知します。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第11条（準拠法・管轄裁判所）</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li>本規約の解釈は、日本法に準拠するものとします。</li>
              <li>本サービスに関する紛争については、大阪地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-[#E0F7F1]">第12条（お問い合わせ）</h2>
            <p className="leading-relaxed mb-4 opacity-80">
              本規約に関するお問い合わせは、以下までご連絡ください。
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
