'use client'

import { useState } from 'react'
import ChapterMasteryTable from './ChapterMasteryTable'
import QuestionMasteryTable from './QuestionMasteryTable'

type TabType = 'chapter' | 'question'

export default function AnalyticsTabView() {
  const [activeTab, setActiveTab] = useState<TabType>('chapter')

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow-md border-2 border-[#E0F7F1]">
        <div className="border-b border-[#E0F7F1]">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('chapter')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chapter'
                  ? 'border-[#5DDFC3] text-[#5DDFC3]'
                  : 'border-transparent text-[#3A405A] opacity-60 hover:opacity-100 hover:border-[#E0F7F1]'
              }`}
            >
              章別定着率
            </button>
            <button
              onClick={() => setActiveTab('question')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'question'
                  ? 'border-[#5DDFC3] text-[#5DDFC3]'
                  : 'border-transparent text-[#3A405A] opacity-60 hover:opacity-100 hover:border-[#E0F7F1]'
              }`}
            >
              問題別定着率
            </button>
          </nav>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#E0F7F1]">
        {activeTab === 'chapter' ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#3A405A] mb-2">章別定着率</h3>
              <p className="text-sm text-[#3A405A] opacity-70">
                各生徒の全ての章における正答率を確認できます。横スクロールで全章を閲覧できます。
                <br />
                複数回受験している場合は、全受験回数の合計正答率が表示されます。
              </p>
            </div>
            <ChapterMasteryTable />
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#3A405A] mb-2">問題別定着率</h3>
              <p className="text-sm text-[#3A405A] opacity-70">
                各問題について、生徒ごとの正答率を確認できます。章でフィルタリングも可能です。
                <br />
                複数回受験している場合は、全受験回数における正答率が表示されます。
              </p>
            </div>
            <QuestionMasteryTable />
          </div>
        )}
      </div>
    </div>
  )
}
