'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function JukuAdminSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ヘッダー */}
          <div className="mb-8 text-center">
            <Image
              src="/images/jukuba-logo.png"
              alt="JUKUBA"
              width={200}
              height={56}
              className="mx-auto mb-4"
            />
          </div>

          {/* メッセージ */}
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              招待制サービスです
            </h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              JUKUBAのアカウント作成は、<br />
              ご契約後に運営側で行わせていただきます。<br />
              <br />
              サービスについてのお問い合わせは、<br />
              下記よりお願いいたします。
            </p>

            <div className="space-y-3">
              <Link
                href="/lp/juku-site/contact"
                className="block w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
              >
                無料相談・資料請求
              </Link>
              <Link
                href="/lp/juku-site"
                className="block w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                サービス詳細を見る
              </Link>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              既にアカウントをお持ちですか？
              <Link href="/juku-admin/login" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                ログイン
              </Link>
            </p>
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <a href="https://edore-edu.com" className="hover:text-gray-600">Edore</a>
        </p>
      </div>
    </div>
  )
}
