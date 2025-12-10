'use client';

import { use } from 'react';
import DailyListening from '@/components/listening/DailyListening';

interface SetPageProps {
  params: Promise<{ setId: string }>;
}

export default function ListeningSetPage({ params }: SetPageProps) {
  const { setId } = use(params);
  const setIdNum = parseInt(setId, 10);

  if (isNaN(setIdNum)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E0F7F1] to-white flex items-center justify-center">
        <p className="text-red-500">無効なセットIDです</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F7F1] to-white pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <DailyListening setId={setIdNum} isDaily={false} />
      </div>
    </div>
  );
}
