import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

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

  try {
    const result = await generateDailyNews()
    return NextResponse.json({
      success: true,
      message: `Generated ${result.count} news items`,
      date: result.date
    })
  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate news', details: String(error) },
      { status: 500 }
    )
  }
}

// ニュース生成ロジック
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

  // Google News Japan RSS - 10カテゴリ
  const RSS_FEEDS = {
    // テクノロジー
    technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    // ビジネス
    business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    // スポーツ
    sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    // エンタメ
    entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    // 国際
    world: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    // 科学
    science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    // 健康
    health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtcGhLQUFQAQ?hl=ja&gl=JP&ceid=JP:ja',
    // 政治
    politics: 'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFZ4ZERBU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    // 経済
    economy: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    // 自動車
    automotive: 'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRE5pYXpBU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  }

  const newsItems: any[] = []

  // 各カテゴリから2件ずつ取得（合計20件）
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
      // スクリプト生成
      const script = await generateScript(openai, news)

      // 音声生成
      const audioUrl = await generateAudio(openai, script.englishScript, newsId)

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

async function generateAudio(openai: OpenAI, text: string, newsId: string): Promise<string> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
    speed: 0.9,
  })

  // Vercel環境ではファイル保存できないので、Base64でSupabase Storageに保存する方が良い
  // 今はローカルパスを返す（本番ではStorageを使う）
  const audioUrl = `/audio/news/${newsId}.mp3`

  // ローカル開発時のみファイル保存
  if (process.env.NODE_ENV !== 'production') {
    const outputDir = path.join(process.cwd(), 'public', 'audio', 'news')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(path.join(outputDir, `${newsId}.mp3`), buffer)
  }

  return audioUrl
}
