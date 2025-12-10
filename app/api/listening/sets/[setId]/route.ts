import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ListeningQuestion, ListeningSet } from '@/lib/types/database';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params;
    const setIdNum = parseInt(setId, 10);

    if (isNaN(setIdNum)) {
      return NextResponse.json(
        { error: '無効なセットIDです' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // セット情報を取得
    const { data: set, error: setError } = await supabase
      .from('mukimuki_listening_sets')
      .select('*')
      .eq('id', setIdNum)
      .eq('is_published', true)
      .single();

    if (setError || !set) {
      return NextResponse.json(
        { error: 'セットが見つかりません' },
        { status: 404 }
      );
    }

    // セットの問題を取得
    const { data: questions, error: questionsError } = await supabase
      .from('mukimuki_listening_questions')
      .select('*')
      .eq('set_id', setIdNum)
      .eq('is_published', true)
      .order('id');

    if (questionsError) {
      console.error('問題取得エラー:', questionsError);
      return NextResponse.json(
        { error: 'リスニング問題の取得に失敗しました' },
        { status: 500 }
      );
    }

    const listeningSet: ListeningSet = {
      id: set.id,
      title: set.title,
      description: set.description,
      orderNum: set.order_num,
      questions: (questions || []).map(toListeningQuestion),
    };

    // 次のセットIDを取得
    const { data: nextSet } = await supabase
      .from('mukimuki_listening_sets')
      .select('id')
      .eq('is_published', true)
      .gt('order_num', set.order_num)
      .order('order_num')
      .limit(1)
      .single();

    return NextResponse.json({
      set: listeningSet,
      nextSetId: nextSet?.id || null,
    });
  } catch (error) {
    console.error('リスニングセット取得エラー:', error);
    return NextResponse.json(
      { error: 'リスニングセットの取得に失敗しました' },
      { status: 500 }
    );
  }
}
