import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lp_id, name, email, phone, grade, course, message } = body

    if (!lp_id || !name) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // LP存在確認
    const { data: lp, error: lpError } = await supabase
      .from('juku_lps')
      .select('id, name, juku_name, email, owner_id')
      .eq('id', lp_id)
      .eq('is_published', true)
      .single()

    if (lpError || !lp) {
      return NextResponse.json(
        { error: 'LPが見つかりません' },
        { status: 404 }
      )
    }

    // 申込保存
    const { data: inquiry, error: insertError } = await supabase
      .from('juku_lp_inquiries')
      .insert({
        lp_id,
        name,
        email,
        phone,
        grade,
        course,
        message,
        status: 'new',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Inquiry insert error:', insertError)
      return NextResponse.json(
        { error: '申込の保存に失敗しました' },
        { status: 500 }
      )
    }

    // 通知メール送信（オーナーのメールアドレスがあれば）
    if (lp.email) {
      // TODO: メール送信処理
      // await sendNotificationEmail(lp.email, {
      //   lpName: lp.name,
      //   jukuName: lp.juku_name,
      //   inquiry: { name, email, phone, grade, course, message },
      // })
      console.log('Notification email would be sent to:', lp.email)
    }

    return NextResponse.json({
      success: true,
      message: 'お申し込みを受け付けました',
      inquiry_id: inquiry.id,
    })
  } catch (error) {
    console.error('Inquiry API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
