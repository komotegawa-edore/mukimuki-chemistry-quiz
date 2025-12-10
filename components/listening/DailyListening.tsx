'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Volume2, Play, RefreshCw, CheckCircle, XCircle, Headphones, Sparkles, Star, Coins } from 'lucide-react';
import type { ListeningQuestion, DailyListeningResponse, ListeningResult, ListeningSessionResult } from '@/lib/types/database';

type GameState = 'start' | 'playing' | 'answered' | 'result';

// ランクを計算する関数
function calculateRank(score: number, total: number): 'S' | 'A' | 'B' | 'C' {
  const percentage = (score / total) * 100;
  if (percentage === 100) return 'S';
  if (percentage >= 67) return 'A';
  if (percentage >= 34) return 'B';
  return 'C';
}

// ランクに応じた色とメッセージを返す
function getRankInfo(rank: 'S' | 'A' | 'B' | 'C'): { color: string; bg: string; message: string; roopyMessage: string } {
  switch (rank) {
    case 'S':
      return {
        color: 'text-yellow-500',
        bg: 'bg-gradient-to-br from-yellow-100 to-yellow-50',
        message: 'パーフェクト！',
        roopyMessage: 'すごい！完璧だよ！🎉',
      };
    case 'A':
      return {
        color: 'text-[#5DDFC3]',
        bg: 'bg-gradient-to-br from-[#E0F7F1] to-white',
        message: 'よくできました！',
        roopyMessage: 'いい調子！この調子で頑張ろう！',
      };
    case 'B':
      return {
        color: 'text-blue-500',
        bg: 'bg-gradient-to-br from-blue-50 to-white',
        message: 'もう少し！',
        roopyMessage: '惜しい！明日もチャレンジしよう！',
      };
    case 'C':
      return {
        color: 'text-[#3A405A]',
        bg: 'bg-gradient-to-br from-gray-50 to-white',
        message: 'ドンマイ！',
        roopyMessage: '毎日続けることが大事だよ！💪',
      };
  }
}

