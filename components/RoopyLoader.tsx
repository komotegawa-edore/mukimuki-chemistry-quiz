'use client'

import Image from 'next/image'

interface RoopyLoaderProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
  useVideo?: boolean
}

export default function RoopyLoader({
  message = '読み込み中...',
  size = 'medium',
  fullScreen = false,
  useVideo = false,
}: RoopyLoaderProps) {
  const sizeMap = {
    small: { container: 'w-24 h-24', image: 96 },
    medium: { container: 'w-32 h-32', image: 128 },
    large: { container: 'w-48 h-48', image: 192 },
  }

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-[#F4F9F7] z-50'
    : 'flex items-center justify-center'

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {/* Roopy画像/動画 */}
        <div className={`${sizeMap[size].container} rounded-full overflow-hidden bg-white shadow-lg animate-pulse`}>
          {useVideo ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/Roopy.mp4" type="video/mp4" />
            </video>
          ) : (
            <Image
              src="/Roopy.png"
              alt="Roopy"
              width={sizeMap[size].image}
              height={sizeMap[size].image}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* ローディングメッセージ */}
        <p className="text-[#3A405A] text-sm font-medium">{message}</p>

        {/* ローディングドット */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-[#5DDFC3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#5DDFC3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#5DDFC3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
