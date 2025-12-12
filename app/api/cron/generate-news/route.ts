import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

// バッチ設定: 4バッチ × 5本 = 20本/日
const BATCH_CONFIG = {
  1: { categories: ['technology', 'business', 'sports'], itemsPerCategory: 2, startIndex: 0 },  // 6本 → 5本に調整
  2: { categories: ['entertainment', 'world', 'science'], itemsPerCategory: 2, startIndex: 5 }, // 6本 → 5本に調整
  3: { categories: ['health', 'politics'], itemsPerCategory: 2, startIndex: 10 },               // 4本 → 5本に調整
  4: { categories: ['economy', 'automotive'], itemsPerCategory: 2, startIndex: 15 },            // 4本 → 5本に調整
} as const

// Vercel Cronからのリクエストを認証
export async function GET(request: NextRequest) {
  // Vercel Cronからのリクエストを確認
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // 開発環境では認証をスキップ
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // バッチ番号を取得（1-4）
  const url = new URL(request.url)
  const batchParam = url.searchParams.get('batch')
  const batch = batchParam ? parseInt(batchParam, 10) : null

  try {
    if (batch && batch >= 1 && batch <= 4) {
      // 特定バッチのみ実行
      const result = await generateBatchNews(batch as 1 | 2 | 3 | 4)
      return NextResponse.json({
        success: true,
        message: `Generated ${result.count} news items (batch ${batch})`,
        date: result.date,
        batch
      })
    } else {
      // バッチ指定なし → 全カテゴリ実行（開発用）
      const result = await generateDailyNews()
      return NextResponse.json({
        success: true,
        message: `Generated ${result.count} news items`,
        date: result.date
      })
    }
  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate news', details: String(error) },
      { status: 500 }
    )
  }
}

// Google News Japan RSS - 10カテゴリ
const RSS_FEEDS: Record<string, string> = {
  technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  world: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtcGhLQUFQAQ?hl=ja&gl=JP&ceid=JP:ja',
  politics: 'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFZ4ZERBU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  economy: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  automotive: 'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRE5pYXpBU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
}

// バッチ生成（特定カテゴリのみ）
async function generateBatchNews(batchNum: 1 | 2 | 3 | 4) {
  const config = BATCH_CONFIG[batchNum]
  const parser = new Parser({ customFields: { item: ['source'] } })
  const openai = new OpenAI()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]

  const newsItems: any[] = []

  // 指定カテゴリからニュース取得
  for (const category of config.categories) {
    const url = RSS_FEEDS[category]
    if (!url) continue

    try {
      const feed = await parser.parseURL(url)
      const itemsToTake = Math.min(config.itemsPerCategory, feed.items.length)

      for (let i = 0; i < itemsToTake; i++) {
        const item = feed.items[i]
        newsItems.push({
          title: item.title || '',
          description: item.contentSnippet || '',
          source: (item as any).source?.['$']?.url || 'Unknown',
          category,
        })
      }
    } catch (error) {
      console.error(`Failed to fetch ${category} news:`, error)
    }
  }

  const results: any[] = []

  for (let i = 0; i < newsItems.length; i++) {
    const news = newsItems[i]
    const newsId = generateNewsId(today, config.startIndex + i)

    try {
      const script = await generateScript(openai, news)
      const audioUrl = await generateAudio(openai, script.englishScript, newsId, supabase)

      results.push({
        id: newsId,
        news_date: dateStr,
        category: news.category,
        original_title: news.title,
        english_script: script.englishScript,
        japanese_translation: script.japaneseTranslation,
        key_vocabulary: script.keyVocabulary,
        level: script.level || 'intermediate',
        audio_url: audioUrl,
        source: news.source,
        is_published: true,
      })
    } catch (error) {
      console.error(`Failed to process news ${config.startIndex + i}:`, error)
    }
  }

  // DBに保存
  if (results.length > 0) {
    const { error } = await supabase
      .from('mukimuki_daily_news')
      .upsert(results, { onConflict: 'id' })

    if (error) {
      throw new Error(`DB save failed: ${error.message}`)
    }
  }

  return { date: dateStr, count: results.length }
}

