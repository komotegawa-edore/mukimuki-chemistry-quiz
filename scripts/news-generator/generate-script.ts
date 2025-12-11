import OpenAI from 'openai'
import { NewsItem } from './fetch-news'

interface NewsScript {
  originalTitle: string
  category: string
  englishScript: string
  japaneseTranslation: string
  keyVocabulary: { word: string; meaning: string }[]
  level: 'beginner' | 'intermediate' | 'advanced'
}

let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI()
  }
  return openai
}

async function generateNewsScript(news: NewsItem): Promise<NewsScript> {
  const prompt = `You are a professional news writer for NHK World, creating English listening material for Japanese high school students.

The following is a Japanese news headline. Create an ENGLISH NEWS BROADCAST SCRIPT based on this news.

Japanese News:
Title: ${news.title}
Description: ${news.description}
Category: ${news.category}

Requirements for the English script:
- Length: 300-400 words (approximately 2-3 minutes when read aloud)
- Start with "Good morning" or "Good evening" and introduce the topic naturally
- Structure: Opening → Background/Context → Main details → Impact/Implications → Closing
- Use CEFR A2-B1 level vocabulary (simple English suitable for Japanese high school students)
- Explain any technical terms or cultural context that international audiences might need
- Make it sound like a professional NHK World broadcast
- Include relevant details to make the story complete and engaging
- End with a brief conclusion or future outlook

Requirements for Japanese translation:
- Provide the Japanese translation of your English script
- Natural, fluent Japanese that matches Japanese news broadcast style

Requirements for vocabulary:
- Pick 5-8 key English vocabulary words useful for university entrance exams
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

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  })

  const responseText = response.choices[0].message.content || ''

  // JSONを抽出
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse response as JSON')
  }

  const parsed = JSON.parse(jsonMatch[0])

  return {
    originalTitle: news.title,
    category: news.category,
    englishScript: parsed.englishScript,
    japaneseTranslation: parsed.japaneseTranslation,
    keyVocabulary: parsed.keyVocabulary,
    level: parsed.level || 'intermediate',
  }
}

// テスト実行
async function main() {
  const testNews: NewsItem = {
    title: 'iPad 12 Rumored to Get iPhone 17\'s A19 Chip, Breaking Apple Tradition',
    link: 'https://example.com',
    pubDate: new Date().toISOString(),
    description: 'Apple may break from tradition by giving the base iPad the same chip as the upcoming iPhone 17.',
    source: 'MacRumors',
    category: 'technology',
  }

  console.log('📝 Generating script for:', testNews.title)
  console.log('')

  const script = await generateNewsScript(testNews)

  console.log('=== English Script ===')
  console.log(script.englishScript)
  console.log('')
  console.log('=== Japanese Translation ===')
  console.log(script.japaneseTranslation)
  console.log('')
  console.log('=== Key Vocabulary ===')
  script.keyVocabulary.forEach(v => {
    console.log(`  • ${v.word}: ${v.meaning}`)
  })
  console.log('')
  console.log(`Level: ${script.level}`)

  return script
}

if (require.main === module) {
  main().catch(console.error)
}

export { generateNewsScript, type NewsScript }
