'use client'

import { useState } from 'react'

interface Props {
  slug: string
}

type Device = 'desktop' | 'tablet' | 'mobile'

const deviceSizes: Record<Device, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'デスクトップ' },
  tablet: { width: '768px', label: 'タブレット' },
  mobile: { width: '375px', label: 'スマホ' },
}

export function PreviewFrame({ slug }: Props) {
  const [device, setDevice] = useState<Device>('desktop')
  const [key, setKey] = useState(0)

  const handleRefresh = () => {
    setKey(k => k + 1)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* ツールバー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          {(Object.keys(deviceSizes) as Device[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                device === d
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {d === 'desktop' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {d === 'tablet' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )}
              {d === 'mobile' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{deviceSizes[device].label}</span>
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="更新"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <a
            href={`/juku/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="新しいタブで開く"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* プレビュー */}
      <div
        className="bg-gray-100 p-4 flex justify-center"
        style={{ minHeight: 'calc(100vh - 200px)' }}
      >
        <div
          className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: deviceSizes[device].width,
            maxWidth: '100%',
          }}
        >
          <iframe
            key={key}
            src={`/juku/${slug}`}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 250px)' }}
            title="プレビュー"
          />
        </div>
      </div>
    </div>
  )
}
