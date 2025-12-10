import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { ListeningQuestion, DailyListeningResponse } from '@/lib/types/database';

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
  // "2025-12-10" -> 20251210
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
  // JST (UTC+9) に変換
  const jstOffset = 9 * 60;
  const localOffset = now.getTimezoneOffset();
  const jstTime = new Date(now.getTime() + (jstOffset + localOffset) * 60 * 1000);

  const year = jstTime.getFullYear();
  const month = String(jstTime.getMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    // JSONファイルを読み込む
    const dataPath = path.join(process.cwd(), 'data', 'listening_questions.json');
    const rawData = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(rawData) as { questions: ListeningQuestion[] };

    // 有効な問題（audioUrlが設定されているもの）をフィルタリング
    // MVPでは audioUrl が空でも表示する（音声なしでもテキストで確認可能）
    const validQuestions = data.questions;

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { error: 'リスニング問題が見つかりません' },
        { status: 404 }
      );
    }

    // 今日の日付を取得
    const todayStr = getTodayDateString();
    const seed = getDateSeed(todayStr);

    // シードベースの乱数生成器を作成
    const random = seededRandom(seed);

    // 問題をシャッフルして3問選択
    const shuffledQuestions = shuffleArray(validQuestions, random);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(3, shuffledQuestions.length));

    const response: DailyListeningResponse = {
      questions: selectedQuestions,
      date: todayStr,
      totalQuestions: validQuestions.length,
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
