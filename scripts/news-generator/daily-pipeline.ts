import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import * as path from 'path'
import * as fs from 'fs'
import { fetchDailyNews, type NewsItem } from './fetch-news'
import { generateNewsScript, type NewsScript } from './generate-script'
import { generateAudio } from './generate-audio'
import { saveNewsToDb } from './save-to-db'

interface DailyNewsItem {
  id: string
  date: string
  category: string
  originalTitle: string
  englishScript: string
  japaneseTranslation: string
  keyVocabulary: { word: string; meaning: string }[]
  level: string
  audioUrl: string
  source: string
}

// 日付からIDを生成 (例: 2024-12-12 -> N241212_1)
function generateNewsId(date: Date, index: number): string {
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `N${year}${month}${day}_${index + 1}`
}

// 1日分のニュースを生成
async function generateDailyNews(): Promise<DailyNewsItem[]> {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]

  console.log(`\n📅 Generating news for ${dateStr}\n`)
  console.log('=' .repeat(50))

  // 1. ニュース取得
  console.log('\n📰 Step 1: Fetching news...')
  const newsItems = await fetchDailyNews()
  console.log(`   Found ${newsItems.length} news items`)

  const dailyNews: DailyNewsItem[] = []

  // 2. 各ニュースを処理
  for (let i = 0; i < newsItems.length; i++) {
    const news = newsItems[i]
    const newsId = generateNewsId(today, i)

    console.log(`\n📝 Step 2.${i + 1}: Processing [${news.category}] ${news.title.substring(0, 50)}...`)

    try {
      // スクリプト生成
      console.log('   Generating script...')
      const script = await generateNewsScript(news)

      // 音声生成
      console.log('   Generating audio...')
      const audioPath = path.join(process.cwd(), 'public', 'audio', 'news', `${newsId}.mp3`)
      await generateAudio(script.englishScript, audioPath)

      dailyNews.push({
        id: newsId,
        date: dateStr,
        category: news.category,
        originalTitle: news.title,
        englishScript: script.englishScript,
        japaneseTranslation: script.japaneseTranslation,
        keyVocabulary: script.keyVocabulary,
        level: script.level,
        audioUrl: `/audio/news/${newsId}.mp3`,
        source: news.source,
      })

      console.log(`   ✅ Done: ${newsId}`)
    } catch (error) {
      console.error(`   ❌ Failed: ${error}`)
    }
  }

  // 3. JSONとして保存（バックアップ）
  const outputDir = path.join(process.cwd(), 'data', 'daily-news')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, `${dateStr}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(dailyNews, null, 2))
  console.log(`\n💾 Saved JSON to: ${outputPath}`)

  // 4. DBに保存
  console.log('\n📤 Saving to database...')
  await saveNewsToDb(dailyNews)

  // サマリー
  console.log('\n' + '=' .repeat(50))
  console.log(`✨ Generated ${dailyNews.length} news items for ${dateStr}`)
  dailyNews.forEach((item, i) => {
    console.log(`   ${i + 1}. [${item.category}] ${item.id}`)
  })

  return dailyNews
}

// メイン実行
async function main() {
  console.log('🚀 Daily News Generator')
  console.log('='.repeat(50))

  try {
    const news = await generateDailyNews()
    console.log('\n🎉 Pipeline completed successfully!')
    return news
  } catch (error) {
    console.error('\n💥 Pipeline failed:', error)
    process.exit(1)
  }
}

main()

export { generateDailyNews, type DailyNewsItem }
