import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Supabaseクライアント（サービスロールキーを使用）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, company, subject, message } = body

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: '必須項目を入力してください' },
        { status: 400 }
      )
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }

    // Supabaseに保存
    const { error } = await supabase
      .from('contacts')
      .insert({
        name,
        email,
        company: company || null,
        subject,
        message,
      })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'データの保存に失敗しました' },
        { status: 500 }
      )
    }

    // メール通知を送信
    try {
      await resend.emails.send({
        from: 'Edore お問い合わせ <noreply@edore-edu.com>',
        to: 'contact@edore-edu.com',
        subject: `【お問い合わせ】${subject} - ${name}様`,
        html: `
          <h2>新しいお問い合わせがありました</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; width: 120px;"><strong>お名前</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>メールアドレス</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>会社名・団体名</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${company || '（未入力）'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>お問い合わせ種別</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>お問い合わせ内容</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            このメールは Edore ホームページのお問い合わせフォームから自動送信されています。
          </p>
        `,
      })
    } catch (emailError) {
      // メール送信失敗はログに残すが、フォーム送信自体は成功とする
      console.error('Email notification error:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
