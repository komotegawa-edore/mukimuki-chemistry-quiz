'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Headphones, ChevronRight, ChevronLeft, Star, CheckCircle } from 'lucide-react';
import type { ListeningSet, ListeningSetsResponse } from '@/lib/types/database';

export default function ListeningSetsPage() {
  const [sets, setSets] = useState<ListeningSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const response = await fetch('/api/listening/sets');
      if (!response.ok) {
        throw new Error('セット一覧の取得に失敗しました');
      }
      const data: ListeningSetsResponse = await response.json();
      setSets(data.sets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E0F7F1] to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5DDFC3]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E0F7F1] to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-red-500 py-8">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F7F1] to-white pb-24">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>ホーム</span>
          </Link>
          <div className="flex items-center gap-3">
            <Headphones className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">リスニングセット</h1>
              <p className="text-white/80 text-sm">各セット3問で構成されています</p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Roopyメッセージ */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border-2 border-[#E0F7F1]">
          <div className="flex items-center gap-4">
            <Image src="/Roopy.png" alt="Roopy" width={60} height={60} className="flex-shrink-0" />
            <div>
              <p className="text-[#3A405A] text-sm">
                好きなセットを選んで挑戦しよう！<br />
                全問正解を目指してね 🎧
              </p>
            </div>
          </div>
        </div>

        {/* セット一覧 */}
        {sets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#3A405A] opacity-70">
              利用可能なセットがありません
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sets.map((set) => (
              <Link
                key={set.id}
                href={`/listening/sets/${set.id}`}
                className="block bg-white rounded-xl shadow-md p-5 border-2 border-[#E0F7F1] hover:border-[#5DDFC3] hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-[#5DDFC3] to-[#4ECFB3] w-12 h-12 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {set.orderNum}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3A405A] text-lg">
                        {set.title}
                      </h3>
                      {set.description && (
                        <p className="text-sm text-[#3A405A] opacity-70 mt-1">
                          {set.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-[#3A405A] opacity-70">
                          {set.questions.length}問
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#5DDFC3]" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* セット追加予定のお知らせ */}
        <div className="mt-8 bg-[#F4F9F7] rounded-xl p-4 border-2 border-dashed border-[#E0F7F1]">
          <p className="text-center text-[#3A405A] opacity-70 text-sm">
            セットは順次追加予定です！お楽しみに 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
