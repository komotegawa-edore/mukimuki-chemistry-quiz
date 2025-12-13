'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { requestText, category } = body

    if (!requestText || requestText.trim().length === 0) {
      return NextResponse.json({ error: 'Request text is required' }, { status: 400 })
    }

    if (requestText.length > 500) {
      return NextResponse.json({ error: 'Request text is too long (max 500 characters)' }, { status: 400 })
    }

    // リクエストを保存
    const { error } = await supabase
      .from('mukimuki_english_requests')
      .insert({
        user_id: user.id,
        request_text: requestText.trim(),
        category: category || null,
      })

    if (error) {
      console.error('Failed to save request:', error)
      return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Request API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
