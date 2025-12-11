import Parser from 'rss-parser'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  source: string
  category: string
}

const parser = new Parser({
  customFields: {
    item: ['source'],
  },
})

// Google News RSS URLs by topic (Japan)
const RSS_FEEDS = {
  top: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
  technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRE5qWnpRU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  world: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtcGhHZ0pLVUNnQVAB?hl=ja&gl=JP&ceid=JP:ja',
}

type Category = keyof typeof RSS_FEEDS

async function fetchNewsByCategory(category: Category, limit: number = 5): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(RSS_FEEDS[category])

    return feed.items.slice(0, limit).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || '',
      description: item.contentSnippet || item.content || '',
      source: (item as any).source?.['$']?.url || (item as any).source || 'Unknown',
      category,
    }))
  } catch (error) {
    console.error(`Failed to fetch ${category} news:`, error)
    return []
  }
}

// 各カテゴリから1つずつ取得して5記事にする
async function fetchDailyNews(): Promise<NewsItem[]> {
  const categories: Category[] = ['technology', 'business', 'sports', 'entertainment', 'world']
  const dailyNews: NewsItem[] = []

  for (const category of categories) {
    const news = await fetchNewsByCategory(category, 1)
    if (news.length > 0) {
      dailyNews.push(news[0])
    }
  }

  return dailyNews
}

// テスト実行
async function main() {
  console.log('📰 Fetching today\'s news...\n')

  const dailyNews = await fetchDailyNews()

  if (dailyNews.length === 0) {
    console.log('No news fetched. Trying top news instead...\n')
    const topNews = await fetchNewsByCategory('top', 5)
    topNews.forEach((news, index) => {
      console.log(`${index + 1}. ${news.title}`)
      console.log(`   Source: ${news.source}`)
      console.log(`   Date: ${news.pubDate}`)
      console.log('')
    })
    return topNews
  }

  dailyNews.forEach((news, index) => {
    console.log(`${index + 1}. [${news.category.toUpperCase()}]`)
    console.log(`   Title: ${news.title}`)
    console.log(`   Source: ${news.source}`)
    console.log(`   Date: ${news.pubDate}`)
    console.log('')
  })

  return dailyNews
}

main().catch(console.error)

export { fetchNewsByCategory, fetchDailyNews, type NewsItem, type Category }
