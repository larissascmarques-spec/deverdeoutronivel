import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from '../config/env'

let client: SupabaseClient | null = null
let loading: Promise<SupabaseClient | null> | null = null

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (client) return client
  if (loading) return loading

  loading = import('@supabase/supabase-js').then(({ createClient }) => {
    client = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    return client
  })

  return loading
}
