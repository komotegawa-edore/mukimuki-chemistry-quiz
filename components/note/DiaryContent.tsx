'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Clock, Save, Loader2 } from 'lucide-react'

interface Entry {
  id: string
  user_id: string
  entry_date: string
  content: string
  study_hours: number | null
  subjects: string[]
  mood: number | null
  is_public: boolean
}

interface DiaryContentProps {
  entries: Entry[]
  todayEntry: Entry | null
  userId: string
  currentMonth: Date
}

const MOODS = [
  { value: 1, emoji: '😫', label: '最悪' },
  { value: 2, emoji: '😕', label: 'いまいち' },
  { value: 3, emoji: '😐', label: 'ふつう' },
  { value: 4, emoji: '😊', label: 'いい感じ' },
  { value: 5, emoji: '🔥', label: '最高！' },
]

const SUBJECTS = ['数学', '英語', '国語', '物理', '化学', '生物', '日本史', '世界史', '地理', '政経', 'その他']

export default function DiaryContent({
  entries: initialEntries,
  todayEntry: initialTodayEntry,
  userId,
  currentMonth: initialMonth,
}: DiaryContentProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [entries, setEntries] = useState(initialEntries)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [todayEntry, setTodayEntry] = useState(initialTodayEntry)

  // フォーム状態
  const [content, setContent] = useState(todayEntry?.content || '')
  const [studyHours, setStudyHours] = useState(todayEntry?.study_hours?.toString() || '')
  const [mood, setMood] = useState(todayEntry?.mood || 3)
  const [subjects, setSubjects] = useState<string[]>(todayEntry?.subjects || [])
  const [isPublic, setIsPublic] = useState(todayEntry?.is_public || false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // カレンダー用のデータ
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startDay = firstDayOfMonth.getDay()

  // 日付にエントリがあるかチェック
  const entryDates = new Set(entries.map((e) => e.entry_date))

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = async (date: string) => {
    setSelectedDate(date)

    // 選択した日のエントリを取得
    const entry = entries.find((e) => e.entry_date === date)
    if (entry) {
      setContent(entry.content)
      setStudyHours(entry.study_hours?.toString() || '')
      setMood(entry.mood || 3)
      setSubjects(entry.subjects || [])
      setIsPublic(entry.is_public)
    } else {
      // 新規の場合はリセット
      setContent('')
      setStudyHours('')
      setMood(3)
      setSubjects([])
      setIsPublic(false)
    }
  }

  const handleSubjectToggle = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    )
  }

  const handleSave = async () => {
    if (!content.trim()) {
      setMessage({ type: 'error', text: '内容を入力してください' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const existingEntry = entries.find((e) => e.entry_date === selectedDate)

      const entryData = {
        user_id: userId,
        entry_date: selectedDate,
        content: content.trim(),
        study_hours: studyHours ? parseFloat(studyHours) : null,
        mood,
        subjects,
        is_public: isPublic,
      }

      if (existingEntry) {
        // 更新
        const { error } = await supabase
          .from('roopynote_entries')
          .update(entryData)
          .eq('id', existingEntry.id)

        if (error) throw error

        setEntries((prev) =>
          prev.map((e) =>
            e.id === existingEntry.id ? { ...e, ...entryData } : e
          )
        )
      } else {
        // 新規作成
        const { data, error } = await supabase
          .from('roopynote_entries')
          .insert(entryData)
          .select()
          .single()

        if (error) throw error

        setEntries((prev) => [...prev, data])
      }

      setMessage({ type: 'success', text: '保存しました！' })

      // 今日の記録の場合は更新
      if (selectedDate === new Date().toISOString().split('T')[0]) {
        setTodayEntry({ ...entryData, id: existingEntry?.id || '' } as Entry)
      }
    } catch {
      setMessage({ type: 'error', text: '保存に失敗しました' })
    } finally {
      setIsSaving(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* カレンダー */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800">
            {year}年{month + 1}月
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7 gap-1">
          {/* 空白セル */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* 日付セル */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const hasEntry = entryDates.has(dateStr)
            const isSelected = selectedDate === dateStr
            const isToday = dateStr === today
            const dayOfWeek = new Date(year, month, day).getDay()

            return (
              <button
                key={day}
                onClick={() => handleDateClick(dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                    : isToday
                    ? 'bg-amber-50 text-amber-600'
                    : 'hover:bg-gray-100'
                } ${
                  dayOfWeek === 0 && !isSelected
                    ? 'text-red-500'
                    : dayOfWeek === 6 && !isSelected
                    ? 'text-blue-500'
                    : ''
                }`}
              >
                <span>{day}</span>
                {hasEntry && !isSelected && (
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 記録フォーム */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">
            {selectedDate === today ? '今日' : selectedDate}の記録
          </h3>
          {entries.find((e) => e.entry_date === selectedDate) && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              記録あり
            </span>
          )}
        </div>

        {/* 学習内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            学習内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今日は何を勉強しましたか？"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* 学習時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            学習時間
          </label>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={studyHours}
              onChange={(e) => setStudyHours(e.target.value)}
              placeholder="0"
              min="0"
              max="24"
              step="0.5"
              className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-center"
            />
            <span className="text-gray-600">時間</span>
          </div>
        </div>

        {/* 今日の調子 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            今日の調子
          </label>
          <div className="flex justify-between">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  mood === m.value
                    ? 'bg-amber-100 scale-110'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs text-gray-500 mt-1">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 科目タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            勉強した科目
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectToggle(subject)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  subjects.includes(subject)
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* 公開設定 */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-700">他のユーザーに公開</span>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 rounded-full transition-colors ${
              isPublic ? 'bg-amber-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* メッセージ */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={isSaving || !content.trim()}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              保存する
            </>
          )}
        </button>
      </div>
    </main>
  )
}
