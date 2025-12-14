/**
 * ElevenLabs TTS を使ってLP用サンプル音声を生成するスクリプト
 *
 * 使用方法:
 *   npx tsx scripts/generateLPSampleAudio.ts
 *
 * 必要な環境変数:
 *   ELEVENLABS_API_KEY - ElevenLabs API キー
 */

import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// .env.local を読み込む
const envPath = path.join(process.cwd(), '.env.local')
config({ path: envPath })

// ElevenLabs API設定
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'
// Rachel (アメリカ英語の女性ボイス) - クリアで聞き取りやすい
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

// LPサンプル用の英語スクリプト
const SAMPLE_SCRIPT = `
Japanese tech giant Sony has announced a major investment in artificial intelligence research,
committing over two billion dollars to develop next-generation AI technologies over the next five years.

The company plans to focus on areas such as robotics, entertainment, and healthcare applications.
Sony's CEO stated that AI will be central to the company's growth strategy,
and they aim to create innovative products that combine their expertise in hardware with advanced AI capabilities.

This announcement comes as competition in the AI sector intensifies among global technology companies,
with many racing to develop more sophisticated machine learning systems.
`.trim()

async function generateAudio(): Promise<void> {
  console.log('🎙️ LP用サンプル音声の生成を開始します...\n')

  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    console.error('❌ エラー: ELEVENLABS_API_KEY が設定されていません')
    console.error('   .env.local に ELEVENLABS_API_KEY=xxx を追加してください')
    process.exit(1)
  }

  console.log('📝 スクリプト:')
  console.log(SAMPLE_SCRIPT.substring(0, 100) + '...\n')

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: SAMPLE_SCRIPT,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API エラー: ${response.status} - ${errorText}`)
    }

    const audioBuffer = await response.arrayBuffer()

    // 保存先ディレクトリ
    const outputDir = path.join(process.cwd(), 'public', 'audio', 'sample')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, 'lp-sample.mp3')
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer))

    console.log('✅ 音声を生成しました!')
    console.log(`📁 保存先: ${outputPath}`)
    console.log('\n使用方法: TryNewsPlayerで /audio/sample/lp-sample.mp3 を参照')

  } catch (error) {
    console.error('❌ エラー:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

generateAudio().catch(console.error)
