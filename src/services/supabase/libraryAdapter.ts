import { getSupabaseClient } from '../../lib/supabaseClient'
import type { LibraryService } from '../interfaces'
import { missingBackend, notImplemented } from './notConfigured'

export const libraryAdapter: LibraryService = {
  async listItems() {
    if (!(await getSupabaseClient())) missingBackend()
    notImplemented('A biblioteca de atividades')
  },
  async getItem() {
    if (!(await getSupabaseClient())) missingBackend()
    notImplemented('O detalhe da atividade')
  },
}
