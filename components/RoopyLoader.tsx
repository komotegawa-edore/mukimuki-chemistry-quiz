'use client'

interface RoopyLoaderProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
}

export default function RoopyLoader({
  message = '読み込み中...',
  size = 'medium',
  fullScreen = false,
}: RoopyLoaderProps) {
  const sizeMap = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
  }

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-[#F4F9F7] z-50'
    : 'flex items-center justify-center'

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {/* Roopy動画 */}
        <div className={`${sizeMap[size]} rounded-full overflow-hidden bg-white shadow-lg`}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/Roopy.mp4" type="video/mp4" />
          </video>
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
