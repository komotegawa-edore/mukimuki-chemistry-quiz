'use client'

import { ScheduleContent, JukuSite } from '../../types'

interface Props {
  content: ScheduleContent
  site: JukuSite
}

export function ScheduleSection({ content, site }: Props) {
  const items = content.items || []

  if (items.length === 0) return null

  // 曜日ごとにグループ化
  const groupedByDay = items.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = []
    }
    acc[item.day].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const days = Object.keys(groupedByDay)

  return (
    <section id="schedule" className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: site.primary_color }}>
          {content.title}
        </h2>
        {content.subtitle && (
          <p className="text-gray-600 text-center mb-12">
            {content.subtitle}
          </p>
        )}

        {/* テーブル形式 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: site.primary_color }}>
                <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">曜日</th>
                <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">時間</th>
                <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">科目</th>
                <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">対象</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-4 px-4">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: site.primary_color }}
                    >
                      {item.day}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700 font-medium">
                    {item.time}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {item.subject}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {item.target}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* モバイル用カード表示 */}
        <div className="md:hidden mt-8 space-y-4">
          {days.map((day) => (
            <div key={day} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 font-bold text-white"
                style={{ backgroundColor: site.primary_color }}
              >
                {day}
              </div>
              <div className="divide-y divide-gray-100">
                {groupedByDay[day].map((item, index) => (
                  <div key={index} className="px-4 py-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800">{item.time}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {item.target}
                      </span>
                    </div>
                    <span className="text-gray-600">{item.subject}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
