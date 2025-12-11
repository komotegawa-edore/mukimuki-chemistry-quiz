import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI()
  }
  return openai
}

interface AudioGenerationResult {
  filePath: string
  duration?: number
}

// OpenAI TTS で音声生成
async function generateAudio(
  text: string,
  outputPath: string,
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'
): Promise<AudioGenerationResult> {
  // 出力ディレクトリがなければ作成
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const response = await getOpenAI().audio.speech.create({
    model: 'tts-1',       // tts-1-hd もあるが、コスト2倍
    voice: voice,
    input: text,
    speed: 0.9,           // 少しゆっくりめ（学習用）
  })

  // ArrayBufferをBufferに変換して保存
  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(outputPath, buffer)

  console.log(`✅ Audio saved to: ${outputPath}`)

  return {
    filePath: outputPath,
  }
}

// テスト実行
async function main() {
  const testScript = `
    Good evening. In technology news today, Apple is reportedly planning a major change to its iPad lineup.
    According to industry sources, the upcoming iPad 12 may feature the same A19 chip that will power the iPhone 17.
    This would break Apple's tradition of using older chips in base model iPads.
    The move could significantly boost the performance of Apple's most affordable tablet.
  `.trim()

  console.log('🔊 Generating audio...')
  console.log('Script:', testScript.substring(0, 100) + '...')
  console.log('')

  const outputPath = path.join(process.cwd(), 'public', 'audio', 'news', 'test-news.mp3')

  const result = await generateAudio(testScript, outputPath)

  console.log('Generated:', result.filePath)
}

// CLIから実行された場合のみmain()を実行
if (require.main === module) {
  main().catch(console.error)
}

export { generateAudio, type AudioGenerationResult }