export default function DailyListening() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<ListeningResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 問題を取得
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/listening/daily');
      if (!response.ok) {
        throw new Error('問題の取得に失敗しました');
      }

      const data: DailyListeningResponse = await response.json();
      setQuestions(data.questions);
      setDate(data.date);
    } catch (err) {
      setError(err instanceof Error ? err.message : '問題の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // 音声再生
  const playAudio = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentQuestion.audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      setPlayCount(prev => prev + 1);
    };
    audio.onerror = () => setIsPlaying(false);

    audio.play().catch(() => setIsPlaying(false));
  }, [questions, currentQuestionIndex]);

  // 音声停止
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // ゲーム開始
  const startGame = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setResults([]);
    setSelectedAnswer(null);
    setPlayCount(0);
  };

  // 回答を選択して確定
  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState !== 'playing') return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.answerIndex;

    setSelectedAnswer(answerIndex);
    setGameState('answered');

    // 結果を記録
    const result: ListeningResult = {
      questionId: currentQuestion.id,
      userAnswer: answerIndex,
      isCorrect,
    };
    setResults(prev => [...prev, result]);

    // 音声を停止
    stopAudio();
  };

  // 次の問題へ（または結果画面へ）
  const goToNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setGameState('playing');
      setPlayCount(0);
    } else {
      // 全問終了 - 結果をAPIに送信
      const lastResult = results[results.length - 1];
      if (lastResult) {
        try {
          const response = await fetch('/api/listening/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: lastResult.questionId,
              isCorrect: lastResult.isCorrect,
              userAnswer: lastResult.userAnswer,
              timeSpent: lastResult.timeSpent,
            }),
          });
          const data = await response.json();
          if (data.pointsEarned !== undefined) {
            setPointsEarned(data.pointsEarned);
          }
        } catch (error) {
          console.error('Failed to save listening result:', error);
        }
      }
      setGameState('result');
    }
  };

  // もう一度やる
  const restartGame = () => {
    fetchQuestions();
    setGameState('start');
    setCurrentQuestionIndex(0);
    setResults([]);
    setSelectedAnswer(null);
    setPlayCount(0);
  };

  // 結果計算
  const sessionResult: ListeningSessionResult | null = gameState === 'result' ? {
    date,
    results,
    score: results.filter(r => r.isCorrect).length,
    total: questions.length,
    rank: calculateRank(results.filter(r => r.isCorrect).length, questions.length),
  } : null;

  // ローディング中
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#E0F7F1] to-white rounded-2xl shadow-md p-8 border-2 border-[#E0F7F1]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5DDFC3] mb-4"></div>
          <p className="text-[#3A405A] opacity-70">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 border-2 border-[#E0F7F1]">
        <div className="flex flex-col items-center">
          <Image src="/Roopy.png" alt="Roopy" width={80} height={80} className="mb-4 opacity-50" />
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchQuestions}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DDFC3] text-white rounded-xl hover:bg-[#4ECFB3] transition-colors font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // スタート画面
  if (gameState === 'start') {
    return (
      <div className="bg-gradient-to-br from-[#E0F7F1] to-white rounded-2xl shadow-md p-6 border-2 border-[#E0F7F1] relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles className="w-32 h-32 text-[#5DDFC3]" />
        </div>

        <div className="relative z-10">
          {/* ヘッダー */}
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="w-6 h-6 text-[#5DDFC3]" />
            <h3 className="text-xl font-bold text-[#3A405A]">1分リスニングチェック</h3>
          </div>

          {/* Roopyとメッセージ */}
          <div className="flex items-center gap-4 mb-6">
            <Image src="/Roopy.png" alt="Roopy" width={80} height={80} className="flex-shrink-0" />
            <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-[#3A405A] text-sm">
                今日のリスニング問題だよ！<br />
                英語を聞いて、質問に答えてね 🎧
              </p>
            </div>
          </div>

          {/* 問題情報 */}
          <div className="bg-white/40 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[#3A405A]">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">今日の1問</span>
              </div>
              <span className="text-sm opacity-70">{date}</span>
            </div>
          </div>

          {/* スタートボタン */}
          <button
            onClick={startGame}
            disabled={questions.length === 0}
            className="w-full bg-[#5DDFC3] text-white py-4 rounded-xl font-bold hover:bg-[#4ECFB3] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            スタート
          </button>

          <p className="text-[#3A405A] opacity-60 text-xs mt-3 text-center">
            毎日チャレンジしてリスニング力をアップ！
          </p>
        </div>
      </div>
    );
  }

  // プレイ中 or 回答後
  if (gameState === 'playing' || gameState === 'answered') {
    const currentQuestion = questions[currentQuestionIndex];
    const hasAudio = !!currentQuestion.audioUrl;

    return (
      <div className="bg-white rounded-2xl shadow-md border-2 border-[#E0F7F1] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Headphones className="w-5 h-5" />
              <span className="font-semibold">リスニング</span>
            </div>
            <div className="flex gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < currentQuestionIndex
                      ? results[i]?.isCorrect
                        ? 'bg-white'
                        : 'bg-white/40'
                      : i === currentQuestionIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* 問題番号 */}
          <div className="text-center mb-4">
            <span className="text-sm text-[#3A405A] opacity-70">
              問題 {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          {/* 音声プレイヤー */}
          <div className="mb-6">
            {hasAudio ? (
              <button
                onClick={isPlaying ? stopAudio : playAudio}
                className={`w-full flex items-center justify-center gap-3 py-5 rounded-xl transition-all border-2 ${
                  isPlaying
                    ? 'bg-[#5DDFC3] text-white border-[#5DDFC3]'
                    : 'bg-[#F4F9F7] text-[#3A405A] border-[#E0F7F1] hover:border-[#5DDFC3] hover:bg-[#E0F7F1]'
                }`}
              >
                <Volume2 className={`w-8 h-8 ${isPlaying ? 'animate-pulse' : ''}`} />
                <div className="text-left">
                  <span className="font-semibold block">
                    {isPlaying ? '再生中...' : '音声を再生する'}
                  </span>
                  {playCount > 0 && !isPlaying && (
                    <span className="text-xs opacity-70">再生回数: {playCount}回</span>
                  )}
                </div>
              </button>
            ) : (
              // 音声がない場合はスクリプトを表示
              <div className="bg-[#F4F9F7] rounded-xl p-4 border-2 border-[#E0F7F1]">
                <p className="text-sm text-[#3A405A] opacity-70 mb-2">📝 英文スクリプト</p>
                <p className="text-[#3A405A] italic leading-relaxed">
                  &ldquo;{currentQuestion.englishScript}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* 質問 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#3A405A] text-center">
              {currentQuestion.jpQuestion}
            </h3>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3 mb-6">
            {currentQuestion.choices.map((choice, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.answerIndex;
              const showResult = gameState === 'answered';

              let borderColor = 'border-[#E0F7F1]';
              let bgColor = 'bg-white';
              let textColor = 'text-[#3A405A]';

              if (showResult) {
                if (isCorrect) {
                  borderColor = 'border-[#5DDFC3]';
                  bgColor = 'bg-[#E0F7F1]';
                } else if (isSelected && !isCorrect) {
                  borderColor = 'border-red-400';
                  bgColor = 'bg-red-50';
                } else {
                  bgColor = 'bg-gray-50';
                  textColor = 'text-gray-400';
                }
              } else if (isSelected) {
                borderColor = 'border-[#5DDFC3]';
                bgColor = 'bg-[#F4F9F7]';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={gameState === 'answered'}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${borderColor} ${bgColor} ${textColor} ${
                    gameState === 'playing' ? 'hover:border-[#5DDFC3] hover:bg-[#F4F9F7] active:scale-[0.98]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        showResult && isCorrect
                          ? 'bg-[#5DDFC3] text-white'
                          : showResult && isSelected && !isCorrect
                          ? 'bg-red-400 text-white'
                          : 'bg-[#E0F7F1] text-[#3A405A]'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium">{choice}</span>
                    </div>
                    {showResult && isCorrect && (
                      <CheckCircle className="w-6 h-6 text-[#5DDFC3]" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 回答後のフィードバック */}
          {gameState === 'answered' && (
            <div className="space-y-4">
              {/* 結果表示 */}
              <div className={`p-4 rounded-xl ${
                results[results.length - 1]?.isCorrect
                  ? 'bg-[#E0F7F1]'
                  : 'bg-red-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Image src="/Roopy.png" alt="Roopy" width={48} height={48} />
                  <p className={`font-semibold ${
                    results[results.length - 1]?.isCorrect
                      ? 'text-[#3A405A]'
                      : 'text-red-600'
                  }`}>
                    {results[results.length - 1]?.isCorrect
                      ? '正解！ Great job! 🎉'
                      : '残念... 次は頑張ろう！'}
                  </p>
                </div>
              </div>

              {/* 英語スクリプト */}
              <div className="p-4 bg-white rounded-xl border-2 border-[#E0F7F1]">
                <p className="text-sm text-[#3A405A] opacity-70 mb-2">📝 英語スクリプト</p>
                <p className="text-[#3A405A] italic leading-relaxed">
                  &ldquo;{currentQuestion.englishScript}&rdquo;
                </p>
              </div>

              {/* 日本語訳 */}
              {currentQuestion.translation && (
                <div className="p-4 bg-[#F4F9F7] rounded-xl border-l-4 border-[#5DDFC3]">
                  <p className="text-sm text-[#3A405A] opacity-70 mb-1">📖 日本語訳</p>
                  <p className="text-[#3A405A] text-sm leading-relaxed">
                    {currentQuestion.translation}
                  </p>
                </div>
              )}

              {/* 次へボタン */}
              <button
                onClick={goToNextQuestion}
                className="w-full py-4 bg-[#5DDFC3] text-white font-bold rounded-xl hover:bg-[#4ECFB3] transition-colors shadow-md"
              >
                {currentQuestionIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 結果画面
  if (gameState === 'result' && sessionResult) {
    const rankInfo = getRankInfo(sessionResult.rank);

    return (
      <div className={`${rankInfo.bg} rounded-2xl shadow-md border-2 border-[#E0F7F1] overflow-hidden`}>
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-[#5DDFC3] to-[#4ECFB3] px-6 py-4 text-center">
          <h2 className="text-xl font-bold text-white">リスニングチェック結果</h2>
          <p className="text-white/80 text-sm">{sessionResult.date}</p>
        </div>

        <div className="p-6">
          {/* Roopyとメッセージ */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/Roopy.png"
              alt="Roopy"
              width={100}
              height={100}
              className="mb-4"
            />
            <p className="text-[#3A405A] text-center font-medium">
              {rankInfo.roopyMessage}
            </p>
          </div>

          {/* スコア */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-1 mb-2">
              <span className="text-6xl font-bold text-[#5DDFC3]">{sessionResult.score}</span>
              <span className="text-2xl text-[#3A405A] opacity-50">/{sessionResult.total}</span>
            </div>
            <p className="text-[#3A405A] opacity-70">正解</p>
          </div>

          {/* ランク */}
          <div className="text-center mb-6">
            <div className={`inline-block px-8 py-4 rounded-2xl ${rankInfo.bg} border-2 border-[#E0F7F1]`}>
              <p className="text-sm text-[#3A405A] opacity-70 mb-1">ランク</p>
              <span className={`text-6xl font-bold ${rankInfo.color}`}>
                {sessionResult.rank}
              </span>
              <p className={`text-sm font-semibold mt-1 ${rankInfo.color}`}>
                {rankInfo.message}
              </p>
            </div>
          </div>

          {/* ポイント獲得表示 */}
          {pointsEarned !== null && pointsEarned > 0 && (
            <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-6 h-6 text-yellow-500" />
                <span className="text-lg font-bold text-yellow-700">
                  +{pointsEarned}ポイント獲得！
                </span>
              </div>
              <p className="text-center text-sm text-yellow-600 mt-1">
                デイリーリスニングクエスト達成！
              </p>
            </div>
          )}

          {/* 問題別結果 */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#3A405A] mb-3">結果</p>
            <div className="flex justify-center gap-4">
              {sessionResult.results.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                    result.isCorrect
                      ? 'bg-[#E0F7F1] border-2 border-[#5DDFC3]'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <span className="text-xs text-[#3A405A] opacity-70">Q{index + 1}</span>
                  {result.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-[#5DDFC3]" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* もう一度やるボタン */}
          <button
            onClick={restartGame}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#5DDFC3] text-white font-bold rounded-xl hover:bg-[#4ECFB3] transition-colors shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            もう一度チャレンジ
          </button>
        </div>
      </div>
    );
  }

  return null;
}
