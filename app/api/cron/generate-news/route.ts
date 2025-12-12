import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

// バッチ設定: 10バッチ × 2本 = 20本/日（各バッチ約30秒で完了）
// feedOffset: RSSフィード内のアイテム取得開始位置（重複防止）
const BATCH_CONFIG = {
  1: { categories: ['technology'], itemsPerCategory: 2, startIndex: 0, feedOffset: 0 },
  2: { categories: ['business'], itemsPerCategory: 2, startIndex: 2, feedOffset: 0 },
  3: { categories: ['sports'], itemsPerCategory: 2, startIndex: 4, feedOffset: 0 },
  4: { categories: ['entertainment'], itemsPerCategory: 2, startIndex: 6, feedOffset: 0 },
  5: { categories: ['world'], itemsPerCategory: 2, startIndex: 8, feedOffset: 0 },
  6: { categories: ['science'], itemsPerCategory: 2, startIndex: 10, feedOffset: 0 },
  7: { categories: ['health'], itemsPerCategory: 2, startIndex: 12, feedOffset: 0 },
  8: { categories: ['headlines'], itemsPerCategory: 2, startIndex: 14, feedOffset: 0 },
  9: { categories: ['economy'], itemsPerCategory: 2, startIndex: 16, feedOffset: 4 },
  10: { categories: ['lifestyle'], itemsPerCategory: 2, startIndex: 18, feedOffset: 6 },
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
    if (batch && batch >= 1 && batch <= 10) {
      // 特定バッチのみ実行
      const result = await generateBatchNews(batch as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)
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
// Note: Some topic-specific feeds don't work for Japan locale, so we use alternatives
const RSS_FEEDS: Record<string, string> = {
  technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  world: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtcGhLQUFQAQ?hl=ja&gl=JP&ceid=JP:ja',
  // politics/automotive feeds don't work for Japan, use top stories (contains political/general news)
  headlines: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
  // Use technology feed with offset for variety (economy was duplicate of business)
  economy: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  lifestyle: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
}

// バッチ生成（特定カテゴリのみ）
async function generateBatchNews(batchNum: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) {
  const config = BATCH_CONFIG[batchNum]
  const parser = new Parser({ customFields: { item: ['source'] } })
  const openai = new OpenAI()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 日本時間で日付を取得（UTC 22:00 = JST 7:00 なので翌日の日付になる）
  const today = getJSTDate()
  const dateStr = today.toISOString().split('T')[0]

  const newsItems: any[] = []

  // 指定カテゴリからニュース取得
  for (const category of config.categories) {
    const url = RSS_FEEDS[category]
    if (!url) continue

    try {
      const feed = await parser.parseURL(url)
      const feedOffset = config.feedOffset || 0
      const availableItems = feed.items.slice(feedOffset)
      const itemsToTake = Math.min(config.itemsPerCategory, availableItems.length)

      for (let i = 0; i < itemsToTake; i++) {
        const item = availableItems[i]
        newsItems.push({
          title: item.title || '',
          description: item.contentSnippet || '',
          // Google News RSSのlinkを元記事URLとして使用
          source: item.link || 'Unknown',
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

  // 日本時間で日付を取得
  const today = getJSTDate()
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
          // Google News RSSのlinkを元記事URLとして使用
          source: item.link || 'Unknown',
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

// 日本時間で日付を取得
function getJSTDate(): Date {
  const now = new Date()
  // UTC+9時間 = JST
  const jstOffset = 9 * 60 * 60 * 1000
  return new Date(now.getTime() + jstOffset)
}

function generateNewsId(date: Date, index: number): string {
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `N${year}${month}${day}_${index + 1}`
}

async function generateScript(openai: OpenAI, news: any) {
  const prompt = `You are an English language educator creating ORIGINAL educational listening material for Japanese working adults.

IMPORTANT COPYRIGHT NOTICE:
- You are NOT copying or translating the original news article
- You are creating a COMPLETELY ORIGINAL educational script INSPIRED BY the news topic
- Use only the FACTS and TOPIC from the headline - do NOT reproduce any original text
- Write in your own words as an educator explaining current events

News Topic (for reference only):
Topic: ${news.title}
Category: ${news.category}

Your Task:
Create an ORIGINAL English educational broadcast script about this topic. You are teaching English through current events, not reproducing news content.

Requirements for the English script:
- Length: 300-400 words (approximately 2-3 minutes when read aloud)
- Start with "Good morning" or "Good evening" and introduce the topic naturally
- Structure: Opening → Background/Context → Main details → Impact/Implications → Closing
- Use CEFR A2-B1 level vocabulary (business English suitable for Japanese working adults)
- Explain any technical terms or cultural context that international audiences might need
- Write as an EDUCATOR explaining a topic, not as a news reporter
- Add your own educational perspective and context
- End with a brief conclusion or future outlook
- IMPORTANT: Divide the script into 3-5 paragraphs separated by "\\n\\n" (double newlines) for readability. Each paragraph should be 60-100 words.

Requirements for Japanese translation:
- Provide the Japanese translation of your English script
- Natural, fluent Japanese that matches educational broadcast style
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
