export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mukimuki_profiles: {
        Row: {
          id: string
          name: string
          role: 'student' | 'teacher'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role: 'student' | 'teacher'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'student' | 'teacher'
          created_at?: string
          updated_at?: string
        }
      }
      mukimuki_subjects: {
        Row: {
          id: number
          name: string
          description: string | null
          media_type: 'text' | 'image' | 'audio' | 'mixed'
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          media_type?: 'text' | 'image' | 'audio' | 'mixed'
          display_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          media_type?: 'text' | 'image' | 'audio' | 'mixed'
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      mukimuki_chapters: {
        Row: {
          id: number
          subject_id: number
          title: string
          order_num: number
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: number
          subject_id: number
          title: string
          order_num: number
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          subject_id?: number
          title?: string
          order_num?: number
          is_published?: boolean
          created_at?: string
        }
      }
      mukimuki_questions: {
        Row: {
          id: number
          chapter_id: number
          question_text: string
          choice_a: string
          choice_b: string
          choice_c: string
          choice_d: string
          correct_answer: 'A' | 'B' | 'C' | 'D'
          explanation: string | null
          question_image_url: string | null
          question_audio_url: string | null
          choice_a_image_url: string | null
          choice_b_image_url: string | null
          choice_c_image_url: string | null
          choice_d_image_url: string | null
          explanation_image_url: string | null
          media_type: 'text' | 'image' | 'audio' | 'mixed'
          is_published: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          chapter_id: number
          question_text: string
          choice_a: string
          choice_b: string
          choice_c: string
          choice_d: string
          correct_answer: 'A' | 'B' | 'C' | 'D'
          explanation?: string | null
          question_image_url?: string | null
          question_audio_url?: string | null
          choice_a_image_url?: string | null
          choice_b_image_url?: string | null
          choice_c_image_url?: string | null
          choice_d_image_url?: string | null
          explanation_image_url?: string | null
          media_type?: 'text' | 'image' | 'audio' | 'mixed'
          is_published?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          chapter_id?: number
          question_text?: string
          choice_a?: string
          choice_b?: string
          choice_c?: string
          choice_d?: string
          correct_answer?: 'A' | 'B' | 'C' | 'D'
          explanation?: string | null
          question_image_url?: string | null
          question_audio_url?: string | null
          choice_a_image_url?: string | null
          choice_b_image_url?: string | null
          choice_c_image_url?: string | null
          choice_d_image_url?: string | null
          explanation_image_url?: string | null
          media_type?: 'text' | 'image' | 'audio' | 'mixed'
          is_published?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mukimuki_test_results: {
        Row: {
          id: number
          user_id: string
          chapter_id: number
          subject_id: number
          score: number
          total: number
          answers: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          chapter_id: number
          subject_id: number
          score: number
          total: number
          answers?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          chapter_id?: number
          subject_id?: number
          score?: number
          total?: number
          answers?: Json | null
          created_at?: string
        }
      }
      mukimuki_daily_missions: {
        Row: {
          id: number
          user_id: string
          chapter_id: number
          mission_date: string
          time_limit_seconds: number
          reward_points: number
          status: string
          completed_at: string | null
          completion_time_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          chapter_id: number
          mission_date?: string
          time_limit_seconds?: number
          reward_points?: number
          status?: string
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          chapter_id?: number
          mission_date?: string
          time_limit_seconds?: number
          reward_points?: number
          status?: string
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
        }
      }
      mukimuki_system_settings: {
        Row: {
          id: number
          setting_key: string
          setting_value: string
          description: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: number
          setting_key: string
          setting_value: string
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: number
          setting_key?: string
          setting_value?: string
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      mukimuki_listening_questions: {
        Row: {
          id: string
          audio_url: string
          english_script: string
          jp_question: string
          choices: string[]
          answer_index: number
          tags: string[]
          level: number
          translation: string | null
          is_published: boolean
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id: string
          audio_url?: string
          english_script: string
          jp_question: string
          choices: string[]
          answer_index: number
          tags?: string[]
          level?: number
          translation?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          audio_url?: string
          english_script?: string
          jp_question?: string
          choices?: string[]
          answer_index?: number
          tags?: string[]
          level?: number
          translation?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_rank: {
        Args: {
          target_user_id: string
        }
        Returns: {
          rank: number
          total_points: number
          next_rank_points: number
        }[]
      }
      get_user_weekly_rank: {
        Args: {
          target_user_id: string
        }
        Returns: {
          rank: number
          weekly_points: number
        }[]
      }
      get_weekly_ranking: {
        Args: Record<string, never>
        Returns: {
          user_id: string
          user_name: string
          weekly_points: number
          rank: number
        }[]
      }
      get_user_total_points: {
        Args: {
          target_user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 型エイリアス
export type Profile = Database['public']['Tables']['mukimuki_profiles']['Row']
export type Subject = Database['public']['Tables']['mukimuki_subjects']['Row']
export type Chapter = Database['public']['Tables']['mukimuki_chapters']['Row']
export type Question = Database['public']['Tables']['mukimuki_questions']['Row']
export type TestResult = Database['public']['Tables']['mukimuki_test_results']['Row']
export type ListeningQuestionRow = Database['public']['Tables']['mukimuki_listening_questions']['Row']

export type Answer = 'A' | 'B' | 'C' | 'D'
export type MediaType = 'text' | 'image' | 'audio' | 'mixed'

export interface QuestionWithAnswer extends Question {
  userAnswer?: Answer
  isCorrect?: boolean
}

export interface TestResultDetail extends TestResult {
  chapter?: Chapter
  subject?: Subject
}

export interface ChapterWithSubject extends Chapter {
  subject?: Subject
}

export interface QuestionWithMedia extends Question {
  // メディアURLのヘルパープロパティ（必要に応じて）
}

// リスニング問題用の型定義
export interface ListeningQuestion {
  id: string                    // "L001" など
  audioUrl: string              // 生成されたmp3のURL
  englishScript: string         // 英語スクリプト（TTS生成用）
  jpQuestion: string            // 日本語の設問文
  choices: string[]             // 4択（配列）
  answerIndex: number           // 正解のインデックス（0〜3）
  tags: string[]                // タグ（例: ["time", "basic", "listening_check"]）
  level: number                 // 難易度（1,2,3など）
  translation?: string          // 英文の日本語訳（解説用、オプション）
}

// 「今日の3問」APIレスポンス型
export interface DailyListeningResponse {
  questions: ListeningQuestion[]  // 3問分
  date: string                    // "2025-12-10" のような文字列
  totalQuestions?: number         // 全問題数（オプション）
  seed?: number                   // シード値（オプション）
}

// リスニング結果の型
export interface ListeningResult {
  questionId: string
  userAnswer: number            // ユーザーの選択（0〜3）
  isCorrect: boolean
  timeSpent?: number            // 回答にかかった時間（秒）
}

// リスニングセッション結果
export interface ListeningSessionResult {
  date: string
  results: ListeningResult[]
  score: number                 // 正答数
  total: number                 // 問題数
  rank: 'S' | 'A' | 'B' | 'C'   // ランク
}
