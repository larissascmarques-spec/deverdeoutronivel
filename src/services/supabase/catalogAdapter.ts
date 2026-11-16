import { getSupabaseClient } from '../../lib/supabaseClient'
import type { CatalogService } from '../interfaces'
import { missingBackend, notImplemented } from './notConfigured'

export const catalogAdapter: CatalogService = {
  async listYears() {
    if (!(await getSupabaseClient())) missingBackend()
    notImplemented('O catálogo de anos')
  },
  async listSubjects() {
    if (!(await getSupabaseClient())) missingBackend()
    notImplemented('O catálogo de matérias')
  },
  async searchTopics() {
    if (!(await getSupabaseClient())) missingBackend()
    notImplemented('A busca de assuntos')
  },
}
