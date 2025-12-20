import { createClient } from '@/lib/supabase/server'

export interface ServiceSetting {
  service_key: string
  is_public: boolean
  maintenance_message: string | null
}

export async function getServiceSetting(serviceKey: string): Promise<ServiceSetting | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_settings')
    .select('service_key, is_public, maintenance_message')
    .eq('service_key', serviceKey)
    .single()

  if (error || !data) {
    // 設定がない場合はデフォルトで公開
    return { service_key: serviceKey, is_public: true, maintenance_message: null }
  }

  return data
}

export async function isServicePublic(serviceKey: string): Promise<boolean> {
  const setting = await getServiceSetting(serviceKey)
  return setting?.is_public ?? true
}
