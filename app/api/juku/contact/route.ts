import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { siteId, name, email, phone, grade, message } = body

    if (!siteId || !name) {
      return NextResponse.json(
        { error: 'サイトIDとお名前は必須です' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // サイト情報を取得（公開サイトのみ）
    const { data: site, error: siteError } = await supabase
      .from('juku_sites')
      .select('id, name, email, owner_id')
      .eq('id', siteId)
      .eq('is_published', true)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'サイトが見つかりません' },
        { status: 404 }
      )
    }

    // お問い合わせを保存
    const { error: insertError } = await supabase
      .from('juku_contact_submissions')
      .insert({
        site_id: siteId,
        name,
        email: email || null,
        phone: phone || null,
        grade: grade || null,
        message: message || null,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'お問い合わせの保存に失敗しました' },
        { status: 500 }
      )
    }

    // サイトオーナーのメールアドレスを取得
    let ownerEmail = site.email

    if (!ownerEmail && site.owner_id) {
      const { data: ownerProfile } = await supabase
        .from('juku_owner_profiles')
        .select('email')
        .eq('id', site.owner_id)
        .single()

      ownerEmail = ownerProfile?.email
    }

    // メール送信
    if (ownerEmail && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Edore <noreply@edore-edu.com>',
          to: ownerEmail,
          subject: `【${site.name}】新しいお問い合わせがありました`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">新しいお問い合わせ</h2>
              <p style="color: #666;">「${site.name}」に新しいお問い合わせがありました。</p>

              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px;"><strong>お名前:</strong> ${name}</p>
                ${email ? `<p style="margin: 0 0 10px;"><strong>メール:</strong> ${email}</p>` : ''}
                ${phone ? `<p style="margin: 0 0 10px;"><strong>電話:</strong> ${phone}</p>` : ''}
                ${grade ? `<p style="margin: 0 0 10px;"><strong>学年:</strong> ${grade}</p>` : ''}
                ${message ? `<p style="margin: 0;"><strong>内容:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
              </div>

              <p style="color: #666; font-size: 14px;">
                このメールは <a href="https://edore-edu.com">Edore</a> から自動送信されています。
              </p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Email send error:', emailError)
        // メール送信失敗してもお問い合わせ自体は成功として扱う
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}
