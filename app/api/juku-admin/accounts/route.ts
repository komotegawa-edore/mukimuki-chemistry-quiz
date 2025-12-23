import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/helpers'

// Admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generate a random password
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// POST: Create new account
export async function POST(request: NextRequest) {
  try {
    // Check if user is teacher (admin)
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, phone, sendEmail } = body

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Generate temporary password
    const tempPassword = generatePassword()

    // Create user with Supabase Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Skip email confirmation
    })

    if (authError) {
      console.error('Auth error:', authError)
      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'アカウント作成に失敗しました: ' + authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'ユーザーの作成に失敗しました' },
        { status: 500 }
      )
    }

    // Create juku_owner_profiles entry
    const { error: profileError } = await supabaseAdmin
      .from('juku_owner_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        phone: phone || null,
        is_active: true,
        sales_status: 'converted',
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Try to clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'プロファイル作成に失敗しました: ' + profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      email,
      tempPassword,
      message: 'アカウントを作成しました',
    })
  } catch (error) {
    console.error('Create account error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// PATCH: Toggle account status (enable/disable)
export async function PATCH(request: NextRequest) {
  try {
    // Check if user is teacher (admin)
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, isActive } = body

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and isActive are required' },
        { status: 400 }
      )
    }

    // Update is_active in juku_owner_profiles
    const { error: profileError } = await supabaseAdmin
      .from('juku_owner_profiles')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: 'ステータス更新に失敗しました: ' + profileError.message },
        { status: 500 }
      )
    }

    // If disabling, also ban the user in Supabase Auth
    if (!isActive) {
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: '876000h' } // Ban for 100 years
      )

      if (banError) {
        console.error('Ban error:', banError)
        // Don't fail the request, just log the error
      }
    } else {
      // If enabling, unban the user
      const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: 'none' }
      )

      if (unbanError) {
        console.error('Unban error:', unbanError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: isActive ? 'アカウントを有効化しました' : 'アカウントを無効化しました',
    })
  } catch (error) {
    console.error('Toggle account error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// DELETE: Delete account
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is teacher (admin)
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Delete from juku_owner_profiles first (due to foreign key constraints)
    const { error: profileError } = await supabaseAdmin
      .from('juku_owner_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile delete error:', profileError)
      return NextResponse.json(
        { error: 'プロファイル削除に失敗しました: ' + profileError.message },
        { status: 500 }
      )
    }

    // Delete user from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth delete error:', authError)
      // Profile already deleted, log the error but don't fail
    }

    return NextResponse.json({
      success: true,
      message: 'アカウントを削除しました',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
