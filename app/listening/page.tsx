import DailyListening from '@/components/listening/DailyListening';

export const metadata = {
  title: '1分リスニングチェック | ムキムキ',
  description: '毎日3問のリスニング問題に挑戦しよう！',
};

export default function ListeningPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <DailyListening />
      </div>
    </div>
  );
}
