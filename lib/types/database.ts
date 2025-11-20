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
      mukimuki_chapters: {
        Row: {
          id: number
          title: string
          order_num: number
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          order_num: number
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          order_num?: number
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
          score: number
          total: number
          answers: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          chapter_id: number
          score: number
          total: number
          answers?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          chapter_id?: number
          score?: number
          total?: number
          answers?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 型エイリアス
export type Profile = Database['public']['Tables']['mukimuki_profiles']['Row']
export type Chapter = Database['public']['Tables']['mukimuki_chapters']['Row']
export type Question = Database['public']['Tables']['mukimuki_questions']['Row']
export type TestResult = Database['public']['Tables']['mukimuki_test_results']['Row']

export type Answer = 'A' | 'B' | 'C' | 'D'

export interface QuestionWithAnswer extends Question {
  userAnswer?: Answer
  isCorrect?: boolean
}

export interface TestResultDetail extends TestResult {
  chapter?: Chapter
}
