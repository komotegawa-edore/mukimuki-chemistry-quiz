import { getServiceSetting } from '@/lib/service-settings'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Wrench, Clock, ArrowLeft } from 'lucide-react'

export default async function EnglishMaintenancePage() {
  // サービスが公開中ならトップへリダイレクト
  const setting = await getServiceSetting('roopy_english')
  if (setting?.is_public) {
    redirect('/english')
  }

  const message = setting?.maintenance_message || 'サービスは現在メンテナンス中です。しばらくお待ちください。'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/english/favicon-96x96.png"
            alt="Roopy English"
            width={80}
            height={80}
            className="rounded-2xl opacity-50"
          />
        </div>

        {/* Icon */}
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-orange-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          サービス一時停止中
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Status */}
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm mb-8">
          <Clock className="w-4 h-4" />
          再開までしばらくお待ちください
        </div>

        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Roopyトップへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
