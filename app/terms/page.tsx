import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
              利用規約
            </h1>
            <p className="text-sm text-gray-600">
              最終更新日: {new Date().toLocaleDateString('ja-JP')}
            </p>
          </div>

          <div className="prose prose-sm md:prose-base max-w-none space-y-6 text-[#3A405A]">
            <section>
              <h2 className="text-xl font-bold mb-3">第1条（適用）</h2>
              <p className="leading-relaxed">
                本利用規約（以下「本規約」）は、Roopy（以下「当アプリ」）の提供するサービス（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様には、本規約に従って本サービスをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第2条（利用登録）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  本サービスの利用を希望する方（以下「登録希望者」）は、本規約に同意の上、当アプリの定める方法によって利用登録を申請するものとします。
                </li>
                <li>
                  当アプリは、登録希望者が以下のいずれかに該当する場合、利用登録を承認しないことがあります：
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>虚偽の情報を登録した場合</li>
                    <li>過去に本規約に違反したことがある場合</li>
                    <li>その他、当アプリが不適切と判断した場合</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第3条（アカウント管理）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  ユーザーは、自己の責任において、パスワードおよびアカウント情報を適切に管理するものとします。
                </li>
                <li>
                  ユーザーは、いかなる場合にも、アカウントを第三者に譲渡または貸与することはできません。
                </li>
                <li>
                  パスワードの管理不十分、使用上の過誤、第三者の使用等によって生じた損害について、当アプリは一切の責任を負いません。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第4条（禁止事項）</h2>
              <p className="leading-relaxed mb-2">
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当アプリのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>当アプリのサービスの運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>不正アクセスをする行為</li>
                <li>第三者に成りすます行為</li>
                <li>当アプリが許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
                <li>自動化されたプログラムを使用して不正にポイントやスコアを獲得する行為</li>
                <li>その他、当アプリが不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第5条（本サービスの提供の停止等）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  当アプリは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができます：
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>本サービスにかかるシステムの保守点検または更新を行う場合</li>
                    <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                    <li>その他、当アプリが本サービスの提供が困難と判断した場合</li>
                  </ul>
                </li>
                <li>
                  当アプリは、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害について、理由を問わず一切の責任を負わないものとします。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第6条（利用制限および登録抹消）</h2>
              <p className="leading-relaxed mb-2">
                当アプリは、以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができます：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>その他、当アプリが本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第7条（免責事項）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  当アプリは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含む）がないことを明示的にも黙示的にも保証しません。
                </li>
                <li>
                  当アプリは、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、本サービスに関する当アプリとユーザーとの間の契約が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
                </li>
                <li>
                  当アプリは、本サービスの内容または本サービスの利用により得られる情報等について、その正確性、最新性、有用性等いかなる保証もしないものとします。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第8条（サービス内容の変更等）</h2>
              <p className="leading-relaxed">
                当アプリは、ユーザーに通知することなく、本サービスの内容を変更し、または本サービスの提供を中止することができます。当アプリは、これによってユーザーに生じた損害について一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第9条（利用規約の変更）</h2>
              <p className="leading-relaxed">
                当アプリは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができます。変更後の本規約は、本サービス上に表示した時点より効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第10条（準拠法・裁判管轄）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
                <li>
                  本サービスに関して紛争が生じた場合には、当アプリの所在地を管轄する裁判所を専属的合意管轄とします。
                </li>
              </ol>
            </section>

            <section className="mt-8 p-4 bg-[#E0F7F1] rounded-lg">
              <p className="text-sm leading-relaxed">
                本規約は、ユーザーと当アプリとの間の本サービスの利用に関わる一切の関係に適用されるものとします。
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
