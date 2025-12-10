import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ListeningQuestion, DailyListeningResponse, ListeningQuestionRow } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

// シンプルなシードベースの乱数生成器
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// 日付からシード値を生成
function getDateSeed(dateStr: string): number {
  return parseInt(dateStr.replace(/-/g, ''), 10);
}

// 配列をシャッフル（Fisher-Yates）
function shuffleArray<T>(array: T[], random: () => number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 今日の日付を取得（JST）
function getTodayDateString(): string {
  const now = new Date();
  const jstOffset = 9 * 60;
  const localOffset = now.getTimezoneOffset();
  const jstTime = new Date(now.getTime() + (jstOffset + localOffset) * 60 * 1000);

  const year = jstTime.getFullYear();
  const month = String(jstTime.getMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// DBの行をフロントエンド用の型に変換
function toListeningQuestion(row: ListeningQuestionRow): ListeningQuestion {
  return {
    id: row.id,
    audioUrl: row.audio_url,
    englishScript: row.english_script,
    jpQuestion: row.jp_question,
    choices: row.choices,
    answerIndex: row.answer_index,
    tags: row.tags,
    level: row.level,
    translation: row.translation ?? undefined,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    // 公開されているリスニング問題を取得
    const { data, error } = await supabase
      .from('mukimuki_listening_questions')
      .select('*')
      .eq('is_published', true)
      .order('id');

    if (error) {
      console.error('Supabaseエラー:', error);
      return NextResponse.json(
        { error: 'リスニング問題の取得に失敗しました' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'リスニング問題が見つかりません' },
        { status: 404 }
      );
    }

    // フロントエンド用の型に変換
    const questions = data.map(toListeningQuestion);

    // 今日の日付を取得
    const todayStr = getTodayDateString();
    const seed = getDateSeed(todayStr);

    // シードベースの乱数生成器を作成
    const random = seededRandom(seed);

    // 問題をシャッフルして3問選択
    const shuffledQuestions = shuffleArray(questions, random);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(3, shuffledQuestions.length));

    const response: DailyListeningResponse = {
      questions: selectedQuestions,
      date: todayStr,
      totalQuestions: questions.length,
      seed: seed,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('リスニング問題取得エラー:', error);
    return NextResponse.json(
      { error: 'リスニング問題の取得に失敗しました' },
      { status: 500 }
    );
  }
}
