import Link from 'next/link'
import { CheckCircle, Headphones, ArrowRight } from 'lucide-react'

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            登録完了しました！
          </h1>
          <p className="text-gray-600 mb-6">
            Roopy Englishへようこそ。<br />
            毎朝の英語ニュースで、リスニング力を鍛えましょう。
          </p>

          <div className="bg-cyan-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-cyan-700 font-medium">
              <Headphones className="w-5 h-5" />
              毎朝7時に新着ニュースを配信
            </div>
          </div>

          <Link
            href="/english/news"
            className="inline-flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            ニュースを聞き始める
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
