import { SUBJECTS, TOPIC_SUGGESTIONS, YEARS } from '../../data/demoCatalog'
import type { CatalogService } from '../interfaces'

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export const catalogDemo: CatalogService = {
  async listYears() {
    return YEARS
  },

  async listSubjects() {
    return SUBJECTS
  },

  async searchTopics({ year, subjectId, query }) {
    const needle = normalize(query)
    return TOPIC_SUGGESTIONS.filter((topic) => {
      if (topic.year !== year || topic.subjectId !== subjectId) return false
      if (!needle) return true
      return normalize(topic.label).includes(needle)
    })
  },
}