// ニュース生成ロジック（全カテゴリ - 開発用）
async function generateDailyNews() {
  const parser = new Parser({
    customFields: { item: ['source'] },
  })

  const openai = new OpenAI()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]

  const newsItems: any[] = []
  const ITEMS_PER_CATEGORY = 2

  for (const [category, url] of Object.entries(RSS_FEEDS)) {
    try {
      const feed = await parser.parseURL(url)
      const itemsToTake = Math.min(ITEMS_PER_CATEGORY, feed.items.length)

      for (let i = 0; i < itemsToTake; i++) {
        const item = feed.items[i]
        newsItems.push({
          title: item.title || '',
          description: item.contentSnippet || '',
          source: (item as any).source?.['$']?.url || 'Unknown',
          category,
        })
      }
    } catch (error) {
      console.error(`Failed to fetch ${category} news:`, error)
    }
  }

  const results: any[] = []

  for (let i = 0; i < newsItems.length; i++) {
    const news = newsItems[i]
    const newsId = generateNewsId(today, i)

    try {
      const script = await generateScript(openai, news)
      const audioUrl = await generateAudio(openai, script.englishScript, newsId, supabase)

      results.push({
        id: newsId,
        news_date: dateStr,
        category: news.category,
        original_title: news.title,
        english_script: script.englishScript,
        japanese_translation: script.japaneseTranslation,
        key_vocabulary: script.keyVocabulary,
        level: script.level || 'intermediate',
        audio_url: audioUrl,
        source: news.source,
        is_published: true,
      })
    } catch (error) {
      console.error(`Failed to process news ${i}:`, error)
    }
  }

  // DBに保存
  if (results.length > 0) {
    const { error } = await supabase
      .from('mukimuki_daily_news')
      .upsert(results, { onConflict: 'id' })

    if (error) {
      throw new Error(`DB save failed: ${error.message}`)
    }
  }

  return { date: dateStr, count: results.length }
}

function generateNewsId(date: Date, index: number): string {
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `N${year}${month}${day}_${index + 1}`
}

async function generateScript(openai: OpenAI, news: any) {
  const prompt = `You are a professional news writer for NHK World, creating English listening material for Japanese working adults.

The following is a Japanese news headline. Create an ENGLISH NEWS BROADCAST SCRIPT based on this news.

Japanese News:
Title: ${news.title}
Description: ${news.description}
Category: ${news.category}

Requirements for the English script:
- Length: 300-400 words (approximately 2-3 minutes when read aloud)
- Start with "Good morning" or "Good evening" and introduce the topic naturally
- Structure: Opening → Background/Context → Main details → Impact/Implications → Closing
- Use CEFR A2-B1 level vocabulary (business English suitable for Japanese working adults)
- Explain any technical terms or cultural context that international audiences might need
- Make it sound like a professional NHK World broadcast
- Include relevant details to make the story complete and engaging
- End with a brief conclusion or future outlook
- IMPORTANT: Divide the script into 3-5 paragraphs separated by "\\n\\n" (double newlines) for readability. Each paragraph should be 60-100 words.

Requirements for Japanese translation:
- Provide the Japanese translation of your English script
- Natural, fluent Japanese that matches Japanese news broadcast style
- Keep the same paragraph structure as the English script (use \\n\\n between paragraphs)

Requirements for vocabulary:
- Pick 5-8 key English vocabulary words useful for business English
- Include words that appear in the script
- Provide Japanese meanings

Respond in this exact JSON format only (no markdown, no code blocks):
{
  "englishScript": "...",
  "japaneseTranslation": "...",
  "keyVocabulary": [
    {"word": "...", "meaning": "..."}
  ],
  "level": "intermediate"
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  })

  const responseText = response.choices[0].message.content || ''
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse script response')

  return JSON.parse(jsonMatch[0])
}

async function generateAudio(openai: OpenAI, text: string, newsId: string, supabase: any): Promise<string> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
    speed: 0.9,
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  const fileName = `${newsId}.mp3`

  // 本番環境: Supabase Storageに保存
  if (process.env.NODE_ENV === 'production') {
    const { error } = await supabase.storage
      .from('english-news-audio')
      .upload(fileName, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (error) {
      console.error('Storage upload failed:', error)
      // フォールバック: ローカルパスを返す
      return `/audio/news/${newsId}.mp3`
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('english-news-audio')
      .getPublicUrl(fileName)

    return publicUrl
  }

  // ローカル開発時: ファイル保存
  const outputDir = path.join(process.cwd(), 'public', 'audio', 'news')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  fs.writeFileSync(path.join(outputDir, fileName), buffer)

  return `/audio/news/${newsId}.mp3`
}
