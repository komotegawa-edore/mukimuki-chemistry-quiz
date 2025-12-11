import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { DailyNewsItem } from './daily-pipeline'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabase
}

export async function saveNewsToDb(newsItems: DailyNewsItem[]): Promise<void> {
  const records = newsItems.map((item) => ({
    id: item.id,
    news_date: item.date,
    category: item.category,
    original_title: item.originalTitle,
    english_script: item.englishScript,
    japanese_translation: item.japaneseTranslation,
    key_vocabulary: item.keyVocabulary,
    level: item.level,
    audio_url: item.audioUrl,
    source: item.source,
    is_published: true,
  }))

  const { error } = await getSupabase()
    .from('mukimuki_daily_news')
    .upsert(records, { onConflict: 'id' })

  if (error) {
    throw new Error(`Failed to save news to DB: ${error.message}`)
  }

  console.log(`✅ Saved ${records.length} news items to database`)
}
