'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { JukuLPSection, LPSectionType, lpSectionTypeLabels } from '../../juku/types'
import {
  Image,
  Clock,
  Gift,
  Calendar,
  MessageSquare,
  TrendingUp,
  DollarSign,
  HelpCircle,
  Megaphone,
  Mail,
  Camera,
} from 'lucide-react'

interface Props {
  sections: JukuLPSection[]
  selectedSection: JukuLPSection | null
  onSelect: (section: JukuLPSection) => void
  onReorder: (sections: JukuLPSection[]) => void
  onAdd: (type: LPSectionType) => void
  onDelete: (sectionId: string) => void
  onToggleVisibility: (section: JukuLPSection) => void
}

// セクションタイプのアイコン
const sectionIcons: Record<LPSectionType, React.ReactNode> = {
  lp_hero: <Image className="w-5 h-5" />,
  countdown: <Clock className="w-5 h-5" />,
  campaign: <Gift className="w-5 h-5" />,
  curriculum: <Calendar className="w-5 h-5" />,
  testimonials: <MessageSquare className="w-5 h-5" />,
  before_after: <TrendingUp className="w-5 h-5" />,
  lp_pricing: <DollarSign className="w-5 h-5" />,
  lp_faq: <HelpCircle className="w-5 h-5" />,
  lp_cta: <Megaphone className="w-5 h-5" />,
  lp_contact: <Mail className="w-5 h-5" />,
  lp_gallery: <Camera className="w-5 h-5" />,
}

// ソータブルアイテム
function SortableItem({
  section,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisibility,
}: {
  section: JukuLPSection
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onToggleVisibility: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${
        isSelected
          ? 'bg-blue-50 border-2 border-blue-500'
          : 'bg-white border border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* ドラッグハンドル */}
      <button
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* アイコン */}
      <div className={`text-gray-500 ${!section.is_visible ? 'opacity-40' : ''}`}>
        {sectionIcons[section.type as LPSectionType]}
      </div>

      {/* ラベル */}
      <span className={`flex-1 text-sm font-medium ${!section.is_visible ? 'text-gray-400' : 'text-gray-700'}`}>
        {lpSectionTypeLabels[section.type as LPSectionType]}
      </span>

      {/* アクション */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility()
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          title={section.is_visible ? '非表示にする' : '表示する'}
        >
          {section.is_visible ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
          title="削除"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function LPSectionList({
  sections,
  selectedSection,
  onSelect,
  onReorder,
  onAdd,
  onDelete,
  onToggleVisibility,
}: Props) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      const newSections = arrayMove(sections, oldIndex, newIndex)
      onReorder(newSections)
    }
  }

  const availableSections: LPSectionType[] = [
    'lp_hero',
    'countdown',
    'campaign',
    'curriculum',
    'testimonials',
    'before_after',
    'lp_pricing',
    'lp_faq',
    'lp_cta',
    'lp_contact',
    'lp_gallery',
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800">セクション</h2>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            追加
          </button>

          {/* 追加メニュー */}
          {showAddMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAddMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 max-h-80 overflow-y-auto">
                {availableSections.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      onAdd(type)
                      setShowAddMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span className="text-gray-400">
                      {sectionIcons[type]}
                    </span>
                    {lpSectionTypeLabels[type]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* セクションリスト */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                isSelected={selectedSection?.id === section.id}
                onSelect={() => onSelect(section)}
                onDelete={() => onDelete(section.id)}
                onToggleVisibility={() => onToggleVisibility(section)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">セクションがありません</p>
          <p className="text-sm">「追加」からセクションを追加してください</p>
        </div>
      )}
    </div>
  )
}
