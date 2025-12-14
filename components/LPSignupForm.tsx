'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react'

interface LPSignupFormProps {
  promo?: 'first-month-free' | 'early-450'
  buttonText?: string
  buttonClassName?: string
  theme?: 'dark' | 'light'
}

export default function LPSignupForm({
  promo,
  buttonText = '今すぐ始める',
  buttonClassName,
  theme = 'dark',
}: LPSignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. アカウント作成を試行
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          // 既存ユーザーの場合はログイン
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (signInError) {
            throw new Error('このメールアドレスは既に登録されています。パスワードが正しいか確認してください。')
          }
        } else {
          throw authError
        }
      } else {
        // 新規登録の場合、セッションがない可能性があるのでログインも実行
        // （メール確認が不要な設定の場合でも確実にセッションを取得）
        if (!authData.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (signInError) {
            throw new Error('アカウント作成後のログインに失敗しました。もう一度お試しください。')
          }
        }
      }

      // 2. すぐにStripe Checkoutへ
      const response = await fetch('/api/english/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceType: 'monthly',
          promo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Stripe Checkoutにリダイレクト
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setLoading(false)
    }
  }

  const isDark = theme === 'dark'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      <div>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`}>
          <Mail className={`w-5 h-5 ${isDark ? 'text-white/50' : 'text-gray-400'}`} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder:text-white/50' : 'text-gray-900 placeholder:text-gray-400'}`}
          />
        </div>
      </div>

      <div>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`}>
          <Lock className={`w-5 h-5 ${isDark ? 'text-white/50' : 'text-gray-400'}`} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード（6文字以上）"
            required
            minLength={6}
            className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder:text-white/50' : 'text-gray-900 placeholder:text-gray-400'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={isDark ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-600'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={buttonClassName || `w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 ${
          isDark
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105'
            : 'bg-cyan-600 text-white hover:bg-cyan-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            処理中...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            {buttonText}
          </span>
        )}
      </button>

      <p className={`text-xs text-center ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
        登録で<a href="/english/terms" className="underline">利用規約</a>と
        <a href="/english/privacy" className="underline">プライバシーポリシー</a>に同意したことになります
      </p>
    </form>
  )
}
