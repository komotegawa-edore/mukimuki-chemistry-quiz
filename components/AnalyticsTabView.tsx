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
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('chapter')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chapter'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              章別定着率
            </button>
            <button
              onClick={() => setActiveTab('question')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'question'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              問題別定着率
            </button>
          </nav>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'chapter' ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-black mb-2">章別定着率</h3>
              <p className="text-sm text-gray-600">
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
              <h3 className="text-lg font-semibold text-black mb-2">問題別定着率</h3>
              <p className="text-sm text-gray-600">
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
