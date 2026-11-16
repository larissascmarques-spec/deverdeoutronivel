import type { LibraryService } from '../interfaces'
import { loadJobs, toLibraryItem } from './store'

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export const libraryDemo: LibraryService = {
  async listItems(query) {
    const needle = normalize(query ?? '')
    return loadJobs()
      .map(toLibraryItem)
      .filter((item) => {
        if (!needle) return true
        return (
          normalize(item.title).includes(needle) ||
          normalize(item.subjectName).includes(needle) ||
          String(item.year).includes(needle)
        )
      })
  },

  async getItem(id) {
    const job = loadJobs().find((item) => item.id === id)
    return job ? toLibraryItem(job) : null
  },
}
