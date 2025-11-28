'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, ChevronRight, ChevronDown, Layers } from 'lucide-react'

interface Deck {
  id: number
  name: string
  description: string | null
  subject: string
  category: string | null
  display_order: number
  is_published: boolean
  cards: { count: number }[]
}

interface DrillContentProps {
  decks: Deck[]
  progressMap: Map<number, string>
}

export default function DrillContent({ decks, progressMap }: DrillContentProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set()
  )
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subject)) {
        newSet.delete(subject)
      } else {
        newSet.add(subject)
      }
      return newSet
    })
  }

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey)
      } else {
        newSet.add(categoryKey)
      }
      return newSet
    })
  }

  // 教科ごと→カテゴリごとにグループ化
  const decksBySubjectAndCategory = decks.reduce(
    (acc, deck) => {
      if (!acc[deck.subject]) {
        acc[deck.subject] = {}
      }
      const category = deck.category || 'その他'
      if (!acc[deck.subject][category]) {
        acc[deck.subject][category] = []
      }
      acc[deck.subject][category].push(deck)
      return acc
    },
    {} as Record<string, Record<string, Deck[]>>
  )

  // 教科名の日本語マッピング
  const subjectNames: Record<string, string> = {
    japanese_history: '日本史',
    english: '英語',
    chemistry: '化学',
    classical_japanese: '古文',
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-[#E0F7F1] to-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex items-center gap-4">
          <Image
            src="/Roopy.png"
            alt="Roopy"
            width={80}
            height={80}
            className="flex-shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#3A405A] mb-2">
              ドリル
            </h1>
            <p className="text-[#3A405A] text-sm opacity-80">
              単語カードで知識を定着させましょう
            </p>
          </div>
        </div>
      </div>

      {/* デッキがない場合 */}
      {decks.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Layers className="w-16 h-16 text-[#5DDFC3] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#3A405A] mb-2">
            まだデッキがありません
          </h2>
          <p className="text-[#3A405A] opacity-70">
            講師がデッキを作成するとここに表示されます
          </p>
        </div>
      )}

      {/* 教科ごとのデッキ一覧 */}
      <div className="space-y-6">
        {Object.entries(decksBySubjectAndCategory).map(([subject, categories]) => {
          const isSubjectExpanded = expandedSubjects.has(subject)
          const allDecksInSubject = Object.values(categories).flat()
          const totalCards = allDecksInSubject.reduce(
            (sum, deck) => sum + (deck.cards[0]?.count || 0),
            0
          )
          const totalSections = allDecksInSubject.length
          const categoryCount = Object.keys(categories).length

          return (
            <div
              key={subject}
              className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-[#E0F7F1]"
            >
              {/* 教科ヘッダー */}
              <button
                onClick={() => toggleSubject(subject)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F4F9F7] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-[#5DDFC3]" />
                  <h2 className="text-xl font-semibold text-[#3A405A]">
                    {subjectNames[subject] || subject}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#3A405A] opacity-70">
                    {categoryCount}教材 / {totalSections}セクション / {totalCards}問
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#5DDFC3] transition-transform ${
                      isSubjectExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* カテゴリ一覧 */}
              {isSubjectExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {Object.entries(categories).map(([category, categoryDecks]) => {
                    const categoryKey = `${subject}-${category}`
                    const isCategoryExpanded = expandedCategories.has(categoryKey)
                    const categoryTotalCards = categoryDecks.reduce(
                      (sum, deck) => sum + (deck.cards[0]?.count || 0),
                      0
                    )

                    return (
                      <div
                        key={categoryKey}
                        className="bg-[#F4F9F7] rounded-lg overflow-hidden"
                      >
                        {/* カテゴリヘッダー */}
                        <button
                          onClick={() => toggleCategory(categoryKey)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#E0F7F1] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-[#5DDFC3]" />
                            <h3 className="font-medium text-[#3A405A]">
                              {category}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#3A405A] opacity-70">
                              {categoryDecks.length}セクション / {categoryTotalCards}問
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-[#5DDFC3] transition-transform ${
                                isCategoryExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* デッキ一覧 */}
                        {isCategoryExpanded && (
                          <div className="px-4 pb-4 pt-2">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {categoryDecks.map((deck) => {
                                const cardCount = deck.cards[0]?.count || 0

                                return (
                                  <Link
                                    key={deck.id}
                                    href={`/drill/${deck.id}`}
                                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md hover:scale-105 transition-all border border-[#E0F7F1]"
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <h4 className="font-medium text-sm text-[#3A405A] line-clamp-2">
                                        {deck.name}
                                      </h4>
                                      <ChevronRight className="w-4 h-4 text-[#5DDFC3] flex-shrink-0" />
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                      <Layers className="w-3 h-3 text-[#5DDFC3]" />
                                      <span className="text-xs text-[#3A405A] opacity-70">
                                        {cardCount}枚
                                      </span>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
