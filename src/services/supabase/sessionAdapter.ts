import { getSupabaseClient } from '../../lib/supabaseClient'
import type { SessionService } from '../interfaces'
import { missingBackend } from './notConfigured'

export const sessionAdapter: SessionService = {
  async getSession() {
    if (!(await getSupabaseClient())) missingBackend()
    return { authenticated: false, userId: null }
  },
}
