'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface OwnerProfile {
  id: string
  name: string
  email: string
  phone: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // フォームの状態
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/juku-admin/login')
      return
    }

    const { data: profileData } = await supabase
      .from('juku_owner_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setName(profileData.name || '')
      setEmail(profileData.email || user.email || '')
    }
    setLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // プロファイル情報を更新
      const { error: profileError } = await supabase
        .from('juku_owner_profiles')
        .update({ name })
        .eq('id', profile?.id)

      if (profileError) throw profileError

      // メールアドレスを変更する場合
      if (email !== profile?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        })
        if (emailError) throw emailError
        setMessage({ type: 'success', text: '確認メールを送信しました。メールを確認してください。' })
      } else {
        setMessage({ type: 'success', text: 'プロファイルを更新しました' })
      }

      // 状態を更新
      setProfile(prev => prev ? { ...prev, name, email } : null)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '更新に失敗しました' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '新しいパスワードが一致しません' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'パスワードは6文字以上で入力してください' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // 現在のパスワードで再認証
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: currentPassword
      })

      if (signInError) {
        throw new Error('現在のパスワードが正しくありません')
      }

      // 新しいパスワードに更新
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      setMessage({ type: 'success', text: 'パスワードを変更しました' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'パスワードの変更に失敗しました' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが見つかりません')

      // 関連するサイトを取得
      const { data: sites } = await supabase
        .from('juku_sites')
        .select('id')
        .eq('owner_id', user.id)

      // 各サイトの関連データを削除
      if (sites && sites.length > 0) {
        const siteIds = sites.map(s => s.id)

        // セクションを削除
        await supabase
          .from('juku_sections')
          .delete()
          .in('site_id', siteIds)

        // ブログ記事を削除
        await supabase
          .from('juku_blog_posts')
          .delete()
          .in('site_id', siteIds)

        // サイトを削除
        await supabase
          .from('juku_sites')
          .delete()
          .eq('owner_id', user.id)
      }

      // プロファイルを削除
      await supabase
        .from('juku_owner_profiles')
        .delete()
        .eq('id', user.id)

      // Supabase Authのアカウントは管理者権限が必要なので、
      // ここではログアウトしてユーザーに手動での削除を案内
      await supabase.auth.signOut()

      router.push('/juku-admin/login?deleted=true')
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'アカウント削除に失敗しました' })
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/juku-admin"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-gray-800">アカウント設定</h1>
          </div>
        </div>
      </header>

      {/* メッセージ */}
      {message && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* プロファイル設定 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">プロファイル設定</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                メールアドレスを変更すると、確認メールが送信されます
              </p>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存する'}
              </button>
            </div>
          </form>
        </div>

        {/* パスワード変更 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">パスワード変更</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現在のパスワード
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                minLength={6}
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? '変更中...' : 'パスワードを変更'}
              </button>
            </div>
          </form>
        </div>

        {/* アカウント削除 */}
        <div className="bg-white rounded-2xl p-6 border border-red-200">
          <h2 className="text-lg font-bold text-red-600 mb-2">アカウント削除</h2>
          <p className="text-gray-600 text-sm mb-6">
            アカウントを削除すると、作成したすべてのサイトとデータが完全に削除されます。この操作は取り消せません。
          </p>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            アカウントを削除
          </button>
        </div>
      </main>

      {/* 削除確認モーダル */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">本当に削除しますか？</h3>
            <p className="text-gray-500 text-sm mb-6">
              アカウントを削除すると、作成したすべてのサイト、ブログ記事、設定が完全に削除されます。この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? '削除中...' : '完全に削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
