import { createClient } from '@/lib/supabase/server'

export type UserRole = 'student' | 'teacher'

export interface UserProfile {
  id: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

/**
 * サーバーサイドで現在のユーザー情報を取得
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * サーバーサイドで現在のユーザープロフィールを取得
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('mukimuki_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  // プロフィールが存在しない場合は作成を試みる
  if (!data) {
    console.warn('Profile not found, creating default profile for user:', user.id)

    // user_metadataからreferred_byを取得
    const referredBy = user.user_metadata?.referred_by || null
    console.log('Creating profile with referred_by:', referredBy)

    const { data: newProfile, error: insertError } = await supabase
      .from('mukimuki_profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー',
        role: 'student',
        referred_by: referredBy,
        bonus_daily_quests: referredBy ? 1 : 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating profile:', insertError)
      return null
    }

    // 紹介関係を記録
    if (referredBy) {
      const { error: referralError } = await supabase
        .from('mukimuki_referrals')
        .insert({
          referrer_id: referredBy,
          referred_id: user.id,
          status: 'pending',
        })
      if (referralError) {
        console.error('Error creating referral record:', referralError)
      }
    }

    return newProfile as UserProfile
  }

  return data as UserProfile
}

/**
 * ユーザーが講師かどうかを判定
 */
export async function isTeacher(): Promise<boolean> {
  const profile = await getCurrentProfile()
  return profile?.role === 'teacher'
}

/**
 * ユーザーが生徒かどうかを判定
 */
export async function isStudent(): Promise<boolean> {
  const profile = await getCurrentProfile()
  return profile?.role === 'student'
}

/**
 * 講師権限が必要なページで使用
 */
export async function requireTeacher() {
  const teacher = await isTeacher()
  if (!teacher) {
    throw new Error('Teacher access required')
  }
}
