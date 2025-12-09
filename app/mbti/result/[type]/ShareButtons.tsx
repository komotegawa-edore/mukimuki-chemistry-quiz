'use client'

import { Share2, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface ShareButtonsProps {
  type: string
  typeData: {
    icon: string
    title: string
    description: string
  }
}

export default function ShareButtons({ type, typeData }: ShareButtonsProps) {
  const shareUrl = `https://edore-edu.com/mbti/result/${type.toLowerCase()}`

  const handleShare = async () => {
    const shareText = `【受験生タイプ診断】\n\n私は「${type} - ${typeData.title}」でした！\n\n${typeData.description}\n\n大学受験を"ゲームする"なら #Roopy`

    if (navigator.share) {
      try {
        await navigator.share({
          title: '受験生タイプ診断 | Roopy',
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // シェアがキャンセルされた場合
      }
    } else {
      // Web Share APIが使えない場合はクリップボードにコピー
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      alert('結果をコピーしました！')
    }
  }

  const shareToX = () => {
    const text = encodeURIComponent(
      `【受験生タイプ診断】\n私は「${type} - ${typeData.title}」でした！\n\n大学受験を"ゲームする"なら #Roopy`
    )
    const url = encodeURIComponent(shareUrl)
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank'
    )
  }

  return (
    <div className="space-y-3 mb-8">
      {/* Share Buttons */}
      <div className="flex gap-3">
        <button
          onClick={shareToX}
          className="flex-1 bg-black text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Xでシェア
        </button>
        <button
          onClick={handleShare}
          className="bg-white text-[#3A405A] py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Restart */}
      <Link
        href="/mbti"
        className="w-full bg-[#F4F9F7] text-[#3A405A] py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#E0F7F1] transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        自分も診断する
      </Link>
    </div>
  )
}
