'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Target, Check, X, Loader2, Trophy } from 'lucide-react'

interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  goal_type: 'daily' | 'weekly' | 'monthly' | 'custom'
  target_value: number
  current_value: number
  unit: string
  start_date: string
  end_date: string | null
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}

interface GoalsContentProps {
  goals: Goal[]
  userId: string
}

const GOAL_TYPES = [
  { value: 'daily', label: '日次目標' },
  { value: 'weekly', label: '週次目標' },
  { value: 'monthly', label: '月次目標' },
  { value: 'custom', label: 'カスタム' },
]

const UNITS = [
  { value: 'hours', label: '時間' },
  { value: 'problems', label: '問' },
  { value: 'pages', label: 'ページ' },
  { value: 'chapters', label: '章' },
]

export default function GoalsContent({ goals: initialGoals, userId }: GoalsContentProps) {
  const [goals, setGoals] = useState(initialGoals)
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // フォーム状態
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalType, setGoalType] = useState<Goal['goal_type']>('daily')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('hours')

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  const handleCreateGoal = async () => {
    if (!title.trim() || !targetValue) return

    setIsSaving(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('roopynote_goals')
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          goal_type: goalType,
          target_value: parseInt(targetValue),
          current_value: 0,
          unit,
          start_date: new Date().toISOString().split('T')[0],
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      setGoals([data, ...goals])
      setShowForm(false)
      resetForm()
    } catch {
      alert('目標の作成に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    try {
      const supabase = createClient()
      const isCompleted = newValue >= goal.target_value

      const { error } = await supabase
        .from('roopynote_goals')
        .update({
          current_value: newValue,
          status: isCompleted ? 'completed' : 'active',
        })
        .eq('id', goalId)

      if (error) throw error

      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, current_value: newValue, status: isCompleted ? 'completed' : 'active' }
            : g
        )
      )
    } catch {
      alert('進捗の更新に失敗しました')
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('この目標を削除しますか？')) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('roopynote_goals')
        .update({ status: 'cancelled' })
        .eq('id', goalId)

      if (error) throw error

      setGoals((prev) => prev.filter((g) => g.id !== goalId))
    } catch {
      alert('目標の削除に失敗しました')
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setGoalType('daily')
    setTargetValue('')
    setUnit('hours')
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* 新規作成ボタン */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-semibold shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          新しい目標を設定
        </button>
      )}

      {/* 新規作成フォーム */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">新しい目標</h2>
            <button
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目標タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 数学を3時間勉強する"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目標タイプ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setGoalType(type.value as Goal['goal_type'])}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    goalType === type.value
                      ? 'bg-amber-100 border-amber-500 text-amber-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目標値
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="0"
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                単位
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="目標についてのメモ..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              rows={2}
            />
          </div>

          <button
            onClick={handleCreateGoal}
            disabled={isSaving || !title.trim() || !targetValue}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : '目標を作成'}
          </button>
        </div>
      )}

      {/* アクティブな目標 */}
      <div className="space-y-3">
        <h2 className="font-bold text-gray-800 px-1">進行中の目標</h2>
        {activeGoals.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              まだ目標がありません。
              <br />
              新しい目標を設定しましょう！
            </p>
          </div>
        ) : (
          activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateProgress={handleUpdateProgress}
              onDelete={handleDeleteGoal}
            />
          ))
        )}
      </div>

      {/* 達成した目標 */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800 px-1 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            達成した目標
          </h2>
          {completedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateProgress={handleUpdateProgress}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}
    </main>
  )
}

// 目標カードコンポーネント
function GoalCard({
  goal,
  onUpdateProgress,
  onDelete,
}: {
  goal: Goal
  onUpdateProgress: (goalId: string, newValue: number) => void
  onDelete: (goalId: string) => void
}) {
  const progress = Math.min((goal.current_value / goal.target_value) * 100, 100)
  const isCompleted = goal.status === 'completed'

  const getUnitLabel = (unit: string) => {
    const found = UNITS.find((u) => u.value === unit)
    return found?.label || unit
  }

  const getTypeLabel = (type: string) => {
    const found = GOAL_TYPES.find((t) => t.value === type)
    return found?.label || type
  }

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm ${
        isCompleted ? 'border-2 border-green-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isCompleted && <Check className="w-5 h-5 text-green-500" />}
            <h3 className="font-semibold text-gray-800">{goal.title}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{getTypeLabel(goal.goal_type)}</p>
        </div>
        {!isCompleted && (
          <button
            onClick={() => onDelete(goal.id)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* 進捗バー */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">
            {goal.current_value} / {goal.target_value} {getUnitLabel(goal.unit)}
          </span>
          <span
            className={`font-semibold ${
              isCompleted ? 'text-green-500' : 'text-amber-500'
            }`}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isCompleted
                ? 'bg-gradient-to-r from-green-400 to-green-500'
                : 'bg-gradient-to-r from-amber-400 to-orange-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 進捗更新ボタン（未完了のみ） */}
      {!isCompleted && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateProgress(goal.id, Math.max(0, goal.current_value - 1))}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            -1
          </button>
          <button
            onClick={() => onUpdateProgress(goal.id, goal.current_value + 1)}
            className="px-3 py-1.5 bg-amber-100 text-amber-600 rounded-lg text-sm hover:bg-amber-200 transition-colors"
          >
            +1
          </button>
          <button
            onClick={() => onUpdateProgress(goal.id, goal.target_value)}
            className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200 transition-colors ml-auto"
          >
            達成！
          </button>
        </div>
      )}

      {goal.description && (
        <p className="text-xs text-gray-500 mt-2 pt-2 border-t">{goal.description}</p>
      )}
    </div>
  )
}
