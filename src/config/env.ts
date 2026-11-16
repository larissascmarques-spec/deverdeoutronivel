export type AppMode = 'demo' | 'production'

function trim(value: string | undefined): string {
  return value?.trim() ?? ''
}

export function getAppMode(): AppMode {
  const raw = trim(import.meta.env.VITE_APP_MODE).toLowerCase()
  if (raw === '' || raw === 'demo') return 'demo'
  return 'production'
}

export function getSupabaseUrl(): string {
  return trim(import.meta.env.VITE_SUPABASE_URL)
}

export function getSupabasePublishableKey(): string {
  return trim(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl()
  const key = getSupabasePublishableKey()
  if (!url || !key) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && key.length > 20
  } catch {
    return false
  }
}

export function isDemoMode(): boolean {
  return getAppMode() === 'demo'
}
