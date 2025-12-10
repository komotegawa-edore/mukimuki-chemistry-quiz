import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ListeningQuestion, ListeningSet, ListeningSetsResponse } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

interface QuestionRow {
  id: string;
  audio_url: string;
  english_script: string;
  jp_question: string;
  choices: string[];
  answer_index: number;
  tags: string[];
  level: number;
  translation: string | null;
  set_id: number | null;
}

function toListeningQuestion(row: QuestionRow): ListeningQuestion {
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

    // 公開されているセットを取得
    const { data: sets, error: setsError } = await supabase
      .from('mukimuki_listening_sets')
      .select('*')
      .eq('is_published', true)
      .order('order_num');

    if (setsError) {
      console.error('Supabaseエラー:', setsError);
      return NextResponse.json(
        { error: 'リスニングセットの取得に失敗しました' },
        { status: 500 }
      );
    }

    if (!sets || sets.length === 0) {
      return NextResponse.json(
        { error: 'リスニングセットが見つかりません' },
        { status: 404 }
      );
    }

    // 全ての問題を取得
    const { data: questions, error: questionsError } = await supabase
      .from('mukimuki_listening_questions')
      .select('*')
      .eq('is_published', true)
      .not('set_id', 'is', null)
      .order('id');

    if (questionsError) {
      console.error('問題取得エラー:', questionsError);
      return NextResponse.json(
        { error: 'リスニング問題の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 問題をセットごとにグループ化
    const questionsBySet = (questions || []).reduce((acc: Record<number, QuestionRow[]>, q: QuestionRow) => {
      if (q.set_id) {
        if (!acc[q.set_id]) {
          acc[q.set_id] = [];
        }
        acc[q.set_id].push(q);
      }
      return acc;
    }, {});

    // セットに問題を紐付け
    const listeningSets: ListeningSet[] = sets.map(set => ({
      id: set.id,
      title: set.title,
      description: set.description,
      orderNum: set.order_num,
      questions: (questionsBySet[set.id] || []).map(toListeningQuestion),
    }));

    // 3問揃っているセットのみフィルタリング
    const completeSets = listeningSets.filter(set => set.questions.length >= 3);

    const response: ListeningSetsResponse = {
      sets: completeSets,
      totalSets: completeSets.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('リスニングセット取得エラー:', error);
    return NextResponse.json(
      { error: 'リスニングセットの取得に失敗しました' },
      { status: 500 }
    );
  }
}
