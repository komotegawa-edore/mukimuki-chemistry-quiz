/**
 * 韓国語フレーズ生成スクリプト
 *
 * 使い方:
 *   npx tsx scripts/korean/generate-phrases.ts
 *
 * 環境変数（.env.localに設定）:
 *   - OPENAI_API_KEY: OpenAI APIキー
 *   - ELEVENLABS_API_KEY: ElevenLabs APIキー
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase Service Role Key
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

// 設定
const CONFIG = {
  // 生成するフレーズ数（カテゴリごと）
  phrasesPerCategory: 5,
  // カテゴリ
  categories: ['love', 'breakup', 'friendship', 'hope', 'daily'] as const,
  // ElevenLabs音声ID（韓国語対応の音声）
  elevenLabsVoiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte - multilingual
  // 一時ファイル保存先
  tempDir: './scripts/korean/temp',
}

type Category = typeof CONFIG.categories[number]

interface GeneratedPhrase {
  korean_text: string
  japanese_meaning: string
  romanization: string
  wrong_choices: string[]
  difficulty_level: 1 | 2 | 3
}

// OpenAI クライアント
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Supabase クライアント（Service Role Key使用）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// カテゴリの日本語名
const categoryNames: Record<Category, string> = {
  love: '恋愛',
  breakup: '別れ',
  friendship: '友情',
  hope: '希望',
  daily: '日常',
}

/**
 * GPT-4でフレーズを生成
 */
async function generatePhrases(category: Category, count: number): Promise<GeneratedPhrase[]> {
  console.log(`\n📝 ${categoryNames[category]}カテゴリのフレーズを生成中...`)

  const prompt = `あなたは韓国語教師です。日本人が韓国語を学ぶための簡単なフレーズを${count}個生成してください。

カテゴリ: ${categoryNames[category]}

要件:
- 一文の簡単な韓国語フレーズ（5-15語程度）
- 自然な韓国語表現
- K-POPや日常会話でよく使われる表現
- 各フレーズに対して、似ているが意味が違う誤答選択肢を3つ

以下のJSON形式で出力してください:
{
  "phrases": [
    {
      "korean_text": "韓国語フレーズ",
      "japanese_meaning": "日本語の意味（正解）",
      "romanization": "ローマ字読み",
      "wrong_choices": ["誤答1", "誤答2", "誤答3"],
      "difficulty_level": 1
    }
  ]
}

difficulty_levelは1（初級）、2（中級）、3（上級）で設定してください。`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('GPT response is empty')

  const data = JSON.parse(content)
  console.log(`   ✅ ${data.phrases.length}個のフレーズを生成`)
  return data.phrases
}

/**
 * ElevenLabsで音声を生成
 */
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

  // 一時ファイルに保存
  const buffer = Buffer.from(await response.arrayBuffer())
  const filePath = path.join(CONFIG.tempDir, filename)
  fs.writeFileSync(filePath, buffer)

  return filePath
}

/**
 * Supabase Storageにアップロード
 */
async function uploadToStorage(filePath: string, fileName: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)

  const { error } = await supabase.storage
    .from('korean-audio')
    .upload(fileName, fileBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('korean-audio')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

/**
 * データベースに登録
 */
async function saveToDatabase(
  id: string,
  category: Category,
  phrase: GeneratedPhrase,
  audioUrl: string | null
) {
  const { error } = await supabase
    .from('mukimuki_korean_phrases')
    .upsert({
      id,
      phrase_date: new Date().toISOString().split('T')[0],
      category,
      korean_text: phrase.korean_text,
      japanese_meaning: phrase.japanese_meaning,
      romanization: phrase.romanization,
      audio_url: audioUrl,
      wrong_choices: phrase.wrong_choices,
      difficulty_level: phrase.difficulty_level,
      is_published: true,
    })

  if (error) throw error
}

/**
 * メイン処理
 */
async function main() {
  console.log('🇰🇷 韓国語フレーズ生成スクリプト')
  console.log('================================\n')

  // 環境変数チェック
  const requiredEnvs = [
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
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

  // Storageバケット確認/作成
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find(b => b.name === 'korean-audio')) {
    console.log('📦 korean-audio バケットを作成中...')
    await supabase.storage.createBucket('korean-audio', { public: true })
  }

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  let totalPhrases = 0
  let totalAudio = 0

  for (const category of CONFIG.categories) {
    try {
      // フレーズ生成
      const phrases = await generatePhrases(category, CONFIG.phrasesPerCategory)

      for (let i = 0; i < phrases.length; i++) {
        const phrase = phrases[i]
        const id = `KR${today}_${category}_${String(i + 1).padStart(3, '0')}`
        const audioFileName = `${id}.mp3`

        console.log(`   🔊 音声生成: ${phrase.korean_text.substring(0, 20)}...`)

        let audioUrl: string | null = null
        try {
          // 音声生成
          const tempPath = await generateAudio(phrase.korean_text, audioFileName)
          // アップロード
          audioUrl = await uploadToStorage(tempPath, audioFileName)
          // 一時ファイル削除
          fs.unlinkSync(tempPath)
          totalAudio++
        } catch (audioError) {
          console.error(`   ⚠️ 音声生成エラー: ${audioError}`)
        }

        // DB登録
        await saveToDatabase(id, category, phrase, audioUrl)
        totalPhrases++
        console.log(`   ✅ 登録完了: ${id}`)
      }
    } catch (error) {
      console.error(`❌ ${categoryNames[category]}カテゴリでエラー:`, error)
    }
  }

  console.log('\n================================')
  console.log(`✅ 完了！`)
  console.log(`   - フレーズ: ${totalPhrases}個`)
  console.log(`   - 音声: ${totalAudio}個`)
}

main().catch(console.error)
