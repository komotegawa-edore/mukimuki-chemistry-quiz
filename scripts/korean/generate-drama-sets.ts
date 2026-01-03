/**
 * K-Drama韓国語リスニングセット生成スクリプト
 *
 * 使い方:
 *   npx tsx scripts/korean/generate-drama-sets.ts
 *
 * 生成内容:
 *   - 10セット × 3問 = 30問
 *   - ドラマ風シチュエーション
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const CONFIG = {
  setsToGenerate: 10,
  questionsPerSet: 3,
  elevenLabsVoiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte - multilingual
  tempDir: './scripts/korean/temp',
  startSetNumber: 21, // K-POPの10セットの続きから
  idPrefix: 'KLD', // Korean Listen Drama
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GeneratedSet {
  korean_script: string
  japanese_translation: string
  romanization: string
  questions: {
    question_text: string
    choice_a: string
    choice_b: string
    choice_c: string
    choice_d: string
    correct_answer: 'A' | 'B' | 'C' | 'D'
    explanation: string
  }[]
}

// ドラマシチュエーション一覧
const DRAMA_SITUATIONS = [
  '告白シーン',
  '別れのシーン',
  'カフェでの会話',
  '職場での会話',
  '友達との電話',
  '家族との食事',
  'プロポーズ',
  '誤解が解ける場面',
  '空港での再会',
  '屋上での心の告白',
]

async function generateSet(setNumber: number, situation: string): Promise<GeneratedSet> {
  console.log(`\n📝 セット${setNumber}を生成中... (${situation})`)

  const prompt = `あなたは韓国語教師です。韓国ドラマファン向けのリスニング練習用韓国語スクリプトと問題を生成してください。

シチュエーション: ${situation}

要件:
- 2-3文の自然な韓国語スクリプト（30-50語程度）
- 韓国ドラマで聞くような感情豊かな口調で
- スクリプトの内容に関する問題を3問
- 問題文は日本語で記述
- 選択肢も日本語で記述
- ドラマで実際に使われる表現を使用

以下のJSON形式で出力してください:
{
  "korean_script": "韓国語スクリプト（2-3文）",
  "japanese_translation": "日本語訳",
  "romanization": "ローマ字読み",
  "questions": [
    {
      "question_text": "問題文（日本語）",
      "choice_a": "選択肢A（日本語）",
      "choice_b": "選択肢B（日本語）",
      "choice_c": "選択肢C（日本語）",
      "choice_d": "選択肢D（日本語）",
      "correct_answer": "A",
      "explanation": "解説（なぜこの答えが正解か）"
    }
  ]
}

例（告白シーン）:
{
  "korean_script": "너 없이는 못 살아. 제발 내 곁에 있어줘. 내가 너를 평생 행복하게 해줄게.",
  "japanese_translation": "君なしでは生きていけない。お願いだから僕のそばにいて。僕が君を一生幸せにするから。",
  "romanization": "neo eopsineun mot sara. jebal nae gyeote isseojwo...",
  "questions": [
    {
      "question_text": "話者は相手に何を求めていますか？",
      "choice_a": "別れること",
      "choice_b": "そばにいること",
      "choice_c": "待つこと",
      "choice_d": "許すこと",
      "correct_answer": "B",
      "explanation": "「내 곁에 있어줘（僕のそばにいて）」と言っているため"
    }
  ]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('GPT response is empty')

  const data = JSON.parse(content)
  console.log(`   ✅ スクリプト生成完了 (${data.questions.length}問)`)
  return data
}

async function generateAudio(text: string, filename: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set')

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${CONFIG.elevenLabsVoiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${error}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const filePath = path.join(CONFIG.tempDir, filename)
  fs.writeFileSync(filePath, buffer)

  return filePath
}

async function uploadToStorage(filePath: string, fileName: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)

  const { error } = await supabase.storage
    .from('korean-audio')
    .upload(`listening/${fileName}`, fileBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('korean-audio')
    .getPublicUrl(`listening/${fileName}`)

  return urlData.publicUrl
}

async function main() {
  console.log('🎬 K-Drama韓国語リスニングセット生成スクリプト')
  console.log('==========================================\n')

  // 環境変数チェック
  const requiredEnvs = ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      console.error(`❌ 環境変数 ${env} が設定されていません`)
      process.exit(1)
    }
  }

  // 一時ディレクトリ作成
  if (!fs.existsSync(CONFIG.tempDir)) {
    fs.mkdirSync(CONFIG.tempDir, { recursive: true })
  }

  let totalSets = 0
  let totalQuestions = 0

  for (let i = 0; i < CONFIG.setsToGenerate; i++) {
    const setNum = CONFIG.startSetNumber + i
    const situation = DRAMA_SITUATIONS[i % DRAMA_SITUATIONS.length]

    try {
      // スクリプトと問題を生成
      const setData = await generateSet(setNum, situation)
      const setId = `${CONFIG.idPrefix}${String(setNum).padStart(3, '0')}`
      const audioFileName = `${setId}.mp3`

      // 音声生成
      console.log(`   🔊 音声生成中...`)
      let audioUrl: string | null = null
      try {
        const tempPath = await generateAudio(setData.korean_script, audioFileName)
        audioUrl = await uploadToStorage(tempPath, audioFileName)
        fs.unlinkSync(tempPath)
        console.log(`   ✅ 音声アップロード完了`)
      } catch (audioError) {
        console.error(`   ⚠️ 音声生成エラー: ${audioError}`)
      }

      // セットをDB登録
      const { error: setError } = await supabase
        .from('mukimuki_korean_listening_sets')
        .upsert({
          id: setId,
          set_number: setNum,
          korean_script: setData.korean_script,
          japanese_translation: setData.japanese_translation,
          romanization: setData.romanization,
          audio_url: audioUrl,
          category: situation,
          is_published: true,
        })

      if (setError) throw setError
      totalSets++

      // 問題をDB登録
      for (let qNum = 0; qNum < setData.questions.length; qNum++) {
        const q = setData.questions[qNum]
        const questionId = `${setId}_Q${qNum + 1}`

        const { error: qError } = await supabase
          .from('mukimuki_korean_listening_questions')
          .upsert({
            id: questionId,
            set_id: setId,
            question_number: qNum + 1,
            question_text: q.question_text,
            choice_a: q.choice_a,
            choice_b: q.choice_b,
            choice_c: q.choice_c,
            choice_d: q.choice_d,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })

        if (qError) throw qError
        totalQuestions++
      }

      console.log(`   ✅ セット${setNum}登録完了`)

      // レート制限対策
      await new Promise(r => setTimeout(r, 1000))

    } catch (error) {
      console.error(`❌ セット${setNum}でエラー:`, error)
    }
  }

  console.log('\n==========================================')
  console.log(`✅ 完了！`)
  console.log(`   - セット: ${totalSets}個`)
  console.log(`   - 問題: ${totalQuestions}問`)
}

main().catch(console.error)
