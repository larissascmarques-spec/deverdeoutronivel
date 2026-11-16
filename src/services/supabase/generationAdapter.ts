import { getSupabaseClient } from '../../lib/supabaseClient'
import type { GenerationService } from '../interfaces'
import { missingBackend, notImplemented } from './notConfigured'

export const generationAdapter: GenerationService = {
  async createRequest() {
    if (!(await getSupabaseClient())) missingBackend()
    notImplemented('A solicitação de geração')
  },
  async getJob() {
    if (!(await getSupabaseClient())) missingBackend()
    notImplemented('O acompanhamento da geração')
  },
  async retry() {
    if (!(await getSupabaseClient())) missingBackend()
    notImplemented('A nova tentativa de geração')
  },
}
