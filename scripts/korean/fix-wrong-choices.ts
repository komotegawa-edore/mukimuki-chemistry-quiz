/**
 * 誤答選択肢を日本語に修正するスクリプト
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixWrongChoices() {
  console.log('🔧 誤答選択肢を日本語に修正中...\n')

  // 音声付きのフレーズを取得
  const { data: phrases, error } = await supabase
    .from('mukimuki_korean_phrases')
    .select('*')
    .not('audio_url', 'is', null)

  if (error || !phrases) {
    console.error('Error fetching phrases:', error)
    return
  }

  console.log(`${phrases.length}件のフレーズを処理します\n`)

  for (const phrase of phrases) {
    // 韓国語の誤答があるかチェック
    const hasKoreanChoices = phrase.wrong_choices.some((c: string) => /[가-힣]/.test(c))

    if (!hasKoreanChoices) {
      console.log(`✓ ${phrase.id}: 既に日本語`)
      continue
    }

    console.log(`🔄 ${phrase.id}: ${phrase.korean_text}`)

    // GPTで日本語の誤答を生成
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `韓国語フレーズ「${phrase.korean_text}」の意味は「${phrase.japanese_meaning}」です。
この正解に似ているが意味が違う日本語の誤答選択肢を3つ生成してください。

JSON形式で出力: {"wrong_choices": ["誤答1", "誤答2", "誤答3"]}`
      }],
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0].message.content
    if (!content) continue

    const data = JSON.parse(content)

    // 更新
    const { error: updateError } = await supabase
      .from('mukimuki_korean_phrases')
      .update({ wrong_choices: data.wrong_choices })
      .eq('id', phrase.id)

    if (updateError) {
      console.error(`   ❌ エラー:`, updateError)
    } else {
      console.log(`   ✅ 修正完了: ${data.wrong_choices.join(', ')}`)
    }

    // レート制限対策
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n✅ 完了!')
}

fixWrongChoices().catch(console.error)
