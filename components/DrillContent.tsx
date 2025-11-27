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
    new Set(['japanese_history'])
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

  // 教科ごとにグループ化
  const decksBySubject = decks.reduce(
    (acc, deck) => {
      if (!acc[deck.subject]) {
        acc[deck.subject] = []
      }
      acc[deck.subject].push(deck)
      return acc
    },
    {} as Record<string, Deck[]>
  )

  // 教科名の日本語マッピング
  const subjectNames: Record<string, string> = {
    japanese_history: '日本史',
    english: '英語',
    chemistry: '化学',
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
        {Object.entries(decksBySubject).map(([subject, subjectDecks]) => {
          const isExpanded = expandedSubjects.has(subject)
          const totalCards = subjectDecks.reduce(
            (sum, deck) => sum + (deck.cards[0]?.count || 0),
            0
          )

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
                    {subjectDecks.length}セクション / {totalCards}問
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#5DDFC3] transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* デッキ一覧 */}
              {isExpanded && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectDecks.map((deck) => {
                      const cardCount = deck.cards[0]?.count || 0

                      return (
                        <Link
                          key={deck.id}
                          href={`/drill/${deck.id}`}
                          className="bg-gradient-to-br from-white to-[#F4F9F7] rounded-xl shadow-sm p-6 hover:shadow-lg hover:scale-105 transition-all border-2 border-[#E0F7F1]"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg text-[#3A405A]">
                              {deck.name}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-[#5DDFC3]" />
                          </div>

                          {deck.description && (
                            <p className="text-sm text-[#3A405A] opacity-70 mb-4">
                              {deck.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#5DDFC3]" />
                              <span className="text-sm text-[#3A405A]">
                                {cardCount}枚
                              </span>
                            </div>
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
    </main>
  )
}
